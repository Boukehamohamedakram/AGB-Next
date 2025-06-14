FRENCH_KNOWLEDGE_BASE = {
    'greeting': {
        'pattern': r'^(bonjour|salut|hello|hi|hey|salam)$',
        'response': '''Bonjour! Je suis l'assistant virtuel d'AGB. Je peux vous aider avec:

1. Informations personnelles
2. Situation professionnelle
3. Documents requis
4. Ouverture de compte
5. Services bancaires

Comment puis-je vous aider aujourd'hui?'''
    },
    'personal_info': {
        'pattern': r'(informations|personnelles|données|personnelles)',
        'response': '''Pour ouvrir un compte, nous avons besoin des informations suivantes:

1. Situation familiale:
   - Célibataire
   - Marié(e)
   - Divorcé(e)
   - Veuf(ve)
   - Autre (à préciser)

2. Informations familiales:
   - Prénom du père
   - Nom du père
   - Prénom de la mère
   - Nom de la mère

3. Informations de naissance:
   - Date de naissance
   - Pays de naissance
   - Wilaya de naissance
   - Ville/Commune de naissance
   - Nationalité
   - Autre nationalité (si applicable)

4. Adresse:
   - Rue, Cité, Résidence
   - Wilaya
   - Commune/Ville
   - Code postal
   - Pays de résidence

Souhaitez-vous que je vous guide pour remplir ces informations?'''
    },
    'professional_info': {
        'pattern': r'(profession|travail|emploi|activité)',
        'response': '''Voici les informations professionnelles requises:

1. Profession:
   - Étudiant(e)
   - Employé(e) secteur public
   - Employé(e) secteur privé
   - Travailleur indépendant
   - Artisan
   - Commerçant
   - Profession libérale
   - Retraité(e)
   - Sans emploi
   - Femme/Homme au foyer
   - Autre (à préciser)

2. Secteur d'activité (si applicable):
   - Administration publique
   - Éducation/Enseignement
   - Santé/Médecine
   - Banque/Finance/Assurance
   - Commerce/Vente/Distribution
   - BTP/Construction
   - Transports/Logistique
   - Industrie/Fabrication
   - Agriculture/Agroalimentaire
   - TIC/Informatique/Télécoms
   - Hôtellerie/Restauration
   - Médias/Communication/Design
   - Services juridiques
   - Autre secteur

3. Informations salariales (si salarié):
   - Salaire mensuel (plage):
     * Moins de 20 000 DA
     * 20 000 – 39 999 DA
     * 40 000 – 59 999 DA
     * 60 000 – 99 999 DA
     * 100 000 – 199 999 DA
     * 200 000 – 499 999 DA
     * 500 000 DA et plus
   - Date d'embauche

Voulez-vous que je vous explique les champs conditionnels?'''
    },
    'conditional_fields': {
        'pattern': r'(conditionnel|masqué|caché|visible)',
        'response': '''Voici comment fonctionnent les champs conditionnels:

1. Pour les salariés uniquement:
   - Informations employeur
   - Date d'embauche
   - Salaire mensuel

2. Secteur d'activité:
   - Visible pour: Employés, Indépendants, Artisans, Commerçants
   - Masqué pour: Sans emploi, Femme au foyer, Étudiant(e), Retraité(e)

3. Logique d'affichage:
   - Les champs s'adaptent automatiquement selon votre profession
   - Certains champs peuvent devenir obligatoires
   - D'autres peuvent être masqués si non pertinents

Avez-vous des questions sur un champ particulier?'''
    },
    'documents': {
        'pattern': r'(documents|papiers|justificatifs)',
        'response': '''Documents requis selon votre situation:

1. Pour tous:
   - Carte d'identité nationale
   - Justificatif de domicile
   - Photo d'identité récente

2. Pour les salariés:
   - Contrat de travail
   - Bulletins de salaire (3 derniers)
   - Attestation d'emploi

3. Pour les indépendants:
   - Registre de commerce
   - Déclaration fiscale
   - Justificatif d'activité

4. Pour les étudiants:
   - Carte d'étudiant
   - Attestation d'inscription

Avez-vous besoin d'aide pour préparer ces documents?'''
    },
    'account_opening': {
        'pattern': r'(ouvrir|créer|nouveau).*(compte)',
        'response': '''Pour ouvrir un compte, suivez ces étapes:

1. Remplissez le formulaire en ligne avec:
   - Informations personnelles
   - Situation professionnelle
   - Documents requis

2. Vérifiez que tous les champs conditionnels sont correctement remplis

3. Téléchargez les documents requis

4. Validez votre demande

5. Nous vous contacterons pour finaliser l'ouverture

Voulez-vous commencer le processus d'ouverture de compte?'''
    },
    'fallback': {
        'pattern': r'.*',
        'response': '''Je ne suis pas sûr de comprendre votre demande. Voici comment je peux vous aider:

1. Informations personnelles
2. Situation professionnelle
3. Champs conditionnels
4. Documents requis
5. Processus d'ouverture de compte

Pouvez-vous reformuler votre question?'''
    }
} 