from datetime import datetime, timedelta
from flask import current_app
from models import Notification, User
from extensions import db
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class NotificationService:
    @staticmethod
    def create_notification(user_id, process_type, last_step):
        """Create a new notification for an incomplete process."""
        notification = Notification(
            user_id=user_id,
            process_type=process_type,
            status='pending',
            last_step=last_step
        )
        db.session.add(notification)
        db.session.commit()
        return notification

    @staticmethod
    def get_email_template(process_type, last_step, user_name):
        """Get the appropriate email template based on process type and last step."""
        templates = {
            'registration': {
                'personal_info': f"""
                <h2>Hey {user_name}! 👋</h2>
                <p>We noticed you started creating your account but haven't completed it yet. You're just a few steps away from accessing all our amazing features!</p>
                <p>Complete your registration now and get:</p>
                <ul>
                    <li>🎁 A welcome bonus</li>
                    <li>💳 Instant access to your account</li>
                    <li>🔒 Enhanced security features</li>
                </ul>
                <p>Click here to continue: <a href="{current_app.config['FRONTEND_URL']}/register">Complete Registration</a></p>
                """,
                'document_upload': f"""
                <h2>Almost there, {user_name}! 📝</h2>
                <p>Your account is almost ready! Just upload your documents to complete the verification process.</p>
                <p>Why complete now?</p>
                <ul>
                    <li>✅ Quick verification (usually within 24 hours)</li>
                    <li>🔐 Secure document handling</li>
                    <li>💼 Full account access</li>
                </ul>
                <p>Click here to upload your documents: <a href="{current_app.config['FRONTEND_URL']}/verify">Upload Documents</a></p>
                """
            },
            '2fa_setup': f"""
            <h2>Security First, {user_name}! 🔒</h2>
            <p>Don't forget to set up your two-factor authentication for enhanced security.</p>
            <p>Benefits of 2FA:</p>
            <ul>
                <li>🛡️ Extra layer of protection</li>
                <li>🔐 Secure transactions</li>
                <li>💪 Peace of mind</li>
            </ul>
            <p>Click here to set up 2FA: <a href="{current_app.config['FRONTEND_URL']}/security">Set Up 2FA</a></p>
            """
        }
        
        return templates.get(process_type, {}).get(last_step, "Please complete your process.")

    @staticmethod
    def send_reminder_email(notification):
        """Send a reminder email for an incomplete process."""
        user = User.query.get(notification.user_id)
        if not user or not user.email:
            return False

        # Check if we should send a reminder (not too frequent)
        if notification.last_reminder_sent and \
           datetime.utcnow() - notification.last_reminder_sent < timedelta(days=1):
            return False

        # Prepare email
        msg = MIMEMultipart()
        msg['From'] = current_app.config['MAIL_DEFAULT_SENDER']
        msg['To'] = user.email
        msg['Subject'] = f"Complete Your {notification.process_type.title()} Process"

        # Get email template
        html_content = NotificationService.get_email_template(
            notification.process_type,
            notification.last_step,
            user.username
        )
        msg.attach(MIMEText(html_content, 'html'))

        try:
            # Send email
            with smtplib.SMTP(current_app.config['MAIL_SERVER'], current_app.config['MAIL_PORT']) as server:
                if current_app.config['MAIL_USE_TLS']:
                    server.starttls()
                if current_app.config['MAIL_USERNAME']:
                    server.login(current_app.config['MAIL_USERNAME'], current_app.config['MAIL_PASSWORD'])
                server.send_message(msg)

            # Update notification
            notification.last_reminder_sent = datetime.utcnow()
            notification.reminder_count += 1
            notification.status = 'sent'
            db.session.commit()
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to send reminder email: {str(e)}")
            return False

    @staticmethod
    def mark_process_completed(notification):
        """Mark a process as completed."""
        notification.status = 'completed'
        db.session.commit() 