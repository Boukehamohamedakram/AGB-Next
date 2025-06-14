from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from services.packs import recommend_packs

packs_bp = Blueprint("packs", __name__)

@packs_bp.route("/packs/recommendation", methods=["GET"])
@jwt_required()
def recommend():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    age = user.get_age()
    revenue = user.revenue or 0
    packs = recommend_packs(age, revenue)
    return jsonify(packs) 