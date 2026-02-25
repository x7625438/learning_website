import json
from flask import Blueprint, request, jsonify
from database import get_db
from utils.helpers import gen_id, now_iso, row_to_dict, rows_to_list, error_response

bp = Blueprint('pomodoro', __name__, url_prefix='/api/pomodoro')


@bp.route('/start', methods=['POST'])
def start_session():
    data = request.json
    user_id = data.get('userId')
    task = data.get('task')
    duration = data.get('duration', 25)

    if not user_id:
        return error_response('userId is required')

    session_id = gen_id()
    start_time = now_iso()

    db = get_db()
    db.execute(
        'INSERT INTO pomodoro_sessions (id, user_id, task, duration, start_time) VALUES (?, ?, ?, ?, ?)',
        (session_id, user_id, task, duration, start_time)
    )
    db.commit()

    session = row_to_dict(db.execute('SELECT * FROM pomodoro_sessions WHERE id = ?', (session_id,)).fetchone())
    db.close()
    return jsonify(_format_session(session))


@bp.route('/user/<user_id>/active', methods=['GET'])
def get_active_session(user_id):
    db = get_db()
    session = db.execute(
        'SELECT * FROM pomodoro_sessions WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC LIMIT 1',
        (user_id,)
    ).fetchone()
    db.close()
    if not session:
        return jsonify(None)
    return jsonify(_format_session(row_to_dict(session)))


@bp.route('/<session_id>/complete', methods=['POST'])
def complete_session(session_id):
    end_time = now_iso()
    db = get_db()
    db.execute(
        'UPDATE pomodoro_sessions SET completed = 1, end_time = ? WHERE id = ?',
        (end_time, session_id)
    )
    db.commit()
    db.close()
    return jsonify({'message': 'ok'})


@bp.route('/user/<user_id>/stats', methods=['GET'])
def get_stats(user_id):
    db = get_db()
    rows = db.execute(
        'SELECT * FROM pomodoro_sessions WHERE user_id = ? AND completed = 1',
        (user_id,)
    ).fetchall()
    db.close()

    sessions = rows_to_list(rows)
    total = len(sessions)
    total_focus = sum(s['duration'] for s in sessions)
    avg_length = total_focus / total if total > 0 else 0

    daily = {}
    for s in sessions:
        date = s['start_time'][:10] if s['start_time'] else 'unknown'
        if date not in daily:
            daily[date] = {'date': date, 'sessions': 0, 'focusTime': 0}
        daily[date]['sessions'] += 1
        daily[date]['focusTime'] += s['duration']

    return jsonify({
        'totalSessions': total,
        'completedSessions': total,
        'totalFocusTime': total_focus,
        'averageSessionLength': round(avg_length, 1),
        'dailyStats': list(daily.values())
    })


@bp.route('/user/<user_id>', methods=['GET'])
def get_sessions(user_id):
    limit = request.args.get('limit', 20, type=int)
    db = get_db()
    rows = db.execute(
        'SELECT * FROM pomodoro_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        (user_id, limit)
    ).fetchall()
    db.close()
    return jsonify([_format_session(row_to_dict(r)) for r in rows])


def _format_session(s):
    return {
        'id': s['id'],
        'userId': s['user_id'],
        'startTime': s['start_time'],
        'endTime': s['end_time'],
        'duration': s['duration'],
        'completed': bool(s['completed']),
        'task': s['task'],
        'createdAt': s['created_at'],
    }
