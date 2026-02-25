import os
import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, parse_json_field, error_response
from utils.file_parser import extract_text_from_file
from services.ai_service import chat_completion, chat_completion_json
import config

bp = Blueprint('books', __name__, url_prefix='/api/v1/books')


@bp.route('/upload', methods=['POST'])
def upload_book():
    if 'book' not in request.files:
        return error_response('No file uploaded')

    file = request.files['book']
    title = request.form.get('title', file.filename)
    author = request.form.get('author', '')
    user_id = request.form.get('userId', '')

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.txt', '.pdf', '.docx'):
        return error_response('Unsupported file type')

    file_path = os.path.join(config.UPLOAD_FOLDER, gen_id() + ext)
    file.save(file_path)

    try:
        content = extract_text_from_file(file_path)
    except Exception as e:
        return error_response(f'Failed to parse file: {str(e)}')
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    book_id = gen_id()
    now = now_iso()
    db = get_db()
    db.execute(
        'INSERT INTO books (id, title, author, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (book_id, title, author, content, user_id, now, now)
    )
    db.commit()
    book = row_to_dict(db.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone())
    db.close()
    return jsonify(_format_book(book))


@bp.route('', methods=['POST'])
def create_book():
    data = request.json
    book_id = gen_id()
    now = now_iso()
    db = get_db()
    db.execute(
        'INSERT INTO books (id, title, author, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (book_id, data.get('title'), data.get('author', ''), data.get('content', ''), data.get('userId', ''), now, now)
    )
    db.commit()
    book = row_to_dict(db.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone())
    db.close()
    return jsonify(_format_book(book))


@bp.route('/user/<user_id>', methods=['GET'])
def get_user_books(user_id):
    db = get_db()
    rows = db.execute('SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC', (user_id,)).fetchall()
    db.close()
    return jsonify([_format_book(row_to_dict(r)) for r in rows])


