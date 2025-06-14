from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Account, Offer, Transaction
from extensions import db
from datetime import datetime, timedelta
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json

recommendations_bp = Blueprint('recommendations', __name__)

def calculate_user_features(user):
    """Calculate features for user-based recommendations"""
    features = {
        'revenue': user.revenue or 0,
        'age': (datetime.utcnow() - user.birth_date).days / 365 if user.birth_date else 30,
        'account_count': len(user.accounts),
        'transaction_count': sum(len(acc.transactions) for acc in user.accounts),
        'avg_transaction': 0,
        'fidelity_points': user.fidelity_points
    }
    
    # Calculate average transaction amount
    all_transactions = []
    for account in user.accounts:
        all_transactions.extend([t.amount for t in account.transactions])
    
    if all_transactions:
        features['avg_transaction'] = sum(all_transactions) / len(all_transactions)
    
    return features

def get_recommended_offers(user):
    """Get personalized offers for a user"""
    features = calculate_user_features(user)
    
    # Get all active offers
    offers = Offer.query.filter_by(is_active=True).all()
    
    # Score each offer based on user features
    scored_offers = []
    for offer in offers:
        score = 0
        
        # Check if user meets requirements
        requirements = offer.requirements
        if requirements:
            if 'min_revenue' in requirements and features['revenue'] < requirements['min_revenue']:
                continue
            if 'min_age' in requirements and features['age'] < requirements['min_age']:
                continue
            if 'min_transactions' in requirements and features['transaction_count'] < requirements['min_transactions']:
                continue
        
        # Calculate score based on user features
        if offer.type == 'account':
            if features['account_count'] == 0:
                score += 2  # Higher score for users with no accounts
            if features['revenue'] > 50000:  # Example threshold
                score += 1
        elif offer.type == 'card':
            if features['transaction_count'] > 10:
                score += 2
            if features['avg_transaction'] > 1000:
                score += 1
        elif offer.type == 'loan':
            if features['revenue'] > 30000:
                score += 2
            if features['fidelity_points'] > 100:
                score += 1
        
        scored_offers.append({
            'offer': offer,
            'score': score
        })
    
    # Sort offers by score and return top 5
    scored_offers.sort(key=lambda x: x['score'], reverse=True)
    return [offer['offer'] for offer in scored_offers[:5]]

@recommendations_bp.route('/offers', methods=['GET'])
@jwt_required()
def get_offers():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    recommended_offers = get_recommended_offers(user)
    
    return jsonify([{
        'id': offer.id,
        'name': offer.name,
        'description': offer.description,
        'type': offer.type,
        'requirements': offer.requirements
    } for offer in recommended_offers]), 200

# Simple rule-based chatbot
CHATBOT_RULES = {
    'greeting': {
        'patterns': ['hello', 'hi', 'hey', 'greetings'],
        'responses': ['Hello! How can I help you today?', 'Hi there! What can I do for you?']
    },
    'account_creation': {
        'patterns': ['how to create account', 'open account', 'new account'],
        'responses': ['To create an account, you need to provide your personal information and required documents. Would you like to start the process?']
    },
    'document_requirements': {
        'patterns': ['what documents', 'required documents', 'need documents'],
        'responses': ['You need to provide: 1) ID card, 2) Proof of residency, 3) Birth certificate. Would you like to upload these documents now?']
    },
    'account_types': {
        'patterns': ['types of accounts', 'account types', 'different accounts'],
        'responses': ['We offer: 1) Courant (Current), 2) Epargne (Savings), 3) Cheque (Checking), 4) Etudiant (Student), 5) Devise (Foreign Currency) accounts.']
    },
    'fees': {
        'patterns': ['fees', 'charges', 'cost'],
        'responses': ['Our fees vary by account type. Would you like to know the specific fees for a particular account type?']
    },
    'help': {
        'patterns': ['help', 'support', 'assistance'],
        'responses': ['I can help you with: 1) Account creation, 2) Document requirements, 3) Account types, 4) Fees, 5) General information. What would you like to know?']
    }
}

def get_chatbot_response(message):
    """Get response from the chatbot based on user message"""
    message = message.lower()
    
    # Check for matching patterns
    for intent, data in CHATBOT_RULES.items():
        for pattern in data['patterns']:
            if pattern in message:
                return np.random.choice(data['responses'])
    
    # Default response if no pattern matches
    return "I'm not sure I understand. Could you please rephrase your question or type 'help' for assistance."

@recommendations_bp.route('/chatbot', methods=['POST'])
@jwt_required()
def chatbot():
    data = request.get_json()
    message = data.get('message')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    
    response = get_chatbot_response(message)
    
    return jsonify({
        'response': response
    }), 200

@recommendations_bp.route('/fidelity-points', methods=['GET'])
@jwt_required()
def get_fidelity_points():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'points': user.fidelity_points,
        'level': calculate_fidelity_level(user.fidelity_points)
    }), 200

def calculate_fidelity_level(points):
    """Calculate user's fidelity level based on points"""
    if points >= 1000:
        return 'gold'
    elif points >= 500:
        return 'silver'
    elif points >= 100:
        return 'bronze'
    else:
        return 'basic' 