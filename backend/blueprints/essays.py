import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, parse_json_field, error_response
from services.ai_service import chat_completion_json

bp = Blueprint('essays', __name__, url_prefix='/api/v1/essays')


@bp.route('', methods=['POST'])
def submit_essay():
    data = request.json
    essay_id = gen_id()
    db = get_db()
    db.execute(
        'INSERT INTO essays (id, user_id, title, content, subject, grade, created_at) VALUES (?,?,?,?,?,?,?)',
        (essay_id, data.get('userId',''), data.get('title',''),
         data.get('content',''), data.get('subject',''), data.get('grade',''), now_iso())
    )
    db.commit()
    essay = row_to_dict(db.execute('SELECT * FROM essays WHERE id = ?', (essay_id,)).fetchone())
    db.close()
    return jsonify(_format_essay(essay))


@bp.route('/user/<user_id>', methods=['GET'])
def get_user_essays(user_id):
    db = get_db()
    rows = db.execute('SELECT * FROM essays WHERE user_id = ? ORDER BY created_at DESC', (user_id,)).fetchall()
    db.close()
    return jsonify([_format_essay(row_to_dict(r)) for r in rows])


@bp.route('/<essay_id>/feedback', methods=['GET'])
def get_feedback(essay_id):
    db = get_db()
    essay = row_to_dict(db.execute('SELECT * FROM essays WHERE id = ?', (essay_id,)).fetchone())
    if not essay:
        db.close()
        return error_response('Essay not found', 404)

    # Return cached feedback if available
    if essay['feedback']:
        db.close()
        return jsonify(parse_json_field(essay['feedback'], {}))

    content = essay['content'][:3000] if essay['content'] else ''
    feedback = chat_completion_json([
        {'role': 'system', 'content': '你是作文批改专家。返回JSON：{"analysis":{"structureScore":80,"languageScore":85,"contentScore":75,"overallScore":80,"structureAnalysis":"结构分析","languageAnalysis":"语言分析","contentAnalysis":"内容分析"},"improvementPoints":[{"category":"分类","issue":"问题","suggestion":"建议","priority":"high|medium|low"}],"optimizedExamples":[{"originalText":"原文","optimizedText":"优化","explanation":"说明","improvementType":"类型"}],"strengths":["优点"],"areasForImprovement":["待改进"],"overallComment":"总评"}'},
        {'role': 'user', 'content': f'请批改以下作文：\n\n标题：{essay["title"]}\n学科：{essay["subject"] or "语文"}\n年级：{essay["grade"] or "高中"}\n\n内容：\n{content}'}
    ])

    db.execute('UPDATE essays SET feedback = ? WHERE id = ?', (json.dumps(feedback), essay_id))
    db.commit()
    db.close()
    return jsonify(feedback)


def _format_essay(e):
    return {
        'id': e['id'],
        'userId': e['user_id'],
        'title': e['title'],
        'content': e['content'],
        'subject': e['subject'],
        'grade': e['grade'],
        'createdAt': e['created_at'],
    }
