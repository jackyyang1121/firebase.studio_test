import os
import logging
from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, LearningPlan, Lecture
import openai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
logger.info("Starting Flask app")

# 配置
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
    goal = form_data.get('goal', '')
    specific_goal = form_data.get('specificGoal', '')  # 新增：具體目標
    weekly_time = form_data.get('weeklyTime', 5)
    experience_level = form_data.get('experienceLevel', '初學者')
    learning_style = form_data.get('learningStyle', '視覺型')
    motivation = form_data.get('motivation', '職業發展')
    resource_preference = form_data.get('resourcePreference', '線上課程')
    language_preference = form_data.get('languagePreference', '中文')
    learning_pace = form_data.get('learningPace', '穩步前進')

    prompt = f"""
你是一個 AI 學習助手，任務是為用戶生成一個結構化、個人化的學習計畫。請使用繁體中文回應。
用戶的目標是：{goal}
用戶的經驗水平：{experience_level}
用戶的學習風格：{learning_style}
用戶的學習動機：{motivation}
用戶的資源偏好：{resource_preference}
用戶的語言偏好：{language_preference}
用戶的學習節奏：{learning_pace}
用戶每周可用學習時間：{weekly_time} 小時

請根據用戶的經驗水平生成相應深度的學習內容，並適用於任何學習目標，以下是舉例:
（若為程式相關目標）
- 初學者：從基礎入門開始，例如基本語法、資料分析、視覺化、爬蟲。
- 中級：延續初階內容，學習進階技術，例如機器學習、視覺辨識，或進階句型、流利表達。
- 高階：學習專業級內容，例如深度學習。
若為其他目標則套用以上相同概念設計學習計畫

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

def generate_lecture(plan_id, section):
    plan = LearningPlan.query.get(plan_id)
    prompt = f"""
根據以下學習計畫生成詳細的學習講義：
{plan.plan}

請針對計畫中的「{section}」部分生成講義內容，包含：
- 詳細的解釋和範例
- 程式碼片段（如果適用）
- 精選的外部資源連結（1-2 個高品質資源，如 YouTube 影片、官方文件等）

請使用繁體中文生成講義。
"""
    try:
        response = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "你是一個專業的講義生成器。"},
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

@app.route('/generate_lecture', methods=['POST'])
@login_required
def generate_lecture_route():
    data = request.get_json()
    plan_id = data.get('plan_id')
    section = data.get('section')
    if not plan_id or not section:
        return jsonify({'message': '缺少 plan_id 或 section'}), 400
    lecture_content = generate_lecture(plan_id, section)
    new_lecture = Lecture(plan_id=plan_id, section=section, content=lecture_content)
    db.session.add(new_lecture)
    db.session.commit()
    return jsonify({'lecture': lecture_content}), 200

@app.route('/lectures/<int:plan_id>', methods=['GET'])
@login_required
def get_lectures(plan_id):
    lectures = Lecture.query.filter_by(plan_id=plan_id).all()
    return jsonify([{'section': l.section, 'content': l.content, 'completed': l.completed} for l in lectures]), 200

@app.route('/complete_lecture', methods=['POST'])
@login_required
def complete_lecture():
    data = request.get_json()
    lecture_id = data.get('lecture_id')
    lecture = Lecture.query.get(lecture_id)
    if not lecture:
        return jsonify({'message': '講義不存在'}), 404
    lecture.completed = True
    db.session.commit()
    return jsonify({'message': '講義已標記為完成'}), 200

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
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': '註冊成功'}), 201

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

@app.route('/check_login', methods=['GET'])
@login_required
def check_login_status():
    return jsonify({'message': f'用戶 {current_user.username} 已登入'}), 200

@app.route('/generate_plan', methods=['POST'])
@login_required
def generate_plan():
    data = request.get_json()
    if not data or 'goal' not in data:
        return jsonify({'message': '缺少學習目標'}), 400
    plan = generate_learning_plan(data)
    new_plan = LearningPlan(user_id=current_user.id, goal=data['goal'], plan=plan)
    db.session.add(new_plan)
    db.session.commit()
    return jsonify({'plan': plan, 'plan_id': new_plan.id}), 200

@app.route('/learning_progress', methods=['GET'])
@login_required
def learning_progress():
    plans = LearningPlan.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': p.id, 'goal': p.goal, 'plan': p.plan, 'created_at': str(p.created_at)} for p in plans]), 200

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 8080)))