import numpy as np
from datetime import datetime
import easyocr
import face_recognition
import csv
import os

class KYCResult:
    def __init__(self):
        self.scores = {}
        self.flags = []
        self.global_score = 0
        self.risk_level = "pending"
        self.details = {}

class KYCChecker:
    def __init__(self, user, documents, selfie, video=None):
        self.user = user
        self.documents = documents  # dict: {"id": ..., "proof_of_address": ...}
        self.selfie = selfie
        self.video = video
        self.reader = easyocr.Reader(['fr', 'en'])

    def run_all_checks(self):
        result = KYCResult()
        result.scores['documents'] = self.check_documents()
        result.scores['personal'] = self.check_personal_data()
        result.scores['behavior'] = self.check_behavior()
        result.scores['aml'] = self.check_aml()
        result.scores['income'] = self.check_income()
        result.scores['contacts'] = self.check_contacts()
        # Score global pondéré
        result.global_score = (
            0.3 * result.scores['documents'] +
            0.2 * result.scores['contacts'] +
            0.2 * result.scores['aml'] +
            0.15 * result.scores['income'] +
            0.15 * result.scores['behavior']
        )
        # Détermination du niveau de risque
        if result.global_score >= 0.8:
            result.risk_level = "low"
        elif result.global_score >= 0.4:
            result.risk_level = "medium"
        else:
            result.risk_level = "high"
        return result

    def check_documents(self):
        # OCR sur la pièce d'identité
        id_img = self.documents.get('id')
        if id_img:
            text = self.reader.readtext(np.array(bytearray(id_img.read()), dtype=np.uint8), detail=0, paragraph=True)
            id_img.seek(0)
            # Vérification de la présence de nom, prénom, date de naissance, etc.
            if any(self.user.last_name.lower() in t.lower() for t in text):
                ocr_score = 1.0
            else:
                ocr_score = 0.5
        else:
            ocr_score = 0.0
        # Face matching
        selfie_img = self.selfie
        if id_img and selfie_img:
            id_img.seek(0)
            selfie_img.seek(0)
            try:
                id_face = face_recognition.load_image_file(id_img)
                selfie_face = face_recognition.load_image_file(selfie_img)
                id_enc = face_recognition.face_encodings(id_face)
                selfie_enc = face_recognition.face_encodings(selfie_face)
                if id_enc and selfie_enc:
                    match = face_recognition.compare_faces([id_enc[0]], selfie_enc[0])[0]
                    face_score = 1.0 if match else 0.0
                else:
                    face_score = 0.0
            except Exception:
                face_score = 0.0
        else:
            face_score = 0.0
        # Score moyen
        return (ocr_score + face_score) / 2

    def check_personal_data(self):
        # Vérifier cohérence nom/prénom, âge, lieu de naissance, etc.
        # Ex: nom/prénom dans OCR, âge >= 18
        if self.user.get_age() and self.user.get_age() >= 18:
            return 1.0
        return 0.0

    def check_behavior(self):
        # À brancher avec logs frontend (temps, mouvements, etc.)
        return 1.0

    def check_aml(self):
        # Screening PEP/Blacklist à partir d'un CSV local (ex: 'backend/data/pep_list.csv')
        pep_file = os.path.join('backend', 'data', 'pep_list.csv')
        if os.path.exists(pep_file):
            with open(pep_file, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    if self.user.last_name.lower() in row['last_name'].lower() and self.user.first_name.lower() in row['first_name'].lower():
                        return 0.0  # PEP trouvé, risque élevé
        return 1.0  # Pas trouvé

    def check_income(self):
        # Vérifier cohérence revenu/profession
        if self.user.revenue and self.user.revenue > 0:
            return 1.0
        return 0.0

    def check_contacts(self):
        # Vérifier email, téléphone (non jetable, actif)
        if self.user.email and self.user.phone:
            return 1.0
        return 0.0 