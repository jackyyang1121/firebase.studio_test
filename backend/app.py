import os
import logging
from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, LearningPlan
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
logger.info("Starting Flask app")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
logger.info(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

CORS(app, resources={r"/*": {"origins": ["https://ai-learning-assistant-454719.web.app", "https://ai-learning-assistant-454719.firebaseapp.com"], "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"], "supports_credentials": True}})

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

HF_API_KEY = os.getenv('HF_API_KEY')
HF_API_URL = "https://api-inference.huggingface.co/models/distilgpt2"

def generate_learning_plan(goal):
    logger.info(f"Generating plan for goal: {goal}")
    prompt = f"為目標 '{goal}' 生成一個學習課程，包含：1. 簡短的概念講解（50字以內）2. 一個程式碼範例3. 一個簡單的練習題"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {"inputs": prompt, "parameters": {"max_length": 300, "temperature": 0.7}}
    response = requests.post(HF_API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        result = response.json()[0]['generated_text']
        return result.strip().rsplit('.', 1)[0] + '.'
    logger.error(f"HF API failed: {response.status_code}")
    return f"生成失敗，錯誤碼：{response.status_code}"

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to AI Learning Assistant!'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    logger.info(f"Register request data: {data}")
    if not data or 'username' not in data or 'password' not in data:
        logger.warning("Missing username or password")
        return jsonify({'message': '缺少用戶名或密碼'}), 400
    username = data['username']
    password = data['password']
    if User.query.filter_by(username=username).first():
        logger.info(f"User {username} already exists")
        return jsonify({'message': '用戶已存在'}), 400
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')  # 修正這裡
    new_user = User(username=username, password=hashed_password)
    try:
        db.session.add(new_user)
        db.session.commit()
        logger.info(f"User {username} registered successfully")
        return jsonify({'message': '註冊成功'}), 201
    except Exception as e:
        logger.error(f"Register failed: {str(e)}")
        return jsonify({'message': '註冊失敗，資料庫錯誤'}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({'message': '登入成功'}), 200
    logger.warning(f"Login failed for username: {username}")
    return jsonify({'message': '登入失敗'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': '登出成功'}), 200


@app.route('/check_login', methods=['GET'])
@login_required  # 使用 login_required 裝飾器
def check_login_status():
    """
    檢查用戶登入狀態。
    如果用戶已登入 (@login_required 會通過)，則返回成功訊息。
    如果用戶未登入，@login_required 會自動處理，通常返回 401 Unauthorized，
    前端的 catch 區塊會捕捉到這個錯誤。
    """
    logger.info(f"Login status check: User {current_user.username} is authenticated.")
    # 因為有 @login_required，能執行到這裡就表示用戶已登入
    return jsonify({'message': f'用戶 {current_user.username} 已登入'}), 200


@app.route('/generate_plan', methods=['POST'])
@login_required
def generate_plan():
    data = request.get_json()
    logger.info(f"Generate plan request data: {data}")  # 記錄請求內容
    goal = data.get('goal')
    if not goal:  # 檢查 None 或空字串
        logger.warning("Missing or empty goal in request")
        return jsonify({'message': '缺少學習目標'}), 400
    try:
        plan = generate_learning_plan(goal)
        new_plan = LearningPlan(user_id=current_user.id, goal=goal, plan=plan)
        db.session.add(new_plan)
        db.session.commit()
        logger.info(f"Plan generated for user {current_user.id}: {goal}")
        return jsonify({'plan': plan}), 200
    except Exception as e:
        logger.error(f"Failed to generate plan: {str(e)}")
        return jsonify({'message': '生成計畫失敗，伺服器錯誤'}), 500

@app.route('/learning_progress', methods=['GET'])
@login_required
def learning_progress():
    plans = LearningPlan.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'goal': p.goal, 'plan': p.plan, 'created_at': str(p.created_at)} for p in plans]), 200

with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created")
    except Exception as e:
        logger.error(f"Failed to create tables: {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080)))
#python backend/app.py