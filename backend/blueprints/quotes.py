import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, error_response
from services.ai_service import chat_completion, chat_completion_json

bp = Blueprint('quotes', __name__, url_prefix='/api/v1/quotes')


@bp.route('/user/<user_id>/today', methods=['GET'])
def get_today_quote(user_id):
    today = now_iso()[:10]
    db = get_db()
    row = db.execute(
        'SELECT * FROM quotes WHERE user_id = ? AND daily_date = ? AND is_daily = 1',
        (user_id, today)
    ).fetchone()
    db.close()
    if not row:
        return jsonify(None)
    return jsonify(_format_quote(row_to_dict(row)))


@bp.route('/daily', methods=['POST'])
def generate_daily():
    data = request.json
    user_id = data.get('userId', '')
    theme = data.get('theme', '励志')
    language = data.get('language', 'zh')

    result = chat_completion_json([
        {'role': 'system', 'content': '你是金句生成专家。返回JSON：{"content":"金句内容","author":"作者(可选)","category":"分类"}'},
        {'role': 'user', 'content': f'请生成一条{theme}主题的每日金句，语言：{language}'}
    ])

    quote_id = gen_id()
    today = now_iso()[:10]
    db = get_db()
    db.execute(
        'INSERT INTO quotes (id, content, theme, language, author, category, user_id, is_daily, daily_date, created_at) VALUES (?,?,?,?,?,?,?,1,?,?)',
        (quote_id, result.get('content',''), theme, language,
         result.get('author',''), result.get('category',''), user_id, today, now_iso())
    )
    db.commit()
    quote = row_to_dict(db.execute('SELECT * FROM quotes WHERE id = ?', (quote_id,)).fetchone())
    db.close()
    return jsonify(_format_quote(quote))


@bp.route('/generate', methods=['POST'])
def generate_custom():
    data = request.json
    user_id = data.get('userId', '')
    theme = data.get('theme', '励志')
    language = data.get('language', 'zh')
    style = data.get('style', 'inspirational')

    style_map = {'inspirational': '励志', 'philosophical': '哲理', 'motivational': '激励', 'educational': '教育'}
    style_cn = style_map.get(style, style)

    result = chat_completion_json([
        {'role': 'system', 'content': '你是金句生成专家。返回JSON：{"content":"金句内容","author":"作者(可选)","category":"分类"}'},
        {'role': 'user', 'content': f'请生成一条{theme}主题、{style_cn}风格的金句，语言：{language}'}
    ])

    quote_id = gen_id()
    db = get_db()
    db.execute(
        'INSERT INTO quotes (id, content, theme, language, author, category, user_id, created_at) VALUES (?,?,?,?,?,?,?,?)',
        (quote_id, result.get('content',''), theme, language,
         result.get('author',''), result.get('category',''), user_id, now_iso())
    )
    db.commit()
    quote = row_to_dict(db.execute('SELECT * FROM quotes WHERE id = ?', (quote_id,)).fetchone())
    db.close()
    return jsonify(_format_quote(quote))


@bp.route('/user/<user_id>', methods=['GET'])
def get_user_quotes(user_id):
    db = get_db()
    rows = db.execute('SELECT * FROM quotes WHERE user_id = ? ORDER BY created_at DESC', (user_id,)).fetchall()
    db.close()
    return jsonify([_format_quote(row_to_dict(r)) for r in rows])


@bp.route('/user/<user_id>/categories', methods=['GET'])
def get_categories(user_id):
    db = get_db()
    rows = db.execute(
        'SELECT DISTINCT category FROM quotes WHERE user_id = ? AND category IS NOT NULL AND category != ""',
        (user_id,)
    ).fetchall()
    db.close()
    return jsonify({'categories': [r['category'] for r in rows]})


@bp.route('/user/<user_id>/statistics', methods=['GET'])
def get_statistics(user_id):
    db = get_db()
    rows = db.execute('SELECT * FROM quotes WHERE user_id = ?', (user_id,)).fetchall()
    db.close()
    quotes = rows_to_list(rows)
    themes = {}
    languages = {}
    for q in quotes:
        t = q.get('theme') or 'other'
        themes[t] = themes.get(t, 0) + 1
        l = q.get('language') or 'zh'
        languages[l] = languages.get(l, 0) + 1
    return jsonify({
        'totalQuotes': len(quotes),
        'themeBreakdown': themes,
        'languageBreakdown': languages,
    })


@bp.route('/user/<user_id>/random', methods=['GET'])
def get_random(user_id):
    db = get_db()
    row = db.execute(
        'SELECT * FROM quotes WHERE user_id = ? ORDER BY RANDOM() LIMIT 1',
        (user_id,)
    ).fetchone()
    db.close()
    if not row:
        return jsonify(None)
    return jsonify(_format_quote(row_to_dict(row)))


@bp.route('/<quote_id>', methods=['DELETE'])
def delete_quote(quote_id):
    db = get_db()
    db.execute('DELETE FROM quotes WHERE id = ?', (quote_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


def _format_quote(q):
    return {
        'id': q['id'],
        'content': q['content'],
        'theme': q['theme'],
        'language': q['language'],
        'author': q['author'],
        'category': q['category'],
        'userId': q['user_id'],
        'createdAt': q['created_at'],
    }
