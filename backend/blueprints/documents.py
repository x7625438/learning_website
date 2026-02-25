import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, error_response
from services.ai_service import chat_completion, chat_completion_json

bp = Blueprint('documents', __name__, url_prefix='/api/v1/documents')


@bp.route('', methods=['POST'])
def create_document():
    data = request.json
    doc_id = gen_id()
    now = now_iso()
    db = get_db()
    db.execute(
        'INSERT INTO documents (id, title, content, user_id, created_at, updated_at) VALUES (?,?,?,?,?,?)',
        (doc_id, data.get('title',''), data.get('content',''), data.get('userId',''), now, now)
    )
    db.commit()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    return jsonify(_format_doc(doc))


@bp.route('/user/<user_id>', methods=['GET'])
def get_user_documents(user_id):
    db = get_db()
    rows = db.execute('SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC', (user_id,)).fetchall()
    db.close()
    return jsonify([_format_doc(row_to_dict(r)) for r in rows])


@bp.route('/<doc_id>', methods=['GET'])
def get_document(doc_id):
    db = get_db()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    if not doc:
        return error_response('Document not found', 404)
    return jsonify(_format_doc(doc))


@bp.route('/<doc_id>', methods=['PUT'])
def update_document(doc_id):
    data = request.json
    now = now_iso()
    db = get_db()
    db.execute(
        'UPDATE documents SET title = ?, content = ?, updated_at = ? WHERE id = ?',
        (data.get('title',''), data.get('content',''), now, doc_id)
    )
    db.commit()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    return jsonify(_format_doc(doc))


@bp.route('/<doc_id>/assess', methods=['POST'])
def assess_quality(doc_id):
    data = request.json or {}
    context = data.get('context', '')

    db = get_db()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    if not doc:
        return error_response('Document not found', 404)

    content = doc['content'][:3000] if doc['content'] else ''
    result = chat_completion_json([
        {'role': 'system', 'content': '你是文档质量评估专家。返回JSON：{"overallScore":85,"dimensions":{"structure":80,"language":85,"logic":90,"completeness":75},"strengths":["优点"],"weaknesses":["不足"],"recommendations":["建议"],"detailedFeedback":"详细反馈"}'},
        {'role': 'user', 'content': f'请评估以下文档质量：\n\n标题：{doc["title"]}\n上下文：{context}\n\n内容：\n{content}'}
    ])
    return jsonify(result)


@bp.route('/<doc_id>/expand', methods=['POST'])
def expand_section(doc_id):
    data = request.json or {}
    section = data.get('section', '')
    context = data.get('context', '')

    db = get_db()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    if not doc:
        return error_response('Document not found', 404)

    expanded = chat_completion([
        {'role': 'system', 'content': '你是内容扩展专家，帮助用户扩展文档的特定部分。'},
        {'role': 'user', 'content': f'文档标题：{doc["title"]}\n上下文：{context}\n\n请扩展以下部分：\n{section}'}
    ])
    return jsonify({'expandedContent': expanded})


@bp.route('/suggestions', methods=['POST'])
def get_suggestions():
    data = request.json or {}
    content = data.get('content', '')
    suggestion_type = data.get('suggestionType', 'structure')
    context = data.get('context', '')

    if suggestion_type == 'structure':
        prompt = f'请为以下文档提供结构优化建议：\n\n背景：{context}\n\n内容：\n{content}'
    else:
        prompt = f'请为以下文档提供改进建议：\n\n背景：{context}\n\n内容：\n{content}'

    result = chat_completion_json([
        {'role': 'system', 'content': '你是文档改进建议专家。返回JSON：{"suggestions":["建议1","建议2"],"explanation":"说明"}'},
        {'role': 'user', 'content': prompt}
    ])
    return jsonify(result)


@bp.route('/<doc_id>/suggestions/structure', methods=['POST'])
def get_structure_suggestions(doc_id):
    data = request.json or {}
    context = data.get('context', '')

    db = get_db()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    if not doc:
        return error_response('Document not found', 404)

    content = doc['content'][:3000] if doc['content'] else ''
    result = chat_completion_json([
        {'role': 'system', 'content': '你是文档结构优化专家。返回JSON：{"suggestions":["建议1","建议2"],"explanation":"说明"}'},
        {'role': 'user', 'content': f'请为以下文档提供结构优化建议：\n\n标题：{doc["title"]}\n背景：{context}\n\n内容：\n{content}'}
    ])
    return jsonify(result)


@bp.route('/<doc_id>/suggestions/improvement', methods=['POST'])
def get_improvement_suggestions(doc_id):
    data = request.json or {}
    context = data.get('context', '')

    db = get_db()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    if not doc:
        return error_response('Document not found', 404)

    content = doc['content'][:3000] if doc['content'] else ''
    result = chat_completion_json([
        {'role': 'system', 'content': '你是文档改进专家。返回JSON：{"suggestions":["建议1","建议2"],"explanation":"说明"}'},
        {'role': 'user', 'content': f'请为以下文档提供内容改进建议，包括语言表达、逻辑连贯性、论证力度等方面：\n\n标题：{doc["title"]}\n背景：{context}\n\n内容：\n{content}'}
    ])
    return jsonify(result)


def _format_doc(d):
    return {
        'id': d['id'],
        'title': d['title'],
        'content': d['content'],
        'userId': d['user_id'],
        'createdAt': d['created_at'],
        'updatedAt': d['updated_at'],
    }
