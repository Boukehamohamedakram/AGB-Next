from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Account, Transaction, Document, Agency, ApplicationProgress, Admin, Appointment, UserAnalytics, ESignature
from extensions import db
from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
from sqlalchemy import func
from functools import wraps
from services.notification_service import NotificationService
import json

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        admin = Admin.query.filter_by(user_id=current_user_id).first()
        if not admin:
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

def director_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        admin = Admin.query.filter_by(user_id=current_user_id).first()
        if not admin or admin.role != 'director':
            return jsonify({'error': 'Director access required'}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_data():
    current_user_id = get_jwt_identity()
    admin = Admin.query.filter_by(user_id=current_user_id).first()
    
    # Get agency-specific data if admin is not a director
    agency_filter = User.agency_id == admin.agency_id if admin.role == 'admin' else True
    
    # User statistics
    total_users = User.query.filter(agency_filter).count()
    new_users_today = User.query.filter(
        agency_filter,
        User.created_at >= datetime.utcnow().date()
    ).count()
    
    # Account statistics
    total_accounts = Account.query.join(User).filter(agency_filter).count()
    active_accounts = Account.query.join(User).filter(
        agency_filter,
        Account.is_active == True
    ).count()
    
    # Transaction statistics
    total_transactions = Transaction.query.join(Account).join(User).filter(agency_filter).count()
    transaction_volume = Transaction.query.join(Account).join(User).filter(
        agency_filter,
        Transaction.created_at >= datetime.utcnow() - timedelta(days=30)
    ).with_entities(func.sum(Transaction.amount)).scalar() or 0
    
    # Document verification statistics
    pending_documents = Document.query.join(User).filter(
        agency_filter,
        Document.status == 'pending'
    ).count()
    
    # Application progress statistics
    in_progress_applications = ApplicationProgress.query.join(User).filter(
        agency_filter,
        ApplicationProgress.status == 'in_progress'
    ).count()
    
    # Risk level distribution
    risk_levels = db.session.query(
        User.risk_level,
        func.count(User.id)
    ).filter(agency_filter).group_by(User.risk_level).all()
    
    # Account type distribution
    account_types = db.session.query(
        Account.account_type,
        func.count(Account.id)
    ).join(User).filter(agency_filter).group_by(Account.account_type).all()
    
    return jsonify({
        'user_stats': {
            'total_users': total_users,
            'new_users_today': new_users_today
        },
        'account_stats': {
            'total_accounts': total_accounts,
            'active_accounts': active_accounts
        },
        'transaction_stats': {
            'total_transactions': total_transactions,
            'monthly_volume': transaction_volume
        },
        'verification_stats': {
            'pending_documents': pending_documents,
            'in_progress_applications': in_progress_applications
        },
        'distributions': {
            'risk_levels': dict(risk_levels),
            'account_types': dict(account_types)
        }
    }), 200

@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
@admin_required
def generate_report():
    current_user_id = get_jwt_identity()
    admin = Admin.query.filter_by(user_id=current_user_id).first()
    
    report_type = request.args.get('type', 'performance')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
    
    # Get agency-specific data if admin is not a director
    agency_filter = User.agency_id == admin.agency_id if admin.role == 'admin' else True
    
    if report_type == 'performance':
        # Generate performance report
        data = generate_performance_report(agency_filter, start_date, end_date)
    elif report_type == 'users':
        # Generate user report
        data = generate_user_report(agency_filter, start_date, end_date)
    elif report_type == 'transactions':
        # Generate transaction report
        data = generate_transaction_report(agency_filter, start_date, end_date)
    else:
        return jsonify({'error': 'Invalid report type'}), 400
    
    return jsonify(data), 200

def generate_performance_report(agency_filter, start_date, end_date):
    # Daily user registrations
    daily_registrations = db.session.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(agency_filter)
    
    if start_date:
        daily_registrations = daily_registrations.filter(User.created_at >= start_date)
    if end_date:
        daily_registrations = daily_registrations.filter(User.created_at <= end_date)
    
    daily_registrations = daily_registrations.group_by('date').all()
    
    # Account activation rate
    activation_rate = db.session.query(
        func.count(Account.id).filter(Account.is_active == True) * 100.0 / func.count(Account.id)
    ).join(User).filter(agency_filter).scalar()
    
    # Average transaction amount
    avg_transaction = db.session.query(
        func.avg(Transaction.amount)
    ).join(Account).join(User).filter(agency_filter).scalar()
    
    return {
        'daily_registrations': [{'date': str(r.date), 'count': r.count} for r in daily_registrations],
        'activation_rate': activation_rate,
        'avg_transaction': avg_transaction
    }

def generate_user_report(agency_filter, start_date, end_date):
    # User demographics
    users = User.query.filter(agency_filter)
    if start_date:
        users = users.filter(User.created_at >= start_date)
    if end_date:
        users = users.filter(User.created_at <= end_date)
    
    users = users.all()
    
    # Convert to DataFrame for analysis
    df = pd.DataFrame([{
        'age': (datetime.utcnow() - user.birth_date).days / 365 if user.birth_date else None,
        'wilaya': user.wilaya,
        'revenue': user.revenue,
        'risk_level': user.risk_level.value if user.risk_level else None
    } for user in users])
    
    # Generate visualizations
    plt.figure(figsize=(10, 6))
    sns.histplot(data=df, x='age', bins=20)
    plt.title('User Age Distribution')
    age_dist = BytesIO()
    plt.savefig(age_dist, format='png')
    age_dist.seek(0)
    age_dist_base64 = base64.b64encode(age_dist.getvalue()).decode()
    
    return {
        'total_users': len(users),
        'age_distribution': age_dist_base64,
        'wilaya_distribution': df['wilaya'].value_counts().to_dict(),
        'risk_level_distribution': df['risk_level'].value_counts().to_dict()
    }

def generate_transaction_report(agency_filter, start_date, end_date):
    # Transaction statistics
    transactions = Transaction.query.join(Account).join(User).filter(agency_filter)
    if start_date:
        transactions = transactions.filter(Transaction.created_at >= start_date)
    if end_date:
        transactions = transactions.filter(Transaction.created_at <= end_date)
    
    # Daily transaction volume
    daily_volume = db.session.query(
        func.date(Transaction.created_at).label('date'),
        func.sum(Transaction.amount).label('amount')
    ).join(Account).join(User).filter(agency_filter)
    
    if start_date:
        daily_volume = daily_volume.filter(Transaction.created_at >= start_date)
    if end_date:
        daily_volume = daily_volume.filter(Transaction.created_at <= end_date)
    
    daily_volume = daily_volume.group_by('date').all()
    
    return {
        'total_transactions': transactions.count(),
        'total_volume': transactions.with_entities(func.sum(Transaction.amount)).scalar() or 0,
        'daily_volume': [{'date': str(v.date), 'amount': v.amount} for v in daily_volume]
    }

@admin_bp.route('/user-progress/<int:user_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user_progress(user_id):
    current_user_id = get_jwt_identity()
    admin = Admin.query.filter_by(user_id=current_user_id).first()
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if admin has access to this user's data
    if admin.role == 'admin' and user.agency_id != admin.agency_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get user's application progress
    progress = ApplicationProgress.query.filter_by(user_id=user_id).all()
    
    # Get user's documents
    documents = Document.query.filter_by(user_id=user_id).all()
    
    # Get user's accounts
    accounts = Account.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'user_info': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'role': user.role.value,
            'created_at': user.created_at
        },
        'progress': [{
            'step': p.step,
            'status': p.status,
            'data': p.data,
            'updated_at': p.updated_at
        } for p in progress],
        'documents': [{
            'id': d.id,
            'type': d.document_type,
            'status': d.status.value,
            'quality_score': d.quality_score,
            'verified_at': d.verified_at
        } for d in documents],
        'accounts': [{
            'id': a.id,
            'account_number': a.account_number,
            'type': a.account_type.value,
            'balance': a.balance,
            'is_active': a.is_active
        } for a in accounts]
    }), 200

