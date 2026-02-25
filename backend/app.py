import os
from flask import Flask
from flask_cors import CORS
import config
from database import init_db

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB
CORS(app, origins=config.CORS_ORIGINS)

os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)

# Register blueprints
from blueprints.pomodoro import bp as pomodoro_bp
from blueprints.books import bp as books_bp
from blueprints.papers import bp as papers_bp
from blueprints.quotes import bp as quotes_bp
from blueprints.problems import bp as problems_bp
from blueprints.relaxation import bp as relaxation_bp
from blueprints.documents import bp as documents_bp
from blueprints.brainstorm import bp as brainstorm_bp
from blueprints.essays import bp as essays_bp
from blueprints.error_questions import bp as error_questions_bp
from blueprints.notes import bp as notes_bp

app.register_blueprint(pomodoro_bp)
app.register_blueprint(books_bp)
app.register_blueprint(papers_bp)
app.register_blueprint(quotes_bp)
app.register_blueprint(problems_bp)
app.register_blueprint(relaxation_bp)
app.register_blueprint(documents_bp)
app.register_blueprint(brainstorm_bp)
app.register_blueprint(essays_bp)
app.register_blueprint(error_questions_bp)
app.register_blueprint(notes_bp)


@app.route('/api/health')
def health():
    return {'status': 'ok'}


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
