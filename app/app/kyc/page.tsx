"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FormField, SelectField, FileInput } from "@/components/form-field"
import { ProgressIndicator } from "@/components/progress-indicator"
import { Checkbox } from "@/components/ui/checkbox"
import { OtpInput } from "@/components/form-field"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, FileText, Download } from "lucide-react"
import { Header } from "@/components/header"

export default function KYCPage() {
  const router = useRouter()

  // Définition des étapes
  const steps = [
    { id: "situation", title: "Situation familiale" },
    { id: "filiation", title: "Filiation" },
    { id: "naissance", title: "Naissance" },
    { id: "adresse", title: "Adresse" },
    { id: "profession", title: "Profession" },
    { id: "identite", title: "Pièce d'identité" },
    { id: "justificatif", title: "Justificatif de résidence" },
    { id: "contrat", title: "Contrat" },
    { id: "signature", title: "Signature électronique" },
    { id: "confirmation", title: "Confirmation" },
  ]

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState({
    situationFamiliale: "",
    prenomPere: "",
    nomPere: "",
    prenomMere: "",
    nomMere: "",
    dateNaissance: "",
    paysNaissance: "Algérie",
    wilayaNaissance: "",
    communeNaissance: "",
    adresseRue: "",
    adresseWilaya: "",
    adresseCommune: "",
    codePostal: "",
    profession: "",
    secteurActivite: "",
    employeur: "",
    salaire: "",
    dateEmbauche: "",
    carteIdentiteRecto: null as File | null,
    carteIdentiteVerso: null as File | null,
    justificatifResidence: null as File | null,
    acceptConditions: false,
    otpCode: ["", "", "", "", "", ""],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [timer, setTimer] = useState(180)

  useEffect(() => {
    // Rediriger vers la première étape du KYC
    router.push("/kyc/identity-document")
  }, [router])

  // Gestion du timer pour l'OTP
  useEffect(() => {
    if (currentStepIndex === 8 && !otpVerified && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentStepIndex, timer, otpVerified])

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Effacer l'erreur lorsque l'utilisateur commence à taper
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [fieldName]: e.target.files![0] }))
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: "" }))
      }
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...formData.otpCode]
    newOtp[index] = value
    setFormData((prev) => ({ ...prev, otpCode: newOtp }))
    if (errors.otpCode) {
      setErrors((prev) => ({ ...prev, otpCode: "" }))
    }
  }

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStepIndex) {
      case 0: // Situation familiale
        if (!formData.situationFamiliale)
          newErrors.situationFamiliale = "Veuillez sélectionner votre situation familiale"
        break
      case 1: // Filiation
        if (!formData.prenomPere) newErrors.prenomPere = "Le prénom du père est requis"
        if (!formData.nomPere) newErrors.nomPere = "Le nom du père est requis"
        if (!formData.prenomMere) newErrors.prenomMere = "Le prénom de la mère est requis"
        if (!formData.nomMere) newErrors.nomMere = "Le nom de la mère est requis"
        break
      case 2: // Naissance
        if (!formData.dateNaissance) newErrors.dateNaissance = "La date de naissance est requise"
        else {
          const today = new Date()
          const birthDate = new Date(formData.dateNaissance)
          const age = today.getFullYear() - birthDate.getFullYear()
          if (age < 18) newErrors.dateNaissance = "Vous devez avoir au moins 18 ans"
        }
        if (!formData.wilayaNaissance) newErrors.wilayaNaissance = "La wilaya de naissance est requise"
        if (!formData.communeNaissance) newErrors.communeNaissance = "La commune de naissance est requise"
        break
      case 3: // Adresse
        if (!formData.adresseRue) newErrors.adresseRue = "L'adresse est requise"
        if (!formData.adresseWilaya) newErrors.adresseWilaya = "La wilaya est requise"
        if (!formData.adresseCommune) newErrors.adresseCommune = "La commune est requise"
        if (!formData.codePostal) newErrors.codePostal = "Le code postal est requis"
        else if (!/^\d{5}$/.test(formData.codePostal)) {
          newErrors.codePostal = "Le code postal doit contenir 5 chiffres"
        }
        break
      case 4: // Profession
        if (!formData.profession) newErrors.profession = "La profession est requise"
        if (!formData.secteurActivite) newErrors.secteurActivite = "Le secteur d'activité est requis"
        if (!formData.employeur) newErrors.employeur = "L'employeur est requis"
        if (!formData.salaire) newErrors.salaire = "Le salaire est requis"
        if (!formData.dateEmbauche) newErrors.dateEmbauche = "La date d'embauche est requise"
        break
      case 5: // Pièce d'identité
        if (!formData.carteIdentiteRecto)
          newErrors.carteIdentiteRecto = "Veuillez télécharger une photo du recto de votre carte d'identité"
        if (!formData.carteIdentiteVerso)
          newErrors.carteIdentiteVerso = "Veuillez télécharger une photo du verso de votre carte d'identité"
        break
      case 6: // Justificatif de résidence
        if (!formData.justificatifResidence)
          newErrors.justificatifResidence = "Veuillez télécharger un justificatif de résidence"
        break
      case 7: // Contrat
        if (!formData.acceptConditions) newErrors.acceptConditions = "Vous devez accepter les conditions générales"
        break
      case 8: // Signature électronique
        if (!otpVerified && formData.otpCode.some((digit) => !digit)) {
          newErrors.otpCode = "Veuillez entrer le code complet"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1)
        }
      }, 500)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNext()
  }

  const handleVerifyOtp = () => {
    if (!formData.otpCode.some((digit) => !digit)) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setOtpVerified(true)
      }, 1000)
    } else {
      setErrors({ otpCode: "Veuillez entrer le code complet" })
    }
  }

  const handleFinish = () => {
    router.push("/confirmation")
  }

  const situationOptions = [
    { value: "Célibataire", label: "Célibataire" },
    { value: "Marié(e)", label: "Marié(e)" },
    { value: "Divorcé(e)", label: "Divorcé(e)" },
    { value: "Veuf(ve)", label: "Veuf(ve)" },
  ]

  const wilayas = [
    "Alger",
    "Oran",
    "Constantine",
    "Annaba",
    "Blida",
    "Batna",
    "Djelfa",
    "Sétif",
    "Sidi Bel Abbès",
    "Biskra",
  ]

  const communes: Record<string, string[]> = {
    Alger: ["Alger-Centre", "Sidi M'Hamed", "El Madania", "Belouizdad"],
    Oran: ["Oran", "Es Senia", "Bir El Djir", "Arzew"],
    Constantine: ["Constantine", "El Khroub", "Hamma Bouziane", "Didouche Mourad"],
    Annaba: ["Annaba", "El Bouni", "El Hadjar", "Sidi Amar"],
  }

  const professions = [
    "Étudiant(e)",
    "Employé(e) secteur public",
    "Employé(e) secteur privé",
    "Travailleur indépendant",
    "Retraité(e)",
    "Femme/Homme au foyer",
    "Sans emploi",
  ]

  const secteurs = [
    "Administration publique",
    "Éducation",
    "Santé",
    "Finance et Assurance",
    "Commerce",
    "Industrie",
    "Technologies de l'information",
    "Autre",
  ]

  const renderStepContent = () => {
    const currentStep = steps[currentStepIndex]

    switch (currentStep.id) {
      case "situation":
        return (
          <SelectField
            label="Situation familiale"
            name="situationFamiliale"
            value={formData.situationFamiliale}
            onChange={handleInputChange}
            options={situationOptions}
            error={errors.situationFamiliale}
          />
        )
      case "filiation":
        return (
          <>
            <FormField
              label="Prénom du père"
              name="prenomPere"
              value={formData.prenomPere}
              onChange={handleInputChange}
              placeholder="Entrez le prénom du père"
              error={errors.prenomPere}
            />
            <FormField
              label="Nom du père"
              name="nomPere"
              value={formData.nomPere}
              onChange={handleInputChange}
              placeholder="Entrez le nom du père"
              error={errors.nomPere}
            />
            <FormField
              label="Prénom de la mère"
              name="prenomMere"
              value={formData.prenomMere}
              onChange={handleInputChange}
              placeholder="Entrez le prénom de la mère"
              error={errors.prenomMere}
            />
            <FormField
              label="Nom de la mère"
              name="nomMere"
              value={formData.nomMere}
              onChange={handleInputChange}
              placeholder="Entrez le nom de la mère"
              error={errors.nomMere}
            />
          </>
        )
      case "naissance":
        return (
          <>
            <FormField
              label="Date de naissance"
              name="dateNaissance"
              type="date"
              value={formData.dateNaissance}
              onChange={handleInputChange}
              error={errors.dateNaissance}
            />
            <FormField
              label="Pays de naissance"
              name="paysNaissance"
              value={formData.paysNaissance}
              onChange={handleInputChange}
              placeholder="Entrez le pays de naissance"
              error={errors.paysNaissance}
            />
            <SelectField
              label="Wilaya de naissance"
              name="wilayaNaissance"
              value={formData.wilayaNaissance}
              onChange={handleInputChange}
              options={wilayas}
              error={errors.wilayaNaissance}
            />
            <SelectField
              label="Commune de naissance"
              name="communeNaissance"
              value={formData.communeNaissance}
              onChange={handleInputChange}
              options={formData.wilayaNaissance ? communes[formData.wilayaNaissance] || [] : []}
              error={errors.communeNaissance}
              placeholder={formData.wilayaNaissance ? "Sélectionnez une commune" : "Sélectionnez d'abord une wilaya"}
            />
          </>
        )
      case "adresse":
        return (
          <>
            <FormField
              label="Rue/Cité/Résidence"
              name="adresseRue"
              value={formData.adresseRue}
              onChange={handleInputChange}
              placeholder="Entrez votre adresse"
              error={errors.adresseRue}
            />
            <SelectField
              label="Wilaya"
              name="adresseWilaya"
              value={formData.adresseWilaya}
              onChange={handleInputChange}
              options={wilayas}
              error={errors.adresseWilaya}
            />
            <SelectField
              label="Commune"
              name="adresseCommune"
              value={formData.adresseCommune}
              onChange={handleInputChange}
              options={formData.adresseWilaya ? communes[formData.adresseWilaya] || [] : []}
              error={errors.adresseCommune}
              placeholder={formData.adresseWilaya ? "Sélectionnez une commune" : "Sélectionnez d'abord une wilaya"}
            />
            <FormField
              label="Code postal"
              name="codePostal"
              value={formData.codePostal}
              onChange={handleInputChange}
              placeholder="Entrez votre code postal"
              error={errors.codePostal}
            />
          </>
        )
      case "profession":
        return (
          <>
            <SelectField
              label="Profession"
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              options={professions}
              error={errors.profession}
            />
            <SelectField
              label="Secteur d'activité"
              name="secteurActivite"
              value={formData.secteurActivite}
              onChange={handleInputChange}
              options={secteurs}
              error={errors.secteurActivite}
            />
            <FormField
              label="Employeur"
              name="employeur"
              value={formData.employeur}
              onChange={handleInputChange}
              placeholder="Nom de votre employeur"
              error={errors.employeur}
            />
            <FormField
              label="Salaire mensuel (DZD)"
              name="salaire"
              type="number"
              value={formData.salaire}
              onChange={handleInputChange}
              placeholder="Entrez votre salaire mensuel"
              error={errors.salaire}
            />
            <FormField
              label="Date d'embauche"
              name="dateEmbauche"
              type="date"
              value={formData.dateEmbauche}
              onChange={handleInputChange}
              error={errors.dateEmbauche}
            />
          </>
        )
      case "identite":
        return (
          <>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Instructions</p>
                <p>
                  Prenez une photo claire du recto et verso de votre carte d'identité. Évitez le flash et assurez-vous
                  que toutes les informations sont lisibles.
                </p>
              </div>
            </div>

            <FileInput
              label="Recto de la carte d'identité"
              name="carteIdentiteRecto"
              onChange={(e) => handleFileChange(e, "carteIdentiteRecto")}
              error={errors.carteIdentiteRecto}
              fileName={formData.carteIdentiteRecto?.name}
            />

            <FileInput
              label="Verso de la carte d'identité"
              name="carteIdentiteVerso"
              onChange={(e) => handleFileChange(e, "carteIdentiteVerso")}
              error={errors.carteIdentiteVerso}
              fileName={formData.carteIdentiteVerso?.name}
            />
          </>
        )
      case "justificatif":
        return (
          <>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Instructions</p>
                <p>
                  Téléversez un document valide à votre nom (ex. facture d'électricité, contrat de location) datant de
                  moins de 3 mois.
                </p>
              </div>
            </div>

            <FileInput
              label="Justificatif de résidence"
              name="justificatifResidence"
              onChange={(e) => handleFileChange(e, "justificatifResidence")}
              error={errors.justificatifResidence}
              fileName={formData.justificatifResidence?.name}
            />
          </>
        )
      case "contrat":
        return (
          <>
            <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50 mb-4">
              <h3 className="font-medium mb-2">Contrat d'ouverture de compte</h3>
              <p className="text-sm text-gray-600 mb-4">CONTRAT D'OUVERTURE DE COMPTE BANCAIRE</p>
              <p className="text-xs text-gray-600 mb-2">Entre les soussignés :</p>
              <p className="text-xs text-gray-600 mb-4">
                Algeria Gulf Bank, société par actions au capital de 20.000.000.000 DA, dont le siège social est situé à
                Alger, immatriculée au registre du commerce sous le numéro XX/XX-XXXXXXXX, représentée par son Directeur
                Général, ci-après dénommée "la Banque",
              </p>
              <p className="text-xs text-gray-600 mb-2">Et</p>
              <p className="text-xs text-gray-600 mb-4">
                Le client, identifié dans le formulaire d'ouverture de compte, ci-après dénommé "le Client",
              </p>
              <p className="text-xs text-gray-600 mb-2">Il a été convenu ce qui suit :</p>
              <p className="text-xs text-gray-600 mb-2">Article 1 : Objet du contrat</p>
              <p className="text-xs text-gray-600 mb-4">
                Le présent contrat a pour objet de définir les conditions d'ouverture, de fonctionnement et de clôture
                du compte bancaire ouvert par le Client auprès de la Banque.
              </p>
              <p className="text-xs text-gray-600 mb-2">Article 2 : Ouverture du compte</p>
              <p className="text-xs text-gray-600 mb-4">
                La Banque ouvre au Client un compte bancaire sous réserve de l'acceptation de sa demande et de la
                fourniture de l'ensemble des documents requis par la réglementation en vigueur.
              </p>
              <p className="text-xs text-gray-600">[Suite du contrat...]</p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptConditions"
                checked={formData.acceptConditions}
                onCheckedChange={(checked) => handleCheckboxChange("acceptConditions", checked === true)}
              />
              <label
                htmlFor="acceptConditions"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                J'ai lu et j'accepte les conditions générales d'utilisation et le contrat
              </label>
            </div>
            {errors.acceptConditions && <p className="text-[#EF4444] text-sm mt-1">{errors.acceptConditions}</p>}
          </>
        )
      case "signature":
        return (
          <>
            {!otpVerified ? (
              <>
                <div className="text-center mb-6">
                  <FileText className="h-16 w-16 text-[#003087] mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Vous allez signer votre contrat électroniquement</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    La signature électronique via e-Tawki3 est légalement reconnue en Algérie selon la loi 15-04.
                  </p>
                  <p className="text-sm text-gray-600">
                    Un code de vérification a été envoyé à votre numéro de téléphone
                  </p>
                  <p className="font-medium mt-1">+213 0770******</p>
                </div>

                <OtpInput value={formData.otpCode} onChange={handleOtpChange} error={errors.otpCode} />

                <div className="text-center">
                  <p className="text-gray-600 mb-2">
                    Expiration dans: <span className="font-medium">{formatTimer()}</span>
                  </p>
                  <Button variant="link" disabled={timer > 0} onClick={() => setTimer(180)} className="text-[#003087]">
                    Renvoyer le code
                  </Button>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full mt-4"
                  disabled={isLoading || formData.otpCode.some((digit) => !digit)}
                >
                  {isLoading ? "Vérification..." : "Valider et signer"}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#003087] mb-2">Signature réussie !</h3>
                <p className="text-gray-600 mb-6">
                  Votre contrat a été signé avec succès. Une copie a été envoyée à votre adresse email.
                </p>
                <Button variant="outline" className="flex items-center justify-center gap-2 w-full">
                  <Download className="h-4 w-4" /> Télécharger le contrat signé
                </Button>
              </div>
            )}
          </>
        )
      case "confirmation":
        return (
          <div className="text-center py-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#003087] mb-2">Félicitations !</h3>
            <p className="text-lg font-medium text-gray-700 mb-2">Votre compte est ouvert</p>

            <div className="bg-blue-50 p-4 rounded-lg text-center my-6">
              <p className="text-sm text-gray-600 mb-1">Votre IBAN</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-medium text-[#003087]">DZ12 3456 7890 1234 5678 9012</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Votre carte bancaire sera disponible sous 7 jours ouvrables à l'agence de votre choix.
            </p>

            <Button onClick={handleFinish} className="w-full mb-3">
              Accéder à mon compte
            </Button>

            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Download className="h-4 w-4" /> Télécharger le contrat signé
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-2">
            <ProgressIndicator
              currentStep={currentStepIndex + 1}
              totalSteps={steps.length}
              title={steps[currentStepIndex].title}
            />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>{renderStepContent()}</form>
          </CardContent>
          {currentStepIndex !== 9 && !(currentStepIndex === 8 && otpVerified) && (
            <CardFooter className="flex justify-between pt-2">
              {currentStepIndex > 0 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
              ) : (
                <Link href="/inscription" className="text-[#003087] text-sm hover:underline">
                  Retour à l'inscription
                </Link>
              )}

              {currentStepIndex < 9 && !(currentStepIndex === 8 && !otpVerified) && (
                <Button type="button" onClick={handleNext} disabled={isLoading} className="flex items-center gap-1">
                  {isLoading ? "Chargement..." : "Suivant"}
                  {!isLoading && <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
