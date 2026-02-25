import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, parse_json_field, error_response
from services.ai_service import chat_completion, chat_completion_json

bp = Blueprint('problems', __name__, url_prefix='/api/v1/problems')


@bp.route('/analyze', methods=['POST'])
def analyze_problem():
    data = request.json
    question = data.get('question', '')
    subject = data.get('subject', '')

    result = chat_completion_json([
        {'role': 'system', 'content': '你是题目分析专家。返回JSON：{"problemType":"题目类型","difficulty":"easy|medium|hard","requiredConcepts":["概念"],"estimatedTime":15,"solutionApproach":["步骤"]}'},
        {'role': 'user', 'content': f'学科：{subject}\n题目：{question}'}
    ])
    return jsonify(result)


@bp.route('/start-session', methods=['POST'])
def start_session():
    data = request.json
    user_id = data.get('userId', '')
    question = data.get('question', '')
    subject = data.get('subject', '')

    analysis = chat_completion_json([
        {'role': 'system', 'content': '你是题目分析专家。返回JSON：{"problemType":"类型","difficulty":"easy|medium|hard","requiredConcepts":["概念"],"estimatedTime":15,"solutionApproach":["步骤"]}'},
        {'role': 'user', 'content': f'学科：{subject}\n题目：{question}'}
    ])

    session_id = gen_id()
    db = get_db()
    db.execute(
        'INSERT INTO problem_sessions (id, user_id, question, subject, analysis, created_at) VALUES (?,?,?,?,?,?)',
        (session_id, user_id, question, subject, json.dumps(analysis), now_iso())
    )
    db.commit()
    db.close()

    return jsonify({
        'id': session_id,
        'problemId': session_id,
        'completed': False,
        'currentStep': 0,
        'userProgress': [],
    })


@bp.route('/process-step', methods=['POST'])
def process_step():
    data = request.json
    session_id = data.get('sessionId', '')
    user_input = data.get('userInput', '')

    db = get_db()
    session = row_to_dict(db.execute('SELECT * FROM problem_sessions WHERE id = ?', (session_id,)).fetchone())
    if not session:
        db.close()
        return error_response('Session not found', 404)

    progress = parse_json_field(session['user_progress'], [])
    step = session['current_step'] + 1

    feedback = chat_completion([
        {'role': 'system', 'content': '你是解题引导老师，评估学生的解题步骤，给出反馈。'},
        {'role': 'user', 'content': f'题目：{session["question"]}\n学科：{session["subject"]}\n当前步骤：{step}\n学生回答：{user_input}\n\n请评估并给出反馈。'}
    ])

    progress.append({
        'stepNumber': step, 'userInput': user_input,
        'timestamp': now_iso(), 'needsHint': False
    })
    db.execute(
        'UPDATE problem_sessions SET current_step = ?, user_progress = ? WHERE id = ?',
        (step, json.dumps(progress), session_id)
    )
    db.commit()
    db.close()
    return jsonify({'feedback': feedback, 'shouldProceed': True})


@bp.route('/hint', methods=['POST'])
def get_hint():
    data = request.json
    session_id = data.get('sessionId', '')

    db = get_db()
    session = row_to_dict(db.execute('SELECT * FROM problem_sessions WHERE id = ?', (session_id,)).fetchone())
    db.close()
    if not session:
        return error_response('Session not found', 404)

    result = chat_completion_json([
        {'role': 'system', 'content': '你是解题提示专家。返回JSON：{"stepNumber":1,"hintLevel":"gentle|moderate|strong","content":"提示内容","revealsSolution":false}'},
        {'role': 'user', 'content': f'题目：{session["question"]}\n学科：{session["subject"]}\n当前步骤：{session["current_step"]}\n请给出一个温和的提示。'}
    ])
    return jsonify(result)


@bp.route('/complete-session', methods=['POST'])
def complete_session():
    data = request.json
    session_id = data.get('sessionId', '')

    db = get_db()
    db.execute(
        'UPDATE problem_sessions SET completed = 1 WHERE id = ?',
        (session_id,)
    )
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


@bp.route('/active-session/<user_id>', methods=['GET'])
def get_active_session(user_id):
    db = get_db()
    row = db.execute(
        'SELECT * FROM problem_sessions WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC LIMIT 1',
        (user_id,)
    ).fetchone()
    db.close()
    if not row:
        return jsonify(None)
    s = row_to_dict(row)
    return jsonify({
        'id': s['id'],
        'problemId': s['id'],
        'completed': bool(s['completed']),
        'currentStep': s['current_step'],
        'userProgress': parse_json_field(s['user_progress'], []),
    })


@bp.route('/history/<user_id>', methods=['GET'])
def get_history(user_id):
    db = get_db()
    rows = db.execute(
        'SELECT * FROM problem_sessions WHERE user_id = ? ORDER BY created_at DESC',
        (user_id,)
    ).fetchall()
    db.close()

    problems = []
    sessions = []
    summaries = []
    for r in rows:
        s = row_to_dict(r)
        analysis = parse_json_field(s['analysis'], {})
        problems.append({
            'id': s['id'], 'question': s['question'],
            'subject': s['subject'],
            'difficulty': analysis.get('difficulty', 'medium'),
            'problemType': analysis.get('problemType', ''),
            'createdAt': s['created_at'],
        })
        progress = parse_json_field(s['user_progress'], [])
        sessions.append({
            'id': s['id'], 'problemId': s['id'],
            'completed': bool(s['completed']),
            'currentStep': s['current_step'],
            'userProgress': progress,
        })
        summaries.append({
            'problemId': s['id'], 'method': '',
            'keySteps': [], 'concepts': analysis.get('requiredConcepts', []),
            'timeSpent': 0, 'hintsUsed': 0,
        })

    return jsonify({
        'problems': problems,
        'sessions': sessions,
        'summaries': summaries,
    })


@bp.route('/generate-similar', methods=['POST'])
def generate_similar():
    data = request.json
    problem_id = data.get('problemId', '')
    count = data.get('count', 3)

    db = get_db()
    session = row_to_dict(db.execute('SELECT * FROM problem_sessions WHERE id = ?', (problem_id,)).fetchone())
    db.close()
    if not session:
        return error_response('Problem not found', 404)

    result = chat_completion_json([
        {'role': 'system', 'content': f'你是出题专家。返回JSON数组，包含{count}道类似题目：[{{"question":"题目","subject":"学科","difficulty":"easy|medium|hard","problemType":"类型"}}]'},
        {'role': 'user', 'content': f'请根据以下题目生成{count}道类似题目：\n学科：{session["subject"]}\n题目：{session["question"]}'}
    ])
    if isinstance(result, list):
        return jsonify(result)
    return jsonify([])
