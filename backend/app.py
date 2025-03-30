import os
from flask import Flask, request, jsonify, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, LearningPlan
import requests


app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

CORS(app, resources={
    r"/*": {
        "origins": [
            "https://ai-learning-assistant-454719.web.app",
            "https://ai-learning-assistant-454719.firebaseapp.com"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Hugging Face API 設定
HF_API_KEY = os.getenv('HF_API_KEY')
HF_API_URL = "https://api-inference.huggingface.co/models/distilgpt2"  # 換成更輕量的模型

def generate_learning_plan(goal):
    prompt = f"""
    為目標 '{goal}' 生成一個學習課程，包含：
    1. 簡短的概念講解（50字以內）
    2. 一個程式碼範例
    3. 一個簡單的練習題
    """
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_length": 300, "temperature": 0.7}
    }
    response = requests.post(HF_API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        result = response.json()[0]['generated_text']
        result = result.strip().rsplit('.', 1)[0] + '.'  # 簡單過濾
        return result
    return f"生成失敗，錯誤碼：{response.status_code}"

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to AI Learning Assistant!'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': '缺少用戶名或密碼'}), 400
    username = data['username']
    password = data['password']
    if User.query.filter_by(username=username).first():
        return jsonify({'message': '用戶已存在'}), 400
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': '註冊成功'}), 201

@app.route('/check_login', methods=['GET'])
@login_required
def check_login():
    return jsonify({'message': f'已登入，用戶名：{current_user.username}'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({'message': '登入成功'}), 200
    return jsonify({'message': '登入失敗'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': '登出成功'}), 200

@app.route('/generate_plan', methods=['POST'])
@login_required
def generate_plan():
    data = request.get_json()
    goal = data.get('goal')
    if not goal:
        return jsonify({'message': '缺少學習目標'}), 400
    plan = generate_learning_plan(goal)
    new_plan = LearningPlan(user_id=current_user.id, goal=goal, plan=plan)
    db.session.add(new_plan)
    db.session.commit()
    return jsonify({'plan': plan}), 200

@app.route('/learning_progress', methods=['GET'])
@login_required
def learning_progress():
    plans = LearningPlan.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'goal': p.goal, 'plan': p.plan, 'created_at': str(p.created_at)} for p in plans]), 200

# 初始化資料庫（部署後可註解）
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080)))
#python backend/app.py