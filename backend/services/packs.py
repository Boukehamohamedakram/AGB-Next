from datetime import date

PACKS = [
    {
        "name": "FIRST INTEG",
        "age_min": 18, "age_max": 25,
        "revenue_min": 0, "revenue_max": 20000,
        "description": "Compte courant sans frais ou à frais réduits, Carte de débit locale (CIB) et/ou virtuelle pour e-commerce, Crédit Étudiant / Micro-Crédit (avec conditions souples, possibilité de garantie parentale), Offres liées aux jeux vidéo, technologie.",
        "target": "Étudiant, petits boulots informels, freelancer"
    },
    {
        "name": "FIRST INTEG PRO",
        "age_min": 18, "age_max": 25,
        "revenue_min": 20000, "revenue_max": 40000,
        "description": "Compte courant avec frais réduits, Offres liées aux jeux vidéo, technologie.",
        "target": "Jeune diplômé, premier emploi, freelancer"
    },
    {
        "name": "FIRAHA",
        "age_min": 25, "age_max": 35,
        "revenue_min": 40000, "revenue_max": 80000,
        "description": "Compte courant, carte de débit premium, autorisation de découvert personnalisée, Crédit Consommation (auto, équipement), Crédit Immobilier (première acquisition), Services d'investissement : Initiation à la bourse.",
        "target": "Salarié (confirmé), Jeune Cadre, Profession Libérale (débutant), Indépendant, Célibataire, En couple sans enfants"
    },
    {
        "name": "FAMILLE ET DINAR",
        "age_min": 35, "age_max": 55,
        "revenue_min": 80000, "revenue_max": 150000,
        "description": "Carte Premium (Visa ou carte CIB avec plafonds élevés), Accès simplifié aux produits d'investissement locaux (bons de caisse, produits d'épargne).",
        "target": "Cadre, Fonctionnaire, Profession Libérale, Chef d'Entreprise, Commerçant, Marié(e) avec enfants, Propriétaire d'habitats"
    },
    {
        "name": "PATRI",
        "age_min": 23, "age_max": 46,
        "revenue_min": 150000, "revenue_max": 10000000,
        "description": "Carte haut de gamme (Gestion de portefeuille d'investissement avancé), Crédits Professionnels : Financement d'investissement.",
        "target": "Entrepreneur, Gérant de TPE/PME, Profession Libérale, Commerçant"
    },
    {
        "name": "SERINITÉ",
        "age_min": 46, "age_max": 120,
        "revenue_min": 30000, "revenue_max": 60000,
        "description": "Interface simplifiée, Informations sur les pensions de retraite, Assistance téléphonique dédiée.",
        "target": "Retraités, Revenus stables"
    },
    {
        "name": "SÉRINITÉ HERITAGE",
        "age_min": 46, "age_max": 120,
        "revenue_min": 60000, "revenue_max": 100000,
        "description": "Accès à des produits d'épargne sécurisés, Aide à la gestion des prélèvements récurrents.",
        "target": "Retraités, Patrimoine modéré"
    },
    {
        "name": "SÉRINITÉ TRANSMISE",
        "age_min": 46, "age_max": 120,
        "revenue_min": 100000, "revenue_max": 10000000,
        "description": "Conseils approfondis en ingénierie patrimoniale, Gestion de biens immobiliers, Optimisation de la transmission du patrimoine.",
        "target": "Retraités, Patrimoine important"
    },
    {
        "name": "ÉTRANGER",
        "age_min": 20, "age_max": 120,
        "revenue_min": 100000, "revenue_max": 10000000,
        "description": "Compte courant en dinars, possibilité de compte en devises, Offres liées aux jeux vidéo, technologie.",
        "target": "Non-Résident, Étudiant, Salarié, Retraité, Investisseur"
    },
    {
        "name": "EL FAIROUZ",
        "age_min": 20, "age_max": 120,
        "revenue_min": 20000, "revenue_max": 10000000,
        "description": "Une carte CIB, des services : Budget Famille Facile, Conseil au Féminin (accompagnement), poche projet (petit investissement).",
        "target": "Femmes actives, gestionnaires du budget familial ou responsables de leurs propres finances"
    }
]

def recommend_packs(age, revenue, extra=None):
    results = []
    for pack in PACKS:
        if pack["age_min"] <= age <= pack["age_max"] and pack["revenue_min"] <= revenue <= pack["revenue_max"]:
            results.append(pack)
    return results 