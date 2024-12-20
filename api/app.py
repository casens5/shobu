from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_cors import CORS

app = Flask(__name__)

# Database configuration (SQLite for simplicity, but you can use PostgreSQL, MySQL, etc.)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)  # Allow Next.js frontend to access the backend

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/api/baba')
def baba():
    return jsonify({"message": "baba!"})

# Route for user registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    new_user = User(username=data['username'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    if user and user.password == data['password']:  # For production, use hashing for passwords
        access_token = create_access_token(identity=user.username)
        return jsonify({'access_token': access_token}), 200

    return jsonify({'error': 'Invalid username or password'}), 401

# Protected route for authenticated users
@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    return jsonify({'message': 'Welcome to your profile!'}), 200

if __name__ == '__main__':
    app.run(port=5000)