@bp.route('/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    db = get_db()
    db.execute('DELETE FROM books WHERE id = ?', (book_id,))
    db.execute('DELETE FROM reading_progress WHERE book_id = ?', (book_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


@bp.route('/<book_id>/summary', methods=['POST'])
def generate_summary(book_id):
    data = request.json or {}
    db = get_db()
    book = row_to_dict(db.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone())
    db.close()
    if not book:
        return error_response('Book not found', 404)

    content_preview = book['content'][:3000] if book['content'] else ''
    style = data.get('style', 'concise')
    max_len = data.get('maxLength', 500)

    summary = chat_completion([
        {'role': 'system', 'content': '你是一个专业的书籍摘要助手。'},
        {'role': 'user', 'content': f'请为以下书籍生成{style}风格的摘要，不超过{max_len}字：\n\n书名：{book["title"]}\n作者：{book["author"]}\n\n内容节选：\n{content_preview}'}
    ])

    db = get_db()
    db.execute('UPDATE books SET summary = ? WHERE id = ?', (summary, book_id))
    db.commit()
    db.close()
    return jsonify({'summary': summary})


@bp.route('/<book_id>/sq3r-guide', methods=['POST'])
def sq3r_guide(book_id):
    data = request.json or {}
    chapter_title = data.get('chapterTitle', '')

    db = get_db()
    book = row_to_dict(db.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone())
    db.close()
    if not book:
        return error_response('Book not found', 404)

    content_preview = book['content'][:2000] if book['content'] else ''
    result = chat_completion_json([
        {'role': 'system', 'content': '你是SQ3R阅读法专家。返回JSON格式：{"steps": [{"step": "survey|question|read|recite|review", "title": "步骤标题", "content": "具体指导内容", "completed": false}]}'},
        {'role': 'user', 'content': f'为书籍《{book["title"]}》的章节"{chapter_title}"生成SQ3R阅读指导。\n\n内容节选：\n{content_preview}'}
    ])
    return jsonify(result)


@bp.route('/<book_id>/progress/<user_id>', methods=['GET'])
def get_progress(book_id, user_id):
    db = get_db()
    row = db.execute(
        'SELECT * FROM reading_progress WHERE book_id = ? AND user_id = ?',
        (book_id, user_id)
    ).fetchone()
    db.close()
    if not row:
        return jsonify({
            'bookId': book_id, 'userId': user_id,
            'currentChapter': 1, 'totalChapters': 1,
            'completedSteps': [], 'comprehensionScore': 0
        })
    p = row_to_dict(row)
    return jsonify({
        'bookId': p['book_id'], 'userId': p['user_id'],
        'currentChapter': p['current_chapter'],
        'totalChapters': p['total_chapters'],
        'completedSteps': parse_json_field(p['completed_steps'], []),
        'comprehensionScore': p['comprehension_score'] or 0
    })


@bp.route('/<book_id>/progress/<user_id>/complete', methods=['POST'])
def complete_step(book_id, user_id):
    data = request.json or {}
    step_type = data.get('stepType', '')

    db = get_db()
    row = db.execute(
        'SELECT * FROM reading_progress WHERE book_id = ? AND user_id = ?',
        (book_id, user_id)
    ).fetchone()

    if row:
        p = row_to_dict(row)
        steps = parse_json_field(p['completed_steps'], [])
        steps.append({'step': step_type, 'completed': True, 'userResponse': data.get('userResponse', '')})
        db.execute(
            'UPDATE reading_progress SET completed_steps = ?, current_chapter = ? WHERE book_id = ? AND user_id = ?',
            (json.dumps(steps), p['current_chapter'], book_id, user_id)
        )
    else:
        pid = gen_id()
        steps = [{'step': step_type, 'completed': True, 'userResponse': data.get('userResponse', '')}]
        db.execute(
            'INSERT INTO reading_progress (id, book_id, user_id, completed_steps) VALUES (?, ?, ?, ?)',
            (pid, book_id, user_id, json.dumps(steps))
        )

    db.commit()
    row = db.execute(
        'SELECT * FROM reading_progress WHERE book_id = ? AND user_id = ?',
        (book_id, user_id)
    ).fetchone()
    db.close()
    p = row_to_dict(row)
    return jsonify({
        'bookId': p['book_id'], 'userId': p['user_id'],
        'currentChapter': p['current_chapter'],
        'totalChapters': p['total_chapters'],
        'completedSteps': parse_json_field(p['completed_steps'], []),
        'comprehensionScore': p['comprehension_score'] or 0
    })


@bp.route('/<book_id>/author-agent', methods=['POST'])
def create_author_agent(book_id):
    db = get_db()
    book = row_to_dict(db.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone())
    db.close()
    if not book:
        return error_response('Book not found', 404)

    content_preview = book['content'][:2000] if book['content'] else ''
    response = chat_completion([
        {'role': 'system', 'content': f'你现在扮演《{book["title"]}》的作者{book["author"]}。基于书籍内容回答读者的问题，保持作者的语气和风格。'},
        {'role': 'user', 'content': f'书籍内容节选：\n{content_preview}\n\n请以作者身份做一个简短的自我介绍，并欢迎读者提问。'}
    ])
    return jsonify({'response': response, 'bookId': book_id})


@bp.route('/<book_id>/author-chat', methods=['POST'])
def author_chat(book_id):
    data = request.json or {}
    message = data.get('message', '')
    history = data.get('conversationHistory', [])

    db = get_db()
    book = row_to_dict(db.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone())
    db.close()
    if not book:
        return error_response('Book not found', 404)

    content_preview = book['content'][:2000] if book['content'] else ''
    messages = [
        {'role': 'system', 'content': f'你现在扮演《{book["title"]}》的作者{book["author"]}。基于书籍内容回答问题。\n\n书籍内容节选：\n{content_preview}'}
    ]
    for h in history:
        messages.append({'role': h.get('role', 'user'), 'content': h.get('content', '')})
    messages.append({'role': 'user', 'content': message})

    response = chat_completion(messages)
    return jsonify({'response': response})


def _format_book(b):
    return {
        'id': b['id'],
        'title': b['title'],
        'author': b['author'],
        'content': b['content'],
        'summary': b['summary'],
        'userId': b['user_id'],
        'createdAt': b['created_at'],
        'updatedAt': b['updated_at'],
    }
