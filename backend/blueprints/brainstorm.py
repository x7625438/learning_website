import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, parse_json_field, error_response
from services.ai_service import chat_completion, chat_completion_json

bp = Blueprint('brainstorm', __name__, url_prefix='/api/v1/brainstorm')


@bp.route('/sessions', methods=['POST'])
def create_session():
    data = request.json
    user_id = data.get('userId', '')
    topic = data.get('topic', '')

    session_id = gen_id()
    db = get_db()
    db.execute(
        'INSERT INTO brainstorm_sessions (id, user_id, topic, created_at) VALUES (?,?,?,?)',
        (session_id, user_id, topic, now_iso())
    )
    db.commit()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    db.close()
    return jsonify(_format_session(session))


@bp.route('/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    db = get_db()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    db.close()
    if not session:
        return error_response('Session not found', 404)
    return jsonify(_format_session(session))


@bp.route('/sessions', methods=['GET'])
def get_sessions():
    user_id = request.args.get('userId', '')
    db = get_db()
    rows = db.execute(
        'SELECT * FROM brainstorm_sessions WHERE user_id = ? ORDER BY created_at DESC',
        (user_id,)
    ).fetchall()
    db.close()
    return jsonify([_format_session(row_to_dict(r)) for r in rows])


@bp.route('/sessions/<session_id>/start-discussion', methods=['POST'])
def start_discussion(session_id):
    db = get_db()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    if not session:
        db.close()
        return error_response('Session not found', 404)

    topic = session['topic']
    roles = ['optimist', 'pessimist', 'realist', 'creative']
    role_prompts = {
        'optimist': f'你是乐观主义者，从积极角度分析话题"{topic}"，指出机会和优势。用2-3段话表达观点。',
        'pessimist': f'你是悲观主义者，从风险角度分析话题"{topic}"，指出潜在问题和挑战。用2-3段话表达观点。',
        'realist': f'你是现实主义者，从务实角度分析话题"{topic}"，基于事实和数据给出客观评价。用2-3段话表达观点。',
        'creative': f'你是创意思考者，从创新角度分析话题"{topic}"，提出独特的想法和方案。用2-3段话表达观点。',
    }

    messages = parse_json_field(session['messages'], [])
    for role in roles:
        content = chat_completion([
            {'role': 'system', 'content': '你是头脑风暴讨论的参与者。'},
            {'role': 'user', 'content': role_prompts[role]}
        ])
        messages.append({'role': role, 'content': content, 'timestamp': now_iso()})

    db.execute(
        'UPDATE brainstorm_sessions SET messages = ? WHERE id = ?',
        (json.dumps(messages), session_id)
    )
    db.commit()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    db.close()
    return jsonify(_format_session(session))


@bp.route('/sessions/<session_id>/synthesize', methods=['POST'])
def synthesize(session_id):
    db = get_db()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    if not session:
        db.close()
        return error_response('Session not found', 404)

    messages = parse_json_field(session['messages'], [])
    discussion = '\n'.join([f"[{m['role']}]: {m['content']}" for m in messages])

    synthesis = chat_completion([
        {'role': 'system', 'content': '你是讨论总结专家，综合各方观点给出结论。'},
        {'role': 'user', 'content': f'话题：{session["topic"]}\n\n讨论内容：\n{discussion}\n\n请综合以上观点，给出总结和建议。'}
    ])

    db.execute(
        'UPDATE brainstorm_sessions SET synthesis = ?, status = "completed" WHERE id = ?',
        (synthesis, session_id)
    )
    db.commit()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    db.close()
    return jsonify(_format_session(session))


@bp.route('/sessions/<session_id>/deep-dive', methods=['POST'])
def deep_dive(session_id):
    data = request.json or {}
    focus_point = data.get('focusPoint', '')

    db = get_db()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    if not session:
        db.close()
        return error_response('Session not found', 404)

    messages = parse_json_field(session['messages'], [])
    roles = ['optimist', 'pessimist', 'realist', 'creative']

    for role in roles:
        content = chat_completion([
            {'role': 'system', 'content': f'你是头脑风暴中的{role}角色，针对焦点深入讨论。'},
            {'role': 'user', 'content': f'话题：{session["topic"]}\n焦点：{focus_point}\n请从你的角色视角深入分析。'}
        ])
        messages.append({'role': role, 'content': content, 'timestamp': now_iso()})

    db.execute(
        'UPDATE brainstorm_sessions SET messages = ? WHERE id = ?',
        (json.dumps(messages), session_id)
    )
    db.commit()
    session = row_to_dict(db.execute('SELECT * FROM brainstorm_sessions WHERE id = ?', (session_id,)).fetchone())
    db.close()
    return jsonify(_format_session(session))


@bp.route('/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    db = get_db()
    db.execute('DELETE FROM brainstorm_sessions WHERE id = ?', (session_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


def _format_session(s):
    return {
        'id': s['id'],
        'userId': s['user_id'],
        'topic': s['topic'],
        'messages': parse_json_field(s['messages'], []),
        'synthesis': s['synthesis'],
        'recommendation': s['recommendation'],
        'status': s['status'],
    }
