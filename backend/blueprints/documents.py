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


@bp.route('/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    db = get_db()
    db.execute('DELETE FROM documents WHERE id = ?', (doc_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


@bp.route('/<doc_id>/chat', methods=['POST'])
def document_chat(doc_id):
    db = get_db()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    if not doc:
        return error_response('Document not found', 404)

    data = request.json or {}
    history = data.get('history', [])
    content = doc['content'][:4000] if doc['content'] else ''

    system_msg = (
        '你是一位专业的写作助手，正在与用户协作编辑文档。\n'
        '你可以：提供修改建议、改写段落、扩展内容、优化结构、修正语法等。\n'
        '当用户要求修改文档时，直接给出修改后的完整文本，不要用代码块包裹。\n'
        '回复简洁实用。\n\n'
        f'当前文档标题：{doc["title"]}\n'
        f'当前文档内容：\n{content}'
    )

    messages = [{'role': 'system', 'content': system_msg}] + history
    reply = chat_completion(messages, temperature=0.7)
    return jsonify({'reply': reply})


@bp.route('/generate', methods=['POST'])
def generate_document():
    """AI generates a full document based on user prompt, returns title + content."""
    data = request.json or {}
    prompt = data.get('prompt', '')
    user_id = data.get('userId', '')

    result = chat_completion_json([
        {'role': 'system', 'content': (
            '你是专业写作助手。根据用户需求生成一篇完整文档。\n'
            '返回JSON：{"title":"文档标题","content":"文档正文内容"}\n'
            '正文用纯文本，段落之间用换行分隔，标题用 # 标记。'
        )},
        {'role': 'user', 'content': prompt}
    ])

    title = result.get('title', '未命名文档')
    content = result.get('content', '')

    doc_id = gen_id()
    now = now_iso()
    db = get_db()
    db.execute(
        'INSERT INTO documents (id, title, content, user_id, created_at, updated_at) VALUES (?,?,?,?,?,?)',
        (doc_id, title, content, user_id, now, now)
    )
    db.commit()
    doc = row_to_dict(db.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone())
    db.close()
    return jsonify(_format_doc(doc))


def _format_doc(d):
    return {
        'id': d['id'],
        'title': d['title'],
        'content': d['content'],
        'userId': d['user_id'],
        'createdAt': d['created_at'],
        'updatedAt': d['updated_at'],
    }
