import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, parse_json_field, error_response
from services.ai_service import chat_completion_json

bp = Blueprint('resources', __name__, url_prefix='/api/v1/resources')


@bp.route('/search', methods=['POST'])
def search_resources():
    data = request.json
    query = data.get('query', '')
    user_id = data.get('userId', '')

    result = chat_completion_json([
        {'role': 'system', 'content': '你是学习资源搜索专家。返回JSON：{"searchStrategy":"搜索策略说明","resources":[{"id":"uuid","title":"标题","description":"描述","url":"https://example.com","source":"来源","contentType":"article|paper|book|video|website","relevanceScore":0.9,"credibilityScore":0.8,"tags":["标签"]}],"categorizedResources":{"文章":[],"视频":[]}}'},
        {'role': 'user', 'content': f'请为以下学习需求推荐资源：{query}'}
    ])

    resources = result.get('resources', [])
    for r in resources:
        if not r.get('id'):
            r['id'] = gen_id()

    categorized = result.get('categorizedResources', {})
    search_id = gen_id()

    db = get_db()
    db.execute(
        'INSERT INTO resource_searches (id, user_id, query, search_strategy, resources, categorized_resources, total_results, created_at) VALUES (?,?,?,?,?,?,?,?)',
        (search_id, user_id, query,
         result.get('searchStrategy', ''),
         json.dumps(resources),
         json.dumps(categorized),
         len(resources), now_iso())
    )
    db.commit()
    db.close()

    return jsonify({
        'id': search_id,
        'userId': user_id,
        'query': query,
        'searchStrategy': result.get('searchStrategy', ''),
        'resources': resources,
        'categorizedResources': categorized,
        'totalResults': len(resources),
        'createdAt': now_iso(),
    })


@bp.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    limit = request.args.get('limit', 20, type=int)
    db = get_db()
    rows = db.execute(
        'SELECT * FROM resource_searches WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        (user_id, limit)
    ).fetchall()
    db.close()

    result = []
    for r in rows:
        s = row_to_dict(r)
        result.append({
            'id': s['id'],
            'userId': s['user_id'],
            'query': s['query'],
            'searchStrategy': s['search_strategy'],
            'resources': parse_json_field(s['resources'], []),
            'categorizedResources': parse_json_field(s['categorized_resources'], {}),
            'totalResults': s['total_results'],
            'createdAt': s['created_at'],
        })
    return jsonify(result)


@bp.route('/<resource_id>/format', methods=['POST'])
def format_resource(resource_id):
    data = request.json or {}
    fmt = data.get('format', 'markdown')

    db = get_db()
    rows = db.execute('SELECT * FROM resource_searches', ()).fetchall()
    db.close()

    target = None
    for row in rows:
        resources = parse_json_field(row['resources'], [])
        for r in resources:
            if r.get('id') == resource_id:
                target = r
                break
        if target:
            break

    if not target:
        return error_response('Resource not found', 404)

    formatted = f"# {target.get('title','')}\n\n"
    formatted += f"**来源**: {target.get('source','')}\n"
    formatted += f"**链接**: {target.get('url','')}\n\n"
    formatted += target.get('description', '')

    if fmt == 'plain':
        formatted = formatted.replace('# ', '').replace('**', '')
    elif fmt == 'json':
        formatted = json.dumps(target, ensure_ascii=False, indent=2)
    elif fmt == 'citation':
        authors = ', '.join(target.get('authors', [])) or '未知作者'
        formatted = f"{authors}. {target.get('title','')}. {target.get('source','')}. {target.get('publishDate','')}"

    return jsonify({'content': formatted})
