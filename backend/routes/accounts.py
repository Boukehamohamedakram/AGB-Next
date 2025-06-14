from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Account, User
from extensions import db
import random
import string

accounts_bp = Blueprint('accounts', __name__)

def generate_account_number():
    return ''.join(random.choices(string.digits, k=10))

@accounts_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_accounts():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    accounts = Account.query.filter_by(user_id=current_user_id).all()
    return jsonify([{
        'id': account.id,
        'account_number': account.account_number,
        'balance': account.balance,
        'account_type': account.account_type,
        'created_at': account.created_at.isoformat()
    } for account in accounts]), 200

@accounts_bp.route('/', methods=['POST'])
@jwt_required()
def create_account():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Generate unique account number
    while True:
        account_number = generate_account_number()
        if not Account.query.filter_by(account_number=account_number).first():
            break
    
    account = Account(
        account_number=account_number,
        account_type=data['account_type'],
        user_id=current_user_id
    )
    
    db.session.add(account)
    db.session.commit()
    
    return jsonify({
        'id': account.id,
        'account_number': account.account_number,
        'balance': account.balance,
        'account_type': account.account_type,
        'created_at': account.created_at.isoformat()
    }), 201

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if account.user_id != current_user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'id': account.id,
        'account_number': account.account_number,
        'balance': account.balance,
        'account_type': account.account_type,
        'created_at': account.created_at.isoformat()
    }), 200

@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@jwt_required()
def delete_account(account_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if account.user_id != current_user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    if account.balance != 0:
        return jsonify({'error': 'Cannot delete account with non-zero balance'}), 400
    
    db.session.delete(account)
    db.session.commit()
    
    return jsonify({'message': 'Account deleted successfully'}), 200 