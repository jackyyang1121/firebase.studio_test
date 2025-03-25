import os
from flask import Flask, request, jsonify, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, LearningPlan

app = Flask(__name__)
app.config['SECRET_KEY'] = '0905671616'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
CORS(app, resources={r"/*": {"origins": "https://ai-learning-assistant-454719.web.app"}}, supports_credentials=True)

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to AI Learning Assistant!'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print('Register request data:', data)
    if not data:
        return jsonify({'message': '無效的請求資料'}), 400
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'message': '缺少用戶名或密碼'}), 400
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
    print('Check login - Current user:', current_user.username, 'Session:', session.get('_user_id'))
    return jsonify({'message': f'已登入，用戶名：{current_user.username}'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print('Login request data:', data)
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user)
        print('User logged in:', user.username, 'Session:', session.get('_user_id'))
        return jsonify({'message': '登入成功'}), 200
    return jsonify({'message': '登入失敗'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': '登出成功'}), 200

def generate_learning_plan(goal):
    return f"這是為目標 '{goal}' 生成的學習計畫：每天學習1小時，持續30天。"

@app.route('/generate_plan', methods=['POST'])
@login_required
def generate_plan():
    print('Generate plan - Session:', session.get('_user_id'), 'Current user:', current_user.is_authenticated)
    data = request.get_json()
    print('Generate plan request data:', data)
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
    return jsonify([{'goal': plan.goal, 'plan': plan.plan, 'created_at': str(plan.created_at)} for plan in plans]), 200

# 初始化資料庫
with app.app_context():
    db.create_all()
    
#python backend/app.py