@admin_bp.route('/dashboard/analytics', methods=['GET'])
@admin_required
def get_dashboard_analytics():
    """Get analytics data for the admin dashboard."""
    # Get current admin
    current_user_id = get_jwt_identity()
    admin = Admin.query.filter_by(user_id=current_user_id).first()
    
    # Get analytics based on admin role
    if admin.role == 'director':
        # Director sees all data
        users = User.query.all()
    else:
        # Agency managers/agents see only their agency's data
        users = User.query.filter_by(agency_id=admin.agency_id).all()
    
    # Calculate analytics
    total_users = len(users)
    active_users = len([u for u in users if u.account_status == 'active'])
    pending_users = len([u for u in users if u.account_status == 'pending'])
    
    # Risk level distribution
    risk_levels = {
        'low': len([u for u in users if u.risk_level == 'low']),
        'medium': len([u for u in users if u.risk_level == 'medium']),
        'high': len([u for u in users if u.risk_level == 'high'])
    }
    
    # Transaction volume
    total_volume = sum(u.total_volume for u in users)
    avg_transaction = total_volume / total_users if total_users > 0 else 0
    
    return jsonify({
        'total_users': total_users,
        'active_users': active_users,
        'pending_users': pending_users,
        'risk_levels': risk_levels,
        'total_volume': total_volume,
        'avg_transaction': avg_transaction
    })

