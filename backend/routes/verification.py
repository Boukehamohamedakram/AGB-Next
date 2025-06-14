from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Document, Account, Agency, Notification, ApplicationProgress
from extensions import db
import os
from datetime import datetime
import cv2
import numpy as np
from PIL import Image
import pytesseract
import json
from werkzeug.utils import secure_filename
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

verification_bp = Blueprint('verification', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def check_image_quality(image_path):
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        return False, "Invalid image file"
    
    # Check resolution
    height, width = img.shape[:2]
    if width < 800 or height < 600:
        return False, "Image resolution too low"
    
    # Check blur
    laplacian_var = cv2.Laplacian(img, cv2.CV_64F).var()
    if laplacian_var < 100:
        return False, "Image is too blurry"
    
    # Check noise
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    noise = cv2.fastNlMeansDenoising(gray)
    noise_level = np.mean(np.abs(gray - noise))
    if noise_level > 20:
        return False, "Image has too much noise"
    
    return True, "Image quality is good"

def extract_data_from_document(file_path, document_type):
    try:
        if file_path.lower().endswith('.pdf'):
            # Convert PDF to image first
            # You'll need to implement PDF to image conversion
            pass
        
        # Extract text using OCR
        text = pytesseract.image_to_string(Image.open(file_path))
        
        # Process extracted text based on document type
        if document_type == 'id':
            # Extract ID card information
            data = {
                'name': extract_name(text),
                'id_number': extract_id_number(text),
                'birth_date': extract_birth_date(text),
                'birth_place': extract_birth_place(text)
            }
        elif document_type == 'residency':
            # Extract residency information
            data = {
                'address': extract_address(text),
                'wilaya': extract_wilaya(text)
            }
        elif document_type == 'birth_certificate':
            # Extract birth certificate information
            data = {
                'name': extract_name(text),
                'birth_date': extract_birth_date(text),
                'birth_place': extract_birth_place(text),
                'parents': extract_parents(text)
            }
        
        return True, data
    except Exception as e:
        return False, str(e)

def send_notification(user, title, message, notification_type='email'):
    notification = Notification(
        user_id=user.id,
        title=title,
        message=message,
        type=notification_type
    )
    db.session.add(notification)
    
    if notification_type == 'email':
        # Send email
        msg = MIMEMultipart()
        msg['From'] = 'noreply@bank.com'
        msg['To'] = user.email
        msg['Subject'] = title
        msg.attach(MIMEText(message, 'plain'))
        
        # Configure your SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login('your-email@gmail.com', 'your-password')
        server.send_message(msg)
        server.quit()
    
    elif notification_type == 'sms':
        # Send SMS using a service like Twilio
        # Implement SMS sending logic here
        pass

@verification_bp.route('/upload-document', methods=['POST'])
@jwt_required()
def upload_document():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    document_type = request.form.get('document_type')
    
    if not file or not document_type:
        return jsonify({'error': 'Missing file or document type'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Check image quality
    quality_ok, quality_message = check_image_quality(file_path)
    if not quality_ok:
        send_notification(user, 'Document Quality Issue', 
                         f'Your {document_type} document has quality issues: {quality_message}')
        return jsonify({'error': quality_message}), 400
    
    # Extract data from document
    extraction_ok, extracted_data = extract_data_from_document(file_path, document_type)
    if not extraction_ok:
        send_notification(user, 'Document Processing Issue',
                         f'We could not process your {document_type} document: {extracted_data}')
        return jsonify({'error': 'Document processing failed'}), 400
    
    # Save document information
    document = Document(
        user_id=current_user_id,
        document_type=document_type,
        file_path=file_path,
        file_type=filename.rsplit('.', 1)[1].lower(),
        quality_score=100,  # You can implement a scoring system
        extracted_data=extracted_data
    )
    
    db.session.add(document)
    db.session.commit()
    
    return jsonify({
        'message': 'Document uploaded successfully',
        'document_id': document.id,
        'extracted_data': extracted_data
    }), 201

@verification_bp.route('/verify-document/<int:document_id>', methods=['POST'])
@jwt_required()
def verify_document(document_id):
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or admin.role not in ['admin', 'director']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    document = Document.query.get(document_id)
    if not document:
        return jsonify({'error': 'Document not found'}), 404
    
    data = request.get_json()
    document.status = data.get('status')
    document.verification_notes = data.get('notes')
    document.verified_at = datetime.utcnow()
    document.verified_by = current_user_id
    
    db.session.commit()
    
    # Notify user
    user = User.query.get(document.user_id)
    send_notification(user, 'Document Verification Update',
                     f'Your {document.document_type} document has been {document.status.value}')
    
    return jsonify({'message': 'Document verification updated'}), 200

@verification_bp.route('/activate-account/<int:account_id>', methods=['POST'])
@jwt_required()
def activate_account(account_id):
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    
    if not admin or admin.role != 'director':
        return jsonify({'error': 'Unauthorized'}), 403
    
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    user = User.query.get(account.user_id)
    
    # Check if all required documents are verified
    required_docs = ['id', 'residency', 'birth_certificate']
    user_docs = Document.query.filter_by(user_id=user.id).all()
    
    verified_docs = [doc for doc in user_docs if doc.status == 'verified']
    if len(verified_docs) < len(required_docs):
        return jsonify({'error': 'Not all required documents are verified'}), 400
    
    # Check risk level
    if user.risk_level in ['medium', 'high']:
        # Schedule meeting
        meeting_date = request.json.get('meeting_date')
        if not meeting_date:
            return jsonify({'error': 'Meeting date required for medium/high risk users'}), 400
        
        # Send meeting notification
        send_notification(user, 'Account Activation Meeting',
                         f'Please visit our agency on {meeting_date} to complete your account activation')
        return jsonify({'message': 'Meeting scheduled'}), 200
    
    # Activate account for low risk users
    account.is_active = True
    account.activated_at = datetime.utcnow()
    account.activated_by = current_user_id
    
    db.session.commit()
    
    # Notify user
    send_notification(user, 'Account Activated',
                     'Your account has been activated successfully')
    
    return jsonify({'message': 'Account activated successfully'}), 200

@verification_bp.route('/application-progress', methods=['GET'])
@jwt_required()
def get_application_progress():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    progress = ApplicationProgress.query.filter_by(user_id=current_user_id).all()
    return jsonify([{
        'step': p.step,
        'status': p.status,
        'data': p.data,
        'updated_at': p.updated_at
    } for p in progress]), 200 