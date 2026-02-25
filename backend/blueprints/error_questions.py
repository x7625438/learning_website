import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, parse_json_field, error_response
from services.ai_service import chat_completion_json

bp = Blueprint('error_questions', __name__, url_prefix='/api/v1/error-questions')


@bp.route('', methods=['POST'])
def add_error_question():
    data = request.json
    eq_id = gen_id()
    db = get_db()
    db.execute(
        'INSERT INTO error_questions (id, user_id, question, user_answer, correct_answer, explanation, subject, difficulty, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        (eq_id, data.get('userId',''), data.get('question',''),
         data.get('userAnswer',''), data.get('correctAnswer',''),
         data.get('explanation',''), data.get('subject',''),
         data.get('difficulty','medium'), now_iso())
    )
    db.commit()
    row = row_to_dict(db.execute('SELECT * FROM error_questions WHERE id = ?', (eq_id,)).fetchone())
    db.close()
    return jsonify(_format_eq(row))


@bp.route('/<eq_id>', methods=['DELETE'])
def delete_error_question(eq_id):
    db = get_db()
    db.execute('DELETE FROM error_questions WHERE id = ?', (eq_id,))
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


@bp.route('/user/<user_id>', methods=['GET'])
def get_user_errors(user_id):
    db = get_db()
    rows = db.execute(
        'SELECT * FROM error_questions WHERE user_id = ? ORDER BY created_at DESC',
        (user_id,)
    ).fetchall()
    db.close()
    return jsonify([_format_eq(row_to_dict(r)) for r in rows])


@bp.route('/user/<user_id>/analysis', methods=['GET'])
def get_analysis(user_id):
    db = get_db()
    rows = db.execute(
        'SELECT * FROM error_questions WHERE user_id = ?', (user_id,)
    ).fetchall()
    db.close()

    errors = rows_to_list(rows)
    subject_breakdown = {}
    difficulty_breakdown = {}
    for e in errors:
        s = e.get('subject') or 'other'
        subject_breakdown[s] = subject_breakdown.get(s, 0) + 1
        d = e.get('difficulty') or 'medium'
        difficulty_breakdown[d] = difficulty_breakdown.get(d, 0) + 1

    sorted_subjects = sorted(subject_breakdown.items(), key=lambda x: x[1], reverse=True)
    weakest = [s[0] for s in sorted_subjects[:3]]

    return jsonify({
        'totalErrors': len(errors),
        'subjectBreakdown': subject_breakdown,
        'difficultyBreakdown': difficulty_breakdown,
        'weakestSubjects': weakest,
    })


@bp.route('/user/<user_id>/weak-subjects', methods=['GET'])
def get_weak_subjects(user_id):
    db = get_db()
    rows = db.execute(
        'SELECT subject, COUNT(*) as cnt, AVG(mastery_level) as avg_mastery FROM error_questions WHERE user_id = ? GROUP BY subject',
        (user_id,)
    ).fetchall()
    db.close()

    result = []
    for r in rows:
        result.append({
            'subject': r['subject'] or 'other',
            'averageMastery': round(r['avg_mastery'] or 0, 2),
            'errorCount': r['cnt'],
        })
    result.sort(key=lambda x: x['averageMastery'])
    return jsonify(result)


@bp.route('/user/<user_id>/generate-practice', methods=['POST'])
def generate_practice(user_id):
    data = request.json or {}
    count = data.get('count', 3)

    db = get_db()
    rows = db.execute(
        'SELECT * FROM error_questions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        (user_id,)
    ).fetchall()
    db.close()

    errors = rows_to_list(rows)
    if not errors:
        return jsonify([])

    error_summary = '\n'.join([
        f"- 学科:{e['subject']}，题目:{e['question'][:50]}"
        for e in errors[:5]
    ])

    result = chat_completion_json([
        {'role': 'system', 'content': f'你是出题专家。根据学生的错题记录生成练习题。返回JSON数组：[{{"question":"题目","correctAnswer":"答案","explanation":"解析","hints":["提示"],"subject":"学科","difficulty":"easy|medium|hard","basedOnErrorId":""}}]'},
        {'role': 'user', 'content': f'根据以下错题记录生成{count}道练习题：\n{error_summary}'}
    ])

    if isinstance(result, list):
        for i, item in enumerate(result):
            if i < len(errors):
                item['basedOnErrorId'] = errors[i]['id']
        return jsonify(result)
    return jsonify([])


def _format_eq(e):
    return {
        'id': e['id'],
        'userId': e['user_id'],
        'question': e['question'],
        'userAnswer': e['user_answer'],
        'correctAnswer': e['correct_answer'],
        'explanation': e['explanation'],
        'subject': e['subject'],
        'difficulty': e['difficulty'],
        'masteryLevel': e['mastery_level'],
        'createdAt': e['created_at'],
    }
