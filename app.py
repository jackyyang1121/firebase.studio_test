from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from learning import generate_complex_plan, answer_question, search_youtube
from models import db, User
# import stripe  # 之後啟用

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['JWT_SECRET_KEY'] = 'AIzaSyAi0_z2uwjFWhRBIVdsGA9fo_6PlV3nb9I'  # 我的密鑰
db.init_app(app)
jwt = JWTManager(app)

# 創建資料庫
with app.app_context():
    db.create_all()

# 註冊
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user = User(email=data['email'], password=data['password'])  # 應加密
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': '註冊成功'})

# 登入
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and user.password == data['password']:
        token = create_access_token(identity=user.id)
        return jsonify({'token': token})
    return jsonify({'message': '登入失敗'}), 401

# 生成計畫
@app.route('/api/plan', methods=['POST'])
@jwt_required()
def get_plan():
    data = request.json
    goal = data.get('goal', '')
    plan = generate_complex_plan(goal)
    videos = search_youtube(goal)
    return jsonify({'plan': plan, 'videos': videos})

# 回答問題
@app.route('/api/ask', methods=['POST'])
@jwt_required()
def ask_question():
    data = request.json
    question = data.get('question', '')
    answer = answer_question(question)
    return jsonify({'answer': answer})

# 以下是訂閱功能，註解掉，之後可啟用
'''
@app.route('/api/subscribe', methods=['POST'])
@jwt_required()
def subscribe():
    data = request.json
    payment_method = data.get('method')  # 'stripe', 'linepay', 'paypal'
    token = data.get('token')
    
    if payment_method == 'stripe':
        stripe.api_key = 'your-stripe-secret-key'  # 填入 Stripe Secret Key
        customer = stripe.Customer.create(email='user@email.com', source=token)
        subscription = stripe.Subscription.create(customer=customer.id, items=[{'plan': 'price_xxx'}])
    elif payment_method == 'linepay':
        # 用 Line Pay SDK 或 API，這裡假設已串接
        pass
    elif payment_method == 'paypal':
        # 用 PayPal SDK 或 API，這裡假設已串接
        pass
    return jsonify({'success': True})
'''

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

#python app.py