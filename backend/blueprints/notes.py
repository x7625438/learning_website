import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, error_response, parse_json_field
from services.ai_service import chat_completion, chat_completion_json
from datetime import datetime, timedelta

bp = Blueprint('notes', __name__, url_prefix='/api/v1/notes')

# Spaced repetition intervals (in days)
REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60]


@bp.route('', methods=['POST'])
def create_note():
    data = request.json
    note_id = gen_id()
    now = now_iso()
    next_review = (datetime.utcnow() + timedelta(days=1)).isoformat() + 'Z'

    db = get_db()
    db.execute(
        'INSERT INTO notes (id, user_id, title, content, method, cornell_data, feynman_result, tags, next_review_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        (note_id, data.get('userId', ''), data.get('title', ''),
         data.get('content', ''), data.get('method', 'free'),
         json.dumps(data.get('cornellData', {})),
         '{}', json.dumps(data.get('tags', [])),
         next_review, now, now)
    )
    db.commit()
    note = row_to_dict(db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone())
    db.close()
    return jsonify(_format_note(note))


@bp.route('/user/<user_id>', methods=['GET'])
def get_user_notes(user_id):
    db = get_db()
    rows = db.execute(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', (user_id,)
    ).fetchall()
    db.close()
    return jsonify([_format_note(row_to_dict(r)) for r in rows])


@bp.route('/<note_id>', methods=['GET'])
def get_note(note_id):
    db = get_db()
    row = db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone()
    db.close()
    if not row:
        return error_response('Note not found', 404)
    return jsonify(_format_note(row_to_dict(row)))


@bp.route('/<note_id>', methods=['PUT'])
def update_note(note_id):
    data = request.json
    now = now_iso()
    db = get_db()
    db.execute(
        'UPDATE notes SET title=?, content=?, method=?, cornell_data=?, tags=?, updated_at=? WHERE id=?',
        (data.get('title', ''), data.get('content', ''), data.get('method', 'free'),
         json.dumps(data.get('cornellData', {})), json.dumps(data.get('tags', [])),
         now, note_id)
    )
    db.commit()
    note = row_to_dict(db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone())
    db.close()
    return jsonify(_format_note(note))


@bp.route('/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    db = get_db()
    db.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


@bp.route('/<note_id>/cornell', methods=['POST'])
def cornell_guide(note_id):
    db = get_db()
    note = row_to_dict(db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone())
    if not note:
        db.close()
        return error_response('Note not found', 404)

    content = note['content'][:3000] if note['content'] else ''
    result = chat_completion_json([
        {'role': 'system', 'content': '你是康奈尔笔记法专家。根据用户的笔记内容，生成康奈尔笔记结构。返回JSON：{"cues":["线索/关键词1","线索2"],"summary":"总结概要","questions":["可以用来自测的问题1","问题2"]}'},
        {'role': 'user', 'content': f'请为以下笔记生成康奈尔笔记结构：\n\n标题：{note["title"]}\n\n内容：\n{content}'}
    ])

    db.execute('UPDATE notes SET cornell_data=?, method=?, updated_at=? WHERE id=?',
               (json.dumps(result), 'cornell', now_iso(), note_id))
    db.commit()
    db.close()
    return jsonify(result)


@bp.route('/<note_id>/feynman-chat', methods=['POST'])
def feynman_chat(note_id):
    db = get_db()
    note = row_to_dict(db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone())
    if not note:
        db.close()
        return error_response('Note not found', 404)
    db.close()

    data = request.json
    history = data.get('history', [])
    content = note['content'][:3000] if note['content'] else ''
    cornell = parse_json_field(note['cornell_data'], {})
    cues = cornell.get('cues', '')
    summary = cornell.get('summary', '')

    system_msg = (
        '你是一位费曼学习法教练。你的任务是根据用户的笔记内容，通过提问来检验用户是否真正理解了笔记中的知识。\n'
        '规则：\n'
        '- 每次只问一个问题，简洁明了\n'
        '- 根据用户的回答判断理解程度，给出简短反馈后继续追问\n'
        '- 问题应该由浅入深，从基本概念到应用\n'
        '- 如果用户回答不上来，给予提示而不是直接告诉答案\n'
        '- 用鼓励性的语气\n\n'
        f'笔记标题：{note["title"]}\n'
        f'笔记内容：\n{content}\n'
    )
    if cues:
        system_msg += f'线索/关键词：\n{cues}\n'
    if summary:
        system_msg += f'总结：\n{summary}\n'

    messages = [{'role': 'system', 'content': system_msg}] + history
    reply = chat_completion(messages, temperature=0.7)
    return jsonify({'reply': reply})


@bp.route('/user/<user_id>/review', methods=['GET'])
def get_review_notes(user_id):
    now = datetime.utcnow().isoformat() + 'Z'
    db = get_db()
    rows = db.execute(
        'SELECT * FROM notes WHERE user_id = ? AND next_review_at <= ? ORDER BY next_review_at ASC',
        (user_id, now)
    ).fetchall()
    db.close()
    return jsonify([_format_note(row_to_dict(r)) for r in rows])


@bp.route('/<note_id>/review-done', methods=['POST'])
def mark_reviewed(note_id):
    db = get_db()
    note = row_to_dict(db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone())
    if not note:
        db.close()
        return error_response('Note not found', 404)

    count = note['review_count'] + 1
    interval_idx = min(count, len(REVIEW_INTERVALS) - 1)
    next_review = (datetime.utcnow() + timedelta(days=REVIEW_INTERVALS[interval_idx])).isoformat() + 'Z'

    db.execute('UPDATE notes SET review_count=?, next_review_at=?, updated_at=? WHERE id=?',
               (count, next_review, now_iso(), note_id))
    db.commit()
    updated = row_to_dict(db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone())
    db.close()
    return jsonify(_format_note(updated))


def _format_note(n):
    return {
        'id': n['id'],
        'userId': n['user_id'],
        'title': n['title'],
        'content': n['content'],
        'method': n['method'],
        'cornellData': parse_json_field(n['cornell_data'], {}),
        'feynmanResult': parse_json_field(n['feynman_result'], {}),
        'tags': parse_json_field(n['tags'], []),
        'nextReviewAt': n['next_review_at'],
        'reviewCount': n['review_count'],
        'createdAt': n['created_at'],
        'updatedAt': n['updated_at'],
    }
