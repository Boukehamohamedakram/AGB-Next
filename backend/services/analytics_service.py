from models import User, UserAnalytics, Transaction, Appointment
from extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func

class AnalyticsService:
    @staticmethod
    def calculate_user_risk_level(user_id):
        """Calculate a user's risk level based on various factors."""
        user = User.query.get(user_id)
        if not user:
            return None
        
        # Get user's analytics
        analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
        if not analytics:
            analytics = UserAnalytics(user_id=user_id)
            db.session.add(analytics)
        
        # Calculate risk factors
        risk_score = 0
        
        # Transaction volume risk
        total_volume = sum(t.amount for t in user.accounts[0].transactions) if user.accounts else 0
        if total_volume > 10000:
            risk_score += 2
        elif total_volume > 5000:
            risk_score += 1
        
        # Transaction frequency risk
        recent_transactions = Transaction.query.filter(
            Transaction.account_id.in_([a.id for a in user.accounts]),
            Transaction.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        if recent_transactions > 50:
            risk_score += 2
        elif recent_transactions > 20:
            risk_score += 1
        
        # Verification score
        verification_score = analytics.verification_score or 0
        if verification_score < 0.5:
            risk_score += 2
        elif verification_score < 0.7:
            risk_score += 1
        
        # Determine risk level
        if risk_score >= 4:
            risk_level = 'high'
        elif risk_score >= 2:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        # Update analytics
        analytics.risk_level = risk_level
        analytics.verification_score = verification_score
        analytics.total_transactions = recent_transactions
        analytics.total_volume = total_volume
        analytics.last_activity = datetime.utcnow()
        db.session.commit()
        
        return risk_level
    
    @staticmethod
    def generate_recommendations(user_id):
        """Generate recommendations for a user based on their analytics."""
        user = User.query.get(user_id)
        if not user:
            return []
        
        recommendations = []
        
        # Check risk level
        risk_level = user.risk_level or 'low'
        if risk_level == 'high':
            recommendations.append({
                'type': 'appointment_needed',
                'priority': 'high',
                'message': 'High-risk user needs in-person verification',
                'action': 'schedule_appointment'
            })
        
        # Check verification score
        if user.verification_score and user.verification_score < 0.7:
            recommendations.append({
                'type': 'verification_needed',
                'priority': 'medium',
                'message': 'Additional verification documents required',
                'action': 'request_documents'
            })
        
        # Check transaction patterns
        recent_transactions = Transaction.query.filter(
            Transaction.account_id.in_([a.id for a in user.accounts]),
            Transaction.created_at >= datetime.utcnow() - timedelta(days=30)
        ).all()
        
        if recent_transactions:
            # Check for unusual transaction patterns
            avg_amount = sum(t.amount for t in recent_transactions) / len(recent_transactions)
            if any(t.amount > avg_amount * 3 for t in recent_transactions):
                recommendations.append({
                    'type': 'unusual_activity',
                    'priority': 'medium',
                    'message': 'Unusual transaction patterns detected',
                    'action': 'review_transactions'
                })
        
        # Check for missing e-signature
        if user.total_volume > 10000 and not user.e_signature:
            recommendations.append({
                'type': 'e_signature_needed',
                'priority': 'medium',
                'message': 'E-signature required for high-volume user',
                'action': 'request_signature'
            })
        
        return recommendations
    
    @staticmethod
    def get_user_analytics(user_id):
        """Get comprehensive analytics for a user."""
        user = User.query.get(user_id)
        if not user:
            return None
        
        # Get or create analytics
        analytics = UserAnalytics.query.filter_by(user_id=user_id).first()
        if not analytics:
            analytics = UserAnalytics(user_id=user_id)
            db.session.add(analytics)
            db.session.commit()
        
        # Calculate recent activity
        recent_transactions = Transaction.query.filter(
            Transaction.account_id.in_([a.id for a in user.accounts]),
            Transaction.created_at >= datetime.utcnow() - timedelta(days=30)
        ).all()
        
        # Calculate metrics
        total_volume = sum(t.amount for t in recent_transactions)
        avg_transaction = total_volume / len(recent_transactions) if recent_transactions else 0
        
        # Update analytics
        analytics.total_transactions = len(recent_transactions)
        analytics.total_volume = total_volume
        analytics.last_activity = datetime.utcnow()
        db.session.commit()
        
        return {
            'user_id': user.id,
            'risk_level': analytics.risk_level,
            'verification_score': analytics.verification_score,
            'total_transactions': analytics.total_transactions,
            'total_volume': analytics.total_volume,
            'avg_transaction': avg_transaction,
            'last_activity': analytics.last_activity.isoformat() if analytics.last_activity else None,
            'recommendations': AnalyticsService.generate_recommendations(user_id)
        }
    
    @staticmethod
    def get_agency_analytics(agency_id):
        """Get analytics for an entire agency."""
        users = User.query.filter_by(agency_id=agency_id).all()
        
        total_users = len(users)
        active_users = len([u for u in users if u.account_status == 'active'])
        pending_users = len([u for u in users if u.account_status == 'pending'])
        
        risk_levels = {
            'low': len([u for u in users if u.risk_level == 'low']),
            'medium': len([u for u in users if u.risk_level == 'medium']),
            'high': len([u for u in users if u.risk_level == 'high'])
        }
        
        total_volume = sum(u.total_volume for u in users)
        avg_transaction = total_volume / total_users if total_users > 0 else 0
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'pending_users': pending_users,
            'risk_levels': risk_levels,
            'total_volume': total_volume,
            'avg_transaction': avg_transaction
        } 