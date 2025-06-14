from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Notification
from services.notification_service import NotificationService
from extensions import db

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get all notifications for the current user."""
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    
    return jsonify([{
        'id': n.id,
        'process_type': n.process_type,
        'status': n.status,
        'last_step': n.last_step,
        'created_at': n.created_at.isoformat(),
        'last_reminder_sent': n.last_reminder_sent.isoformat() if n.last_reminder_sent else None,
        'reminder_count': n.reminder_count
    } for n in notifications])

@notifications_bp.route('/notifications/<int:notification_id>/complete', methods=['POST'])
@jwt_required()
def mark_notification_complete(notification_id):
    """Mark a notification as completed."""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first_or_404()
    
    NotificationService.mark_process_completed(notification)
    return jsonify({'message': 'Notification marked as completed'})

@notifications_bp.route('/notifications/process-status', methods=['GET'])
@jwt_required()
def get_process_status():
    """Get the status of all processes for the current user."""
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).all()
    
    process_status = {}
    for n in notifications:
        if n.process_type not in process_status:
            process_status[n.process_type] = {
                'status': n.status,
                'last_step': n.last_step,
                'created_at': n.created_at.isoformat()
            }
    
    return jsonify(process_status) 