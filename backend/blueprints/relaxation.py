import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, parse_json_field, error_response
from services.ai_service import chat_completion, chat_completion_json

bp = Blueprint('relaxation', __name__, url_prefix='/api/v1/relaxation-chat')


@bp.route('/sessions', methods=['POST'])
def create_session():
    data = request.json
    user_id = data.get('userId', '')
    session_id = gen_id()

    db = get_db()
    db.execute(
        'INSERT INTO relaxation_sessions (id, user_id, created_at) VALUES (?, ?, ?)',
        (session_id, user_id, now_iso())
    )
    db.commit()
    db.close()
    return jsonify({'id': session_id})


@bp.route('/messages', methods=['POST'])
def send_message():
    data = request.json
    user_id = data.get('userId', '')
    session_id = data.get('sessionId', '')
    content = data.get('content', '')

    db = get_db()
    session = row_to_dict(db.execute(
        'SELECT * FROM relaxation_sessions WHERE id = ?', (session_id,)
    ).fetchone())
    if not session:
        db.close()
        return error_response('Session not found', 404)

    messages = parse_json_field(session['messages'], [])
    messages.append({'role': 'user', 'content': content, 'timestamp': now_iso()})

    ai_messages = [
        {'role': 'system', 'content': '你是一个温暖、善解人意的情感陪伴助手。用轻松友好的语气与用户聊天，帮助他们放松心情。如果感知到压力或焦虑，给出温和的建议。'}
    ]
    for m in messages:
        ai_messages.append({'role': m['role'], 'content': m['content']})

    reply = chat_completion(ai_messages)
    timestamp = now_iso()
    messages.append({'role': 'assistant', 'content': reply, 'timestamp': timestamp})

    mood_result = chat_completion_json([
        {'role': 'system', 'content': '分析用户情绪。返回JSON：{"mood":"relaxed|neutral|stressed|anxious","stressLevel":5}，stressLevel范围1-10'},
        {'role': 'user', 'content': content}
    ])

    mood = mood_result.get('mood', 'neutral')
    stress = mood_result.get('stressLevel', 5)

    db.execute(
        'UPDATE relaxation_sessions SET messages = ?, mood = ? WHERE id = ?',
        (json.dumps(messages), mood, session_id)
    )
    db.commit()
    db.close()

    return jsonify({
        'assistantMessage': {'content': reply, 'timestamp': timestamp},
        'mood': mood,
        'sentiment': {'stressLevel': stress},
    })


@bp.route('/suggestions/<int:stress_level>', methods=['GET'])
def get_suggestions(stress_level):
    result = chat_completion_json([
        {'role': 'system', 'content': '你是放松建议专家。返回JSON：{"suggestions":["建议1","建议2","建议3"]}'},
        {'role': 'user', 'content': f'用户压力等级为{stress_level}(1-10)，请给出3-5条放松建议。'}
    ])
    return jsonify(result)
