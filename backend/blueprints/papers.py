import os
import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, parse_json_field, error_response
from utils.file_parser import extract_text_from_file
from services.ai_service import chat_completion, chat_completion_json, translate_long_text
import config

bp = Blueprint('papers', __name__, url_prefix='/api/v1/papers')


@bp.route('/upload', methods=['POST'])
def upload_paper():
    if 'pdf' not in request.files:
        return error_response('No file uploaded')

    file = request.files['pdf']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != '.pdf':
        return error_response('Only PDF files are supported')

    file_path = os.path.join(config.UPLOAD_FOLDER, gen_id() + ext)
    file.save(file_path)

    try:
        content = extract_text_from_file(file_path)
    except Exception as e:
        return error_response(f'Failed to parse PDF: {str(e)}')
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    title = file.filename.rsplit('.', 1)[0]
    abstract = content[:500] if content else ''
    return jsonify({'title': title, 'abstract': abstract, 'content': content})


@bp.route('', methods=['POST'])
def create_paper():
    data = request.json
    paper_id = gen_id()
    now = now_iso()
    db = get_db()
    db.execute(
        'INSERT INTO papers (id, title, authors, abstract, content, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (paper_id, data.get('title'), json.dumps(data.get('authors', [])),
         data.get('abstract', ''), data.get('content', ''), data.get('userId', ''), now, now)
    )
    db.commit()
    paper = row_to_dict(db.execute('SELECT * FROM papers WHERE id = ?', (paper_id,)).fetchone())
    db.close()
    return jsonify(_format_paper(paper))


@bp.route('', methods=['GET'])
def get_papers():
    user_id = request.args.get('userId', '')
    db = get_db()
    rows = db.execute('SELECT * FROM papers WHERE user_id = ? ORDER BY created_at DESC', (user_id,)).fetchall()
    db.close()
    return jsonify([_format_paper(row_to_dict(r)) for r in rows])


@bp.route('/<paper_id>/translate', methods=['POST'])
def translate_paper(paper_id):
    db = get_db()
    paper = row_to_dict(db.execute('SELECT * FROM papers WHERE id = ?', (paper_id,)).fetchone())
    if not paper:
        db.close()
        return error_response('Paper not found', 404)

    content = paper['content'] or ''
    translated = translate_long_text(content)

    db.execute('UPDATE papers SET translated_content = ? WHERE id = ?', (translated, paper_id))
    db.commit()
    db.close()
    return jsonify({'translatedContent': translated})


@bp.route('/<paper_id>/question', methods=['POST'])
def paper_question(paper_id):
    data = request.json or {}
    question = data.get('question', '')
    context = data.get('context', '')

    db = get_db()
    paper = row_to_dict(db.execute('SELECT * FROM papers WHERE id = ?', (paper_id,)).fetchone())
    db.close()
    if not paper:
        return error_response('Paper not found', 404)

    content = paper['content'][:3000] if paper['content'] else ''
    answer = chat_completion([
        {'role': 'system', 'content': '你是学术论文问答助手，基于论文内容准确回答问题。'},
        {'role': 'user', 'content': f'论文标题：{paper["title"]}\n\n论文内容：\n{content}\n\n额外上下文：{context}\n\n问题：{question}'}
    ])
    return jsonify({'answer': answer})


@bp.route('/<paper_id>/terms', methods=['POST'])
def identify_terms(paper_id):
    data = request.json or {}
    text = data.get('text', '')

    db = get_db()
    paper = row_to_dict(db.execute('SELECT * FROM papers WHERE id = ?', (paper_id,)).fetchone())
    db.close()
    if not paper:
        return error_response('Paper not found', 404)

    result = chat_completion_json([
        {'role': 'system', 'content': '你是学术术语注释专家。返回JSON格式：{"annotations": [{"term": "术语", "explanation": "解释", "context": "上下文"}]}'},
        {'role': 'user', 'content': f'请识别并注释以下文本中的专业术语：\n\n{text}'}
    ])
    return jsonify(result)


@bp.route('/<paper_id>/summary', methods=['POST'])
def paper_summary(paper_id):
    db = get_db()
    paper = row_to_dict(db.execute('SELECT * FROM papers WHERE id = ?', (paper_id,)).fetchone())
    db.close()
    if not paper:
        return error_response('Paper not found', 404)

    content = paper['content'][:3000] if paper['content'] else ''
    result = chat_completion_json([
        {'role': 'system', 'content': '你是学术论文摘要专家。返回JSON格式：{"overview":"总览","keyFindings":["发现1"],"methodology":"方法论","conclusions":"结论","significance":"意义"}'},
        {'role': 'user', 'content': f'请为以下论文生成结构化摘要：\n\n标题：{paper["title"]}\n\n内容：\n{content}'}
    ])
    return jsonify(result)


def _format_paper(p):
    return {
        'id': p['id'],
        'title': p['title'],
        'authors': parse_json_field(p['authors'], []),
        'abstract': p['abstract'],
        'content': p['content'],
        'translatedContent': p['translated_content'],
        'createdAt': p['created_at'],
        'updatedAt': p['updated_at'],
    }
