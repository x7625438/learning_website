import uuid
import json
from datetime import datetime
from flask import jsonify


def gen_id():
    return str(uuid.uuid4())


def now_iso():
    return datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')


def row_to_dict(row):
    if row is None:
        return None
    return dict(row)


def rows_to_list(rows):
    return [dict(r) for r in rows]


def parse_json_field(value, default=None):
    if value is None:
        return default if default is not None else []
    if isinstance(value, (list, dict)):
        return value
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else []


def error_response(message, status_code=400):
    return jsonify({'message': message}), status_code
