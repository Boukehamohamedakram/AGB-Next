from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from services.kyc_engine import KYCChecker

kyc_bp = Blueprint("kyc", __name__)

@kyc_bp.route("/kyc/check", methods=["POST"])
@jwt_required()
def kyc_check():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    # Récupère les fichiers et infos du POST
    documents = request.files
    selfie = documents.get('selfie')
    id_doc = documents.get('id_card')
    proof = documents.get('proof_of_address')
    # ... autres champs
    checker = KYCChecker(user, {'id': id_doc, 'proof_of_address': proof}, selfie)
    result = checker.run_all_checks()
    return jsonify({
        'score': result.global_score,
        'risk_level': result.risk_level,
        'details': result.scores
    }) 