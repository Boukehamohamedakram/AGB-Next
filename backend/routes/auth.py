from flask import Blueprint, request, jsonify
from models import User, db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import random
import string
import pyotp
import base64
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Vérification des champs obligatoires
    required_fields = ['username', 'password', 'email', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Le champ {field} est requis'}), 400
    
    # Vérification si l'utilisateur existe déjà
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Ce nom d\'utilisateur est déjà pris'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 400
    
    # Création du nouvel utilisateur avec tous les champs possibles
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone'),
        family_status=data.get('family_status'),
        family_status_autre=data.get('family_status_autre'),
        father_first_name=data.get('father_first_name'),
        father_last_name=data.get('father_last_name'),
        mother_first_name=data.get('mother_first_name'),
        mother_last_name=data.get('mother_last_name'),
        birth_date=datetime.strptime(data['birth_date'], '%Y-%m-%d') if data.get('birth_date') else None,
        birth_country=data.get('birth_country'),
        birth_wilaya=data.get('birth_wilaya'),
        birth_city=data.get('birth_city'),
        nationality=data.get('nationality'),
        other_nationality=data.get('other_nationality'),
        address_street=data.get('address_street'),
        address_wilaya=data.get('address_wilaya'),
        address_city=data.get('address_city'),
        address_postal_code=data.get('address_postal_code'),
        address_country=data.get('address_country'),
        profession=data.get('profession'),
        profession_autre=data.get('profession_autre'),
        secteur_activite=data.get('secteur_activite'),
        secteur_activite_autre=data.get('secteur_activite_autre'),
        employer=data.get('employer'),
        salary_range=data.get('salary_range'),
        hire_date=datetime.strptime(data['hire_date'], '%Y-%m-%d') if data.get('hire_date') else None
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Utilisateur créé avec succès'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Nom d\'utilisateur et mot de passe requis'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Nom d\'utilisateur ou mot de passe incorrect'}), 401
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'family_status': user.family_status,
            'profession': user.profession,
            'nationality': user.nationality,
            'address_validated': user.address_validated
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'family_status': user.family_status,
        'family_status_autre': user.family_status_autre,
        'father_first_name': user.father_first_name,
        'father_last_name': user.father_last_name,
        'mother_first_name': user.mother_first_name,
        'mother_last_name': user.mother_last_name,
        'birth_date': user.birth_date.strftime('%Y-%m-%d') if user.birth_date else None,
        'birth_country': user.birth_country,
        'birth_wilaya': user.birth_wilaya,
        'birth_city': user.birth_city,
        'nationality': user.nationality,
        'other_nationality': user.other_nationality,
        'address_street': user.address_street,
        'address_wilaya': user.address_wilaya,
        'address_city': user.address_city,
        'address_postal_code': user.address_postal_code,
        'address_country': user.address_country,
        'address_validated': user.address_validated,
        'profession': user.profession,
        'profession_autre': user.profession_autre,
        'secteur_activite': user.secteur_activite,
        'secteur_activite_autre': user.secteur_activite_autre,
        'employer': user.employer,
        'salary_range': user.salary_range,
        'hire_date': user.hire_date.strftime('%Y-%m-%d') if user.hire_date else None
    }), 200

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    data = request.get_json()
    
    # Mise à jour des champs de base
    if 'email' in data:
        if User.query.filter_by(email=data['email']).first() and user.email != data['email']:
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
        user.email = data['email']
    
    # Mise à jour des champs du profil
    profile_fields = [
        'first_name', 'last_name', 'phone', 'family_status', 'family_status_autre',
        'father_first_name', 'father_last_name', 'mother_first_name', 'mother_last_name',
        'birth_country', 'birth_wilaya', 'birth_city', 'nationality', 'other_nationality',
        'address_street', 'address_wilaya', 'address_city', 'address_postal_code',
        'address_country', 'profession', 'profession_autre', 'secteur_activite',
        'secteur_activite_autre', 'employer', 'salary_range'
    ]
    
    for field in profile_fields:
        if field in data:
            setattr(user, field, data[field])
    
    # Gestion des dates
    if 'birth_date' in data:
        user.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d')
    if 'hire_date' in data:
        user.hire_date = datetime.strptime(data['hire_date'], '%Y-%m-%d')
    
    db.session.commit()
    
    return jsonify({'message': 'Profil mis à jour avec succès'}), 200

