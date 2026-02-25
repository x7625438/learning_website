import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE_PATH = os.path.join(BASE_DIR, 'learning.db')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')

DASHSCOPE_API_KEY = 'sk-f3821fb0d9714882bd14a52f220b4400'
DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
TEXT_MODEL = 'qwen2.5-7b-instruct-1m'
VISION_MODEL = 'qwen2.5-vl-32b-instruct'

CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
