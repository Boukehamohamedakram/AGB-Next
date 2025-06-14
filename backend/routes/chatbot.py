from flask import Blueprint, request, jsonify
from textblob import TextBlob
import re
from datetime import datetime
import cv2
import pytesseract
import numpy as np
import os
from werkzeug.utils import secure_filename

# Base de connaissances enrichie pour l'inscription 100% en ligne
FRENCH_KNOWLEDGE_BASE = {
    'greeting': {
        'pattern': r'^(bonjour|salut|hello|hi|hey|salam)$',
        'response': """Bonjour ! Je suis l'assistant virtuel d'AGB. Je peux vous guider pour ouvrir un compte 100% en ligne. Dites-moi simplement où vous en êtes ou posez-moi une question !"""
    },
    'start_registration': {
        'pattern': r'(ouvrir|créer|nouveau).*(compte|inscription)',
        'response': """Pour commencer l'ouverture de votre compte :\n1. Cliquez sur 'S'enregistrer' sur l'écran d'accueil.\n2. Remplissez vos informations (prénom, nom, email, téléphone, mot de passe).\nBesoin d'aide sur une étape précise ?"""
    },
    'password_rules': {
        'pattern': r'(mot de passe|password|sécurité).*',
        'response': """Votre mot de passe doit comporter au moins 8 caractères, avec :\n- Une lettre majuscule\n- Une lettre minuscule\n- Un chiffre\nN'hésitez pas à me demander des conseils pour le choisir !"""
    },
    'sms_code': {
        'pattern': r'(sms|code|confirmation|vérification).*',
        'response': """Après avoir saisi votre numéro de téléphone, vous recevrez un code par SMS. Entrez-le dans l'application pour valider votre numéro. Si vous ne recevez pas le code, cliquez sur 'Renvoyer le code'."""
    },
    'security_questions': {
        'pattern': r'(question.*sécur|sécurité|protection).*',
        'response': """Les questions de sécurité servent à protéger votre compte et à réinitialiser votre mot de passe si besoin. Choisissez des questions et réponses faciles à retenir pour vous, mais difficiles à deviner pour les autres."""
    },
    'personal_info': {
        'pattern': r'(information.*personnel|profil|donnée.*personnel|civilité|nom|prénom|situation familiale|famille|parent|naissance|adresse|nationalité)',
        'response': """Remplissez soigneusement vos informations personnelles :\n- Civilité, prénom, nom\n- Situation familiale et informations sur vos parents\n- Date, pays, wilaya et ville de naissance\n- Nationalité\n- Adresse complète (rue, wilaya, commune, code postal, pays)\nBesoin d'aide sur un champ en particulier ?"""
    },
    'professional_info': {
        'pattern': r'(profession|emploi|travail|secteur|employeur|salaire|date d\'embauche)',
        'response': """Indiquez votre profession, secteur d'activité, employeur, salaire mensuel et date d'embauche si vous êtes salarié. Ces informations sont nécessaires pour compléter votre dossier."""
    },
    'document_upload': {
        'pattern': r'(document|photo|justificatif|selfie|pièce d\'identité|passeport|permis|carte d\'identité|résidence|prendre en photo|envoyer|scanner)',
        'response': """Pour valider votre identité, prenez en photo les documents demandés (pièce d'identité, justificatif de domicile, etc.) et réalisez un selfie.\n\n**Conseils pour une photo réussie :**\n- Utilisez un bon éclairage\n- Évitez les reflets et le flou\n- Assurez-vous que toutes les informations sont lisibles\n- Ne cachez aucune partie du document\n\nLes photos seront vérifiées automatiquement par notre système (photos_process)."""
    },
    'document_quality': {
        'pattern': r'(qualité|photo.*refusée|photo.*pas bonne|photo.*rejetée|photo.*problème)',
        'response': """Si votre photo/document est refusé :\n- Vérifiez la netteté et la luminosité\n- Reprenez la photo sans flash si possible\n- Placez le document à plat et évitez les ombres\n- Vérifiez que toutes les informations sont visibles\nBesoin d'un exemple ou d'une aide pour prendre la photo ?"""
    },
    'terms_conditions': {
        'pattern': r'(condition.*générale|accepter|valider|confirmer)',
        'response': """Avant de finaliser, veuillez lire et accepter les conditions générales d'utilisation. Cochez les cases puis cliquez sur 'Confirmer et poursuivre'."""
    },
    'final_step': {
        'pattern': r'(final|terminé|fin|confirmation|félicitation|enregistrement réussi)',
        'response': """Félicitations ! Votre inscription est terminée. Vous pouvez maintenant accéder à votre espace personnel et suivre l'avancement de votre dossier.\nSi besoin, je peux vous guider pour la suite (ouverture de compte, dépôt de documents, etc.)."""
    },
    'help': {
        'pattern': r'(aide|support|problème|bloqué|question|contact)',
        'response': """Pour toute question ou problème, cliquez sur 'Besoin d'aide ?' ou contactez-nous au +213 21 98 86 86. Je suis aussi là pour répondre à vos questions !"""
    },
    'fallback': {
        'pattern': r'.*',
        'response': """Je ne suis pas sûr de comprendre votre demande. Pouvez-vous préciser l'étape ou la question concernant l'inscription en ligne ?"""
    }
}

