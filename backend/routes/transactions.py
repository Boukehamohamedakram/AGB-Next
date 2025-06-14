from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Transaction, Account, User
from extensions import db
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_transactions():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get all accounts for the user
    accounts = Account.query.filter_by(user_id=current_user_id).all()
    account_ids = [account.id for account in accounts]
    
    # Get all transactions for these accounts
    transactions = Transaction.query.filter(
        Transaction.account_id.in_(account_ids)
    ).order_by(Transaction.created_at.desc()).all()
    
    return jsonify([{
        'id': transaction.id,
        'amount': transaction.amount,
        'transaction_type': transaction.transaction_type,
        'status': transaction.status,
        'account_id': transaction.account_id,
        'recipient_account_id': transaction.recipient_account_id,
        'created_at': transaction.created_at.isoformat(),
        'description': transaction.description
    } for transaction in transactions]), 200

@transactions_bp.route('/', methods=['POST'])
@jwt_required()
def create_transaction():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    account = Account.query.get(data['account_id'])
    
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    if account.user_id != current_user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        transaction = Transaction(
            amount=data['amount'],
            transaction_type=data['transaction_type'],
            account_id=data['account_id'],
            recipient_account_id=data.get('recipient_account_id'),
            description=data.get('description')
        )
        
        # Handle different transaction types
        if data['transaction_type'] == 'deposit':
            account.balance += data['amount']
            transaction.status = 'completed'
        elif data['transaction_type'] == 'withdrawal':
            if account.balance < data['amount']:
                return jsonify({'error': 'Insufficient funds'}), 400
            account.balance -= data['amount']
            transaction.status = 'completed'
        elif data['transaction_type'] == 'transfer':
            if account.balance < data['amount']:
                return jsonify({'error': 'Insufficient funds'}), 400
                
            recipient_account = Account.query.get(data['recipient_account_id'])
            if not recipient_account:
                return jsonify({'error': 'Recipient account not found'}), 404
                
            account.balance -= data['amount']
            recipient_account.balance += data['amount']
            transaction.status = 'completed'
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'id': transaction.id,
            'amount': transaction.amount,
            'transaction_type': transaction.transaction_type,
            'status': transaction.status,
            'account_id': transaction.account_id,
            'recipient_account_id': transaction.recipient_account_id,
            'created_at': transaction.created_at.isoformat(),
            'description': transaction.description
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Transaction failed'}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    account = Account.query.get(transaction.account_id)
    if account.user_id != current_user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'id': transaction.id,
        'amount': transaction.amount,
        'transaction_type': transaction.transaction_type,
        'status': transaction.status,
        'account_id': transaction.account_id,
        'recipient_account_id': transaction.recipient_account_id,
        'created_at': transaction.created_at.isoformat(),
        'description': transaction.description
    }), 200 