@admin_bp.route('/users/track', methods=['GET'])
@admin_required
def track_users():
    """Track all users and their processes."""
    current_user_id = get_jwt_identity()
    admin = Admin.query.filter_by(user_id=current_user_id).first()
    
    # Get users based on admin role
    if admin.role == 'director':
        users = User.query.all()
    else:
        users = User.query.filter_by(agency_id=admin.agency_id).all()
    
    user_tracking = []
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'account_status': user.account_status,
            'risk_level': user.risk_level,
            'verification_score': user.verification_score,
            'last_activity': user.last_activity.isoformat() if user.last_activity else None,
            'total_transactions': user.total_transactions,
            'total_volume': user.total_volume,
            'appointments': [{
                'id': apt.id,
                'date_time': apt.date_time.isoformat(),
                'status': apt.status,
                'notes': apt.notes
            } for apt in user.appointments]
        }
        user_tracking.append(user_data)
    
    return jsonify(user_tracking)

@admin_bp.route('/appointments', methods=['POST'])
@admin_required
def create_appointment():
    """Create an appointment for a user."""
    current_user_id = get_jwt_identity()
    admin = Admin.query.filter_by(user_id=current_user_id).first()
    
    data = request.get_json()
    user_id = data.get('user_id')
    date_time = datetime.fromisoformat(data.get('date_time'))
    notes = data.get('notes', '')
    
    # Check if user exists and is in the same agency
    user = User.query.get_or_404(user_id)
    if admin.role != 'director' and user.agency_id != admin.agency_id:
        return jsonify({'error': 'User not in your agency'}), 403
    
    # Create appointment
    appointment = Appointment(
        user_id=user_id,
        admin_id=admin.id,
        agency_id=admin.agency_id,
        date_time=date_time,
        notes=notes
    )
    db.session.add(appointment)
    db.session.commit()
    
    # Send notification to user
    NotificationService.create_notification(
        user_id=user_id,
        process_type='appointment',
        last_step='scheduled'
    )
    
    return jsonify({
        'id': appointment.id,
        'date_time': appointment.date_time.isoformat(),
        'status': appointment.status
    }), 201

@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@director_required
def activate_user_account(user_id):
    """Activate a user's account and generate client code."""
    user = User.query.get_or_404(user_id)
    
    if user.account_status == 'active':
        return jsonify({'error': 'Account already active'}), 400
    
    # Generate client code (format: YYYY-XXXXX)
    year = datetime.now().year
    last_user = User.query.filter(User.client_code.like(f'{year}-%')).order_by(User.client_code.desc()).first()
    if last_user and last_user.client_code:
        last_number = int(last_user.client_code.split('-')[1])
        new_number = last_number + 1
    else:
        new_number = 1
    
    user.client_code = f'{year}-{new_number:05d}'
    user.account_status = 'active'
    db.session.commit()
    
    # Create e-signature request
    e_signature = ESignature(
        user_id=user.id,
        signature_data='',  # Will be filled when user signs
        signed_at=None
    )
    db.session.add(e_signature)
    db.session.commit()
    
    # Send notification to user
    NotificationService.create_notification(
        user_id=user.id,
        process_type='account_activation',
        last_step='e_signature_required'
    )
    
    return jsonify({
        'message': 'Account activated successfully',
        'client_code': user.client_code
    })

@admin_bp.route('/users/<int:user_id>/e-signature', methods=['GET'])
@director_required
def get_user_signature(user_id):
    """Get a user's e-signature status."""
    user = User.query.get_or_404(user_id)
    e_signature = ESignature.query.filter_by(user_id=user_id).first()
    
    if not e_signature:
        return jsonify({'error': 'No e-signature request found'}), 404
    
    return jsonify({
        'signed': bool(e_signature.signed_at),
        'signed_at': e_signature.signed_at.isoformat() if e_signature.signed_at else None
    })

@admin_bp.route('/recommendations', methods=['GET'])
@admin_required
def get_recommendations():
    """Get recommendations based on user analytics."""
    current_user_id = get_jwt_identity()
    admin = Admin.query.filter_by(user_id=current_user_id).first()
    
    # Get users based on admin role
    if admin.role == 'director':
        users = User.query.all()
    else:
        users = User.query.filter_by(agency_id=admin.agency_id).all()
    
    recommendations = []
    for user in users:
        # Example recommendation logic
        if user.risk_level == 'high' and not user.appointments:
            recommendations.append({
                'user_id': user.id,
                'username': user.username,
                'type': 'appointment_needed',
                'priority': 'high',
                'message': 'High-risk user needs in-person verification'
            })
        elif user.verification_score < 0.7:
            recommendations.append({
                'user_id': user.id,
                'username': user.username,
                'type': 'verification_needed',
                'priority': 'medium',
                'message': 'Additional verification documents required'
            })
        elif user.total_volume > 10000 and not user.e_signature:
            recommendations.append({
                'user_id': user.id,
                'username': user.username,
                'type': 'e_signature_needed',
                'priority': 'medium',
                'message': 'E-signature required for high-volume user'
            })
    
    return jsonify(recommendations) 