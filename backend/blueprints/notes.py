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


@bp.route('/<note_id>/feynman', methods=['POST'])
def feynman_check(note_id):
    db = get_db()
    note = row_to_dict(db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone())
    if not note:
        db.close()
        return error_response('Note not found', 404)

    content = note['content'][:3000] if note['content'] else ''
    result = chat_completion_json([
        {'role': 'system', 'content': '你是费曼学习法专家。评估用户对知识的理解程度，找出薄弱点。返回JSON：{"score":85,"level":"良好","strengths":["理解到位的部分"],"weaknesses":["需要加强的部分"],"suggestions":["改进建议"],"simplifiedExplanation":"用更简单的语言重新解释这个概念"}'},
        {'role': 'user', 'content': f'请用费曼学习法评估以下笔记的理解程度：\n\n标题：{note["title"]}\n\n内容：\n{content}'}
    ])

    db.execute('UPDATE notes SET feynman_result=?, updated_at=? WHERE id=?',
               (json.dumps(result), now_iso(), note_id))
    db.commit()
    db.close()
    return jsonify(result)


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
