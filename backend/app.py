import os
import logging
from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, LearningPlan
import openai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
logger.info("Starting Flask app")

# 配置（使用 SQLite，保留正式環境的其他設定）
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
logger.info(f"Using SQLite database at: {app.config['SQLALCHEMY_DATABASE_URI']}")

CORS(app, resources={r"/*": {"origins": ["https://ai-learning-assistant-454719.web.app", "https://ai-learning-assistant-454719.firebaseapp.com"], "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"], "supports_credentials": True}})

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# OpenAI API 金鑰
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai.api_key = OPENAI_API_KEY

def generate_learning_plan(form_data):
    goal = form_data['goal']
    weekly_time = form_data.get('weeklyTime', 5)
    experience_level = form_data.get('experienceLevel', '初學者')
    learning_style = form_data.get('learningStyle', '視覺型')
    motivation = form_data.get('motivation', '職業發展')
    resource_preference = form_data.get('resourcePreference', '線上課程')
    language_preference = form_data.get('languagePreference', '中文')
    learning_pace = form_data.get('learningPace', '穩步前進')

    prompt = f"""
你是一個 AI 學習助手，任務是為用戶生成一個結構化、個人化的學習計畫。
用戶的目標是：{goal}
用戶每周可用學習時間：{weekly_time} 小時
用戶的經驗水平：{experience_level}
用戶的學習風格：{learning_style}
用戶的學習動機：{motivation}
用戶的資源偏好：{resource_preference}
用戶的語言偏好：{language_preference}
用戶的學習節奏：{learning_pace}

請生成一個詳細的學習計畫，包含以下元素：
1. **概述**：簡要描述學習目標和預期成果。
2. **步驟**：列出具體的學習步驟或階段，每個步驟應包含：
   - 學習內容
   - 建議的學習資源（使用 {language_preference}，優先考慮 {resource_preference}）
   - 預估完成時間
3. **時間安排**：根據用戶的每周可用時間和學習節奏，建議一個合理的學習進度。
4. **評估方法**：建議如何評估學習進展和成果。

請確保計畫具體、可操作，並避免不必要的冗言贅字。
"""

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "你是一個專業的學習計畫生成器。"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        if response.choices:
            result = response.choices[0].message.content
            return result.strip()
        else:
            logger.warning("OpenAI API returned an empty response.")
            return "生成失敗，OpenAI API 返回空回應"
    except Exception as e:
        logger.error(f"OpenAI API failed: {str(e)}")
        return f"生成失敗，OpenAI API 錯誤：{str(e)}"

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
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
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
@login_required
def check_login_status():
    logger.info(f"Login status check: User {current_user.username} is authenticated.")
    return jsonify({'message': f'用戶 {current_user.username} 已登入'}), 200

@app.route('/generate_plan', methods=['POST'])
@login_required
def generate_plan():
    data = request.get_json()
    logger.info(f"Generate plan request data: {data}")
    if not data or 'goal' not in data:
        logger.warning("Missing goal in request")
        return jsonify({'message': '缺少學習目標'}), 400
    try:
        plan = generate_learning_plan(data)
        new_plan = LearningPlan(user_id=current_user.id, goal=data['goal'], plan=plan)
        db.session.add(new_plan)
        db.session.commit()
        logger.info(f"Plan generated for user {current_user.id}: {data['goal']}")
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