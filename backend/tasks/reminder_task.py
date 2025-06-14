from datetime import datetime, timedelta
from models import Notification
from services.notification_service import NotificationService
from extensions import db

def send_reminders():
    """Send reminders for incomplete processes."""
    # Get all pending notifications that haven't been reminded in the last 24 hours
    pending_notifications = Notification.query.filter(
        Notification.status.in_(['pending', 'sent']),
        Notification.reminder_count < 3,  # Maximum 3 reminders
        (
            Notification.last_reminder_sent.is_(None) |
            (Notification.last_reminder_sent < datetime.utcnow() - timedelta(days=1))
        )
    ).all()

    for notification in pending_notifications:
        NotificationService.send_reminder_email(notification) 