def send_sms(phone, code):
    # Stub: Integrate with real SMS provider
    print(f"Sending SMS to {phone}: Your code is {code}")

def send_email(email, code):
    # Stub: Integrate with real email provider
    print(f"Sending Email to {email}: Your code is {code}")

@auth_bp.route('/enable-2fa', methods=['POST'])
@jwt_required()
def enable_2fa():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    method = data.get('method')
    if method not in ['sms', 'email']:
        return jsonify({'error': 'Invalid 2FA method'}), 400
    user.two_factor_enabled = True
    user.two_fa_method = method
    db.session.commit()
    return jsonify({'message': f'2FA enabled via {method}'}), 200

@auth_bp.route('/request-2fa', methods=['POST'])
def request_2fa():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        if not user.two_factor_enabled:
            return jsonify({'error': '2FA not enabled'}), 400
        # Generate a 6-digit code
        code = ''.join(random.choices(string.digits, k=6))
        print(f"[DEBUG] Generated 2FA code for {username}: {code}")
        user.two_factor_secret = code
        user.two_factor_expiry = datetime.utcnow() + timedelta(minutes=5)
        db.session.commit()
        if user.two_fa_method == 'sms':
            send_sms(user.phone, code)
        else:
            send_email(user.email, code)
        resp = {'message': '2FA code sent'}
        if os.environ.get('FLASK_ENV') == 'development':
            resp['code'] = code
        return jsonify(resp), 200
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@auth_bp.route('/verify-2fa', methods=['POST'])
def verify_2fa():
    data = request.get_json()
    username = data.get('username')
    code = data.get('code')
    print(f"[DEBUG] Verifying 2FA code for {username}: received {code}")
    user = User.query.filter_by(username=username).first()
    if not user or not user.two_factor_enabled:
        return jsonify({'error': '2FA not enabled'}), 400
    print(f"[DEBUG] Stored code: {user.two_factor_secret}, Expiry: {user.two_factor_expiry}")
    if user.two_factor_secret != code or datetime.utcnow() > user.two_factor_expiry:
        return jsonify({'error': 'Invalid or expired code'}), 401
    # Success: issue JWT
    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/register-face', methods=['POST'])
@jwt_required()
def register_face():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if 'photo' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['photo']
    try:
        import face_recognition
        import numpy as np
        image = face_recognition.load_image_file(file)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            return jsonify({'error': 'No face detected'}), 400
        user.face_embedding = encodings[0].tolist()
        db.session.commit()
        return jsonify({'message': 'Face registered successfully'}), 200
    except ImportError:
        return jsonify({'error': 'face_recognition library not installed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-face', methods=['POST'])
def verify_face():
    if 'photo' not in request.files or 'username' not in request.form:
        return jsonify({'error': 'No file uploaded or username missing'}), 400
    username = request.form.get('username')
    user = User.query.filter_by(username=username).first()
    if not user or not user.face_embedding:
        return jsonify({'error': 'Face ID not registered'}), 400
    file = request.files['photo']
    try:
        import face_recognition
        import numpy as np
        image = face_recognition.load_image_file(file)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            return jsonify({'error': 'No face detected'}), 400
        known = np.array(user.face_embedding)
        match = face_recognition.compare_faces([known], encodings[0])[0]
        if match:
            access_token = create_access_token(identity=user.id)
            return jsonify({'access_token': access_token}), 200
        else:
            return jsonify({'error': 'Face does not match'}), 401
    except ImportError:
        return jsonify({'error': 'face_recognition library not installed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500 