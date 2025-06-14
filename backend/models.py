from extensions import db
from datetime import datetime, date
from enum import Enum

class UserRole(str, Enum):
    USER = 'user'
    ADMIN = 'admin'
    DIRECTOR = 'director'

class JuridicState(str, Enum):
    PHYSICAL = 'physical'
    MORAL = 'moral'

class AccountType(str, Enum):
    CURRENT = 'current'
    SAVINGS = 'savings'
    BUSINESS = 'business'

class DocumentStatus(str, Enum):
    PENDING = 'pending'
    VERIFIED = 'verified'
    REJECTED = 'rejected'

class RiskLevel(str, Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'

class FamilyStatusEnum(str, Enum):
    CELIBATAIRE = "Célibataire"
    MARIE = "Marié(e)"
    DIVORCE = "Divorcé(e)"
    VEUF = "Veuf(ve)"
    AUTRE = "Autre"

class ProfessionEnum(str, Enum):
    ETUDIANT = "Étudiant(e)"
    EMPLOYE_PUBLIC = "Employé(e) secteur public"
    EMPLOYE_PRIVE = "Employé(e) secteur privé"
    INDEPENDANT = "Travailleur indépendant"
    ARTISAN = "Artisan"
    COMMERCANT = "Commerçant"
    PROF_LIBERALE = "Profession libérale"
    RETRAITE = "Retraité(e)"
    SANS_EMPLOI = "Sans emploi"
    FOYER = "Femme/Homme au foyer"
    AUTRE = "Autre"

class SecteurActiviteEnum(str, Enum):
    ADMINISTRATION = "Administration publique"
    EDUCATION = "Éducation / Enseignement"
    SANTE = "Santé / Médecine"
    BANQUE = "Banque / Finance / Assurance"
    COMMERCE = "Commerce / Vente / Distribution"
    BTP = "BTP / Construction"
    TRANSPORT = "Transports / Logistique"
    INDUSTRIE = "Industrie / Fabrication"
    AGRICULTURE = "Agriculture / Agroalimentaire"
    TIC = "TIC / Informatique / Télécoms"
    HOTEL = "Hôtellerie / Restauration"
    MEDIAS = "Médias / Communication / Design"
    JURIDIQUE = "Services juridiques"
    AUTRE = "Autre secteur"

class SalaryRangeEnum(str, Enum):
    MOINS_20K = "Moins de 20 000 DA"
    DE_20K_40K = "20 000 – 39 999 DA"
    DE_40K_60K = "40 000 – 59 999 DA"
    DE_60K_100K = "60 000 – 99 999 DA"
    DE_100K_200K = "100 000 – 199 999 DA"
    DE_200K_500K = "200 000 – 499 999 DA"
    PLUS_500K = "500 000 DA et plus"
    NON_DECLARE = "Je ne souhaite pas déclarer"

class AdminRole(Enum):
    DIRECTOR = 'director'
    AGENCY_MANAGER = 'agency_manager'
    AGENT = 'agent'

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.Enum(UserRole, name='user_role_enum'), default=UserRole.USER)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    revenue = db.Column(db.Float)
    wilaya = db.Column(db.String(50))
    birth_date = db.Column(db.Date, nullable=True)
    birth_place = db.Column(db.String(100))
    juridic_state = db.Column(db.Enum(JuridicState, name='juridic_state_enum'))
    agency_id = db.Column(db.Integer, db.ForeignKey('agency.id'))
    risk_level = db.Column(db.Enum(RiskLevel, name='risk_level_enum'), default=RiskLevel.LOW)
    fidelity_points = db.Column(db.Integer, default=0)
    two_factor_enabled = db.Column(db.Boolean, default=False)
    two_fa_method = db.Column(db.String(10), default='none')  # 'sms', 'email', 'none'
    two_factor_secret = db.Column(db.String(32))
    biometric_enabled = db.Column(db.Boolean, default=False)
    face_embedding = db.Column(db.PickleType, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    family_status = db.Column(db.Enum(FamilyStatusEnum, name='family_status_enum'), nullable=True)
    family_status_autre = db.Column(db.String(100), nullable=True)
    father_first_name = db.Column(db.String(100), nullable=True)
    father_last_name = db.Column(db.String(100), nullable=True)
    mother_first_name = db.Column(db.String(100), nullable=True)
    mother_last_name = db.Column(db.String(100), nullable=True)
    birth_country = db.Column(db.String(100), nullable=True)
    birth_wilaya = db.Column(db.String(100), nullable=True)
    birth_city = db.Column(db.String(100), nullable=True)
    nationality = db.Column(db.String(100), nullable=True)
    other_nationality = db.Column(db.String(100), nullable=True)
    address_street = db.Column(db.String(200), nullable=True)
    address_wilaya = db.Column(db.String(100), nullable=True)
    address_city = db.Column(db.String(100), nullable=True)
    address_postal_code = db.Column(db.String(20), nullable=True)
    address_country = db.Column(db.String(100), nullable=True)
    address_validated = db.Column(db.Boolean, default=False)
    profession = db.Column(db.Enum(ProfessionEnum, name='profession_enum'), nullable=True)
    profession_autre = db.Column(db.String(100), nullable=True)
    secteur_activite = db.Column(db.Enum(SecteurActiviteEnum, name='secteur_activite_enum'), nullable=True)
    secteur_activite_autre = db.Column(db.String(100), nullable=True)
    employer = db.Column(db.String(100), nullable=True)
    salary_range = db.Column(db.Enum(SalaryRangeEnum, name='salary_range_enum'), nullable=True)
    hire_date = db.Column(db.Date, nullable=True)
    client_code = db.Column(db.String(20), unique=True)
    account_status = db.Column(db.String(20), default='pending')  # pending, active, suspended
    verification_score = db.Column(db.Float, default=0.0)
    last_activity = db.Column(db.DateTime)
    total_transactions = db.Column(db.Integer, default=0)
    total_volume = db.Column(db.Float, default=0.0)

    accounts = db.relationship('Account', backref='user', lazy=True)
    documents = db.relationship('Document', 
                              foreign_keys='Document.user_id',
                              backref='user', 
                              lazy=True)
    verified_documents = db.relationship('Document',
                                       foreign_keys='Document.verified_by',
                                       backref='verifier',
                                       lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)
    application_progress = db.relationship('ApplicationProgress', backref='user', lazy=True)
    appointments = db.relationship('Appointment', backref='user', lazy=True)
    e_signature = db.relationship('ESignature', backref='user', uselist=False)

    def get_age(self):
        if not self.birth_date:
            return None
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

class Agency(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    admins = db.relationship('Admin', backref='agency', lazy=True)
    appointments = db.relationship('Appointment', backref='agency', lazy=True)
    users = db.relationship('User', backref='agency', lazy=True)

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    status = db.Column(db.Enum(DocumentStatus, name='document_status_enum'), default=DocumentStatus.PENDING)
    verification_notes = db.Column(db.Text)
    verified_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    verified_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    account_type = db.Column(db.Enum(AccountType, name='account_type_enum'), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(3), default='DZD')
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = db.relationship('Transaction', foreign_keys='Transaction.account_id', backref='account', lazy=True)
    received_transactions = db.relationship('Transaction', foreign_keys='Transaction.recipient_account_id', backref='recipient_account', lazy=True)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    recipient_account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    process_type = db.Column(db.String(50), nullable=False)  # e.g., 'registration', 'document_verification', '2fa_setup'
    status = db.Column(db.String(20), nullable=False)  # 'pending', 'sent', 'completed'
    last_step = db.Column(db.String(50), nullable=False)  # e.g., 'personal_info', 'document_upload', '2fa_verification'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_reminder_sent = db.Column(db.DateTime)
    reminder_count = db.Column(db.Integer, default=0)
    
    user = db.relationship('User', backref=db.backref('notifications', lazy=True))

    def __repr__(self):
        return f'<Notification {self.process_type} for user {self.user_id}>'

class ApplicationProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    step = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Offer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    conditions = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    agency_id = db.Column(db.Integer, db.ForeignKey('agency.id'), nullable=False)
    role = db.Column(db.Enum(AdminRole), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('admin_profile', uselist=False))
    appointments = db.relationship('Appointment', backref='admin', lazy=True)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    agency_id = db.Column(db.Integer, db.ForeignKey('agency.id'), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='appointments')

class UserAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    risk_level = db.Column(db.String(20), default='low')  # low, medium, high
    verification_score = db.Column(db.Float, default=0.0)
    last_activity = db.Column(db.DateTime)
    total_transactions = db.Column(db.Integer, default=0)
    total_volume = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('analytics', uselist=False))

class ESignature(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    signature_data = db.Column(db.Text, nullable=False)
    signed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('e_signature', uselist=False)) 