chatbot_bp = Blueprint('chatbot', __name__)

# User context tracking
user_contexts = {}

def get_user_context(user_id):
    if user_id not in user_contexts:
        user_contexts[user_id] = {
            'preferences': {
                'language': 'fr',  # Default to French
                'notifications': True
            },
            'sentiment_history': [],
            'conversation_history': []
        }
    return user_contexts[user_id]

def analyze_sentiment(text):
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    subjectivity = analysis.sentiment.subjectivity
    
    # Determine mood based on polarity
    if polarity > 0.3:
        mood = "positive"
    elif polarity < -0.3:
        mood = "negative"
    else:
        mood = "neutral"
    
    return {
        'polarity': polarity,
        'subjectivity': subjectivity,
        'mood': mood
    }

def get_response(text, user_id):
    context = get_user_context(user_id)
    language = context['preferences']['language']
    
    # Analyze sentiment
    sentiment = analyze_sentiment(text)
    context['sentiment_history'].append({
        'text': text,
        'sentiment': sentiment,
        'timestamp': datetime.now().isoformat()
    })
    
    # Get response based on language
    if language == 'fr':
        knowledge_base = FRENCH_KNOWLEDGE_BASE
    else:
        # Default to French if language not supported
        knowledge_base = FRENCH_KNOWLEDGE_BASE
    
    # Find matching pattern
    response = None
    category = None
    
    for cat, data in knowledge_base.items():
        if re.search(data['pattern'], text.lower()):
            response = data['response']
            category = cat
            break
    
    if not response:
        response = knowledge_base['fallback']['response']
        category = 'fallback'
    
    # Add to conversation history
    context['conversation_history'].append({
        'user_input': text,
        'bot_response': response,
        'category': category,
        'sentiment': sentiment,
        'timestamp': datetime.now().isoformat()
    })
    
    return {
        'response': response,
        'category': category,
        'sentiment': sentiment,
        'language': language
    }

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message')
        
        if not user_id or not message:
            return jsonify({'error': 'Missing user_id or message'}), 400
        
        response_data = get_response(message, user_id)
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chatbot_bp.route('/preferences', methods=['GET', 'POST'])
def preferences():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400
        
        context = get_user_context(user_id)
        
        if request.method == 'POST':
            # Update preferences
            new_preferences = data.get('preferences', {})
            context['preferences'].update(new_preferences)
            return jsonify({'message': 'Preferences updated', 'preferences': context['preferences']})
        
        # GET request - return current preferences
        return jsonify({'preferences': context['preferences']})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chatbot_bp.route('/history', methods=['GET'])
def history():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400
        
        context = get_user_context(user_id)
        return jsonify({
            'conversation_history': context['conversation_history'],
            'sentiment_history': context['sentiment_history']
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Analyse d'image pour le chatbot ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

def check_image_quality(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return False, "Fichier non lisible"
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    if fm < 100:
        return False, "La photo est floue"
    mean_brightness = np.mean(gray)
    if mean_brightness < 50:
        return False, "La photo est trop sombre"
    if mean_brightness > 220:
        return False, "La photo est trop claire"
    return True, "Qualité correcte"

def extract_text(image_path):
    img = cv2.imread(image_path)
    text = pytesseract.image_to_string(img, lang='fra')
    return text

def detect_document_type(text):
    if "passeport" in text.lower():
        return "Passeport"
    if "carte nationale" in text.lower() or "identité" in text.lower():
        return "Carte d'identité"
    if "permis" in text.lower():
        return "Permis de conduire"
    if "facture" in text.lower() or "résidence" in text.lower():
        return "Justificatif de domicile"
    return "Inconnu"

@chatbot_bp.route('/photo', methods=['POST'])
def analyze_photo():
    if 'photo' not in request.files:
        return jsonify({'error': "Aucun fichier reçu."}), 400
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': "Aucun fichier sélectionné."}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': "Format de fichier non supporté."}), 400

    filename = secure_filename(file.filename)
    temp_path = os.path.join('/tmp', filename)
    file.save(temp_path)

    # Analyse qualité
    is_good, quality_msg = check_image_quality(temp_path)
    # OCR
    text = extract_text(temp_path)
    doc_type = detect_document_type(text)

    # Génération de la réponse
    if not is_good:
        response = f"La photo n'est pas exploitable : {quality_msg}. Merci de la reprendre en suivant les conseils (bonne lumière, pas de flou, document bien visible)."
    elif doc_type == "Inconnu":
        response = "Je n'ai pas pu reconnaître le type de document. Merci de vérifier que la photo est bien cadrée et que le texte est lisible."
    else:
        lines = [l for l in text.split('\n') if l.strip()]
        preview = '\n'.join(lines[:3])
        response = f"Document reconnu : {doc_type}.\nAperçu du texte détecté :\n{preview}\nLa qualité est bonne, vous pouvez continuer."

    os.remove(temp_path)
    return jsonify({
        'response': response,
        'document_type': doc_type,
        'quality': quality_msg,
        'ocr_preview': text[:200]
    }) 