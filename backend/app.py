from flask import Flask, jsonify
from datetime import timedelta
import os
from dotenv import load_dotenv
import logging
from extensions import db, jwt, migrate, cors
from flask_cors import CORS
from routes.auth import auth_bp
from routes.users import users_bp
from routes.accounts import accounts_bp
from routes.transactions import transactions_bp
from routes.verification import verification_bp
from routes.admin import admin_bp
from routes.recommendations import recommendations_bp
from routes.chatbot import chatbot_bp
from routes.notifications import notifications_bp
from routes.packs import packs_bp
from routes.kyc import kyc_bp
from flask_jwt_extended import JWTManager
from flask_mail import Mail

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def create_app():
    # Initialize Flask app
    app = Flask(__name__)

    # Configure CORS
    CORS(app)
    
    # Configure upload folder for documents
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///bank.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')
    app.config['FRONTEND_URL'] = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    cors.init_app(app)
    migrate.init_app(app, db)
    mail = Mail(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(verification_bp, url_prefix='/api/verification')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(packs_bp, url_prefix="/api")
    app.register_blueprint(kyc_bp, url_prefix="/api")

    # Create database tables
    with app.app_context():
        db.create_all()

    @app.errorhandler(500)
    def handle_500_error(e):
        logger.error(f"500 error: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    @app.route('/')
    def index():
        return "Welcome to the e-banking API. See /api/* for endpoints."

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True) 