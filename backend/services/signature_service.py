from models import User, ESignature
from extensions import db
from datetime import datetime
from services.notification_service import NotificationService
import json

class SignatureService:
    @staticmethod
    def create_signature_request(user_id):
        """Create a new e-signature request for a user."""
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return None, "User not found"
        
        # Check if there's already a pending signature
        existing = ESignature.query.filter_by(
            user_id=user_id,
            signed_at=None
        ).first()
        
        if existing:
            return existing, "Signature request already exists"
        
        # Create new signature request
        signature = ESignature(
            user_id=user_id,
            signature_data='',
            signed_at=None
        )
        db.session.add(signature)
        db.session.commit()
        
        # Send notification
        NotificationService.create_notification(
            user_id=user_id,
            process_type='e_signature',
            last_step='requested'
        )
        
        return signature, "Signature request created"
    
    @staticmethod
    def process_signature(user_id, signature_data):
        """Process a user's signature."""
        signature = ESignature.query.filter_by(
            user_id=user_id,
            signed_at=None
        ).first()
        
        if not signature:
            return False, "No pending signature request found"
        
        # Update signature
        signature.signature_data = json.dumps(signature_data)
        signature.signed_at = datetime.utcnow()
        db.session.commit()
        
        # Send notification
        NotificationService.create_notification(
            user_id=user_id,
            process_type='e_signature',
            last_step='completed'
        )
        
        return True, "Signature processed successfully"
    
    @staticmethod
    def get_signature_status(user_id):
        """Get the status of a user's signature request."""
        signature = ESignature.query.filter_by(user_id=user_id).first()
        
        if not signature:
            return {
                'has_signature': False,
                'signed_at': None,
                'status': 'no_request'
            }
        
        return {
            'has_signature': True,
            'signed_at': signature.signed_at.isoformat() if signature.signed_at else None,
            'status': 'signed' if signature.signed_at else 'pending'
        }
    
    @staticmethod
    def verify_signature(user_id):
        """Verify if a user has a valid signature."""
        signature = ESignature.query.filter_by(
            user_id=user_id,
            signed_at__isnot=None
        ).first()
        
        return bool(signature) 