"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FormField, SelectField, OtpInput } from "@/components/form-field"
import { ProgressIndicator } from "@/components/progress-indicator"
import Link from "next/link"
import { ChevronLeft, ChevronRight, CheckCircle, User, Mail, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

export default function InscriptionPage() {
  const router = useRouter()

  // Définition des étapes
  const steps = [
    { id: "personal", title: "Informations personnelles" },
    { id: "contact", title: "Coordonnées" },
    { id: "password", title: "Mot de passe" },
    { id: "verification", title: "Vérification" },
    { id: "security", title: "Sécurité" },
    { id: "confirmation", title: "Confirmation" },
  ]

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    passwordConfirm: "",
    otpCode: ["", "", "", "", "", ""],
    securityQuestion1: "",
    securityAnswer1: "",
    securityQuestion2: "",
    securityAnswer2: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [timer, setTimer] = useState(180)
  const [isLoading, setIsLoading] = useState(false)

  // Gestion du timer pour l'OTP
  useEffect(() => {
    if (currentStepIndex === 3 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentStepIndex, timer])

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
      case 0: // Informations personnelles
        if (!formData.nom) newErrors.nom = "Le nom est requis"
        if (!formData.prenom) newErrors.prenom = "Le prénom est requis"
        break
      case 1: // Coordonnées
        if (!formData.email) newErrors.email = "L'email est requis"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Format d'email invalide"
        }
        if (!formData.telephone) newErrors.telephone = "Le numéro de téléphone est requis"
        else if (!/^\+213[5-7][0-9]{8}$/.test(formData.telephone)) {
          newErrors.telephone = "Format de téléphone invalide (ex: +213770123456)"
        }
        break
      case 2: // Mot de passe
        if (!formData.password) newErrors.password = "Le mot de passe est requis"
        else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
          newErrors.password =
            "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
        }
        if (!formData.passwordConfirm) newErrors.passwordConfirm = "La confirmation du mot de passe est requise"
        else if (formData.password !== formData.passwordConfirm) {
          newErrors.passwordConfirm = "Les mots de passe ne correspondent pas"
        }
        break
      case 3: // Vérification OTP
        if (formData.otpCode.some((digit) => !digit)) {
          newErrors.otpCode = "Veuillez entrer le code complet"
        }
        break
      case 4: // Questions de sécurité
        if (!formData.securityQuestion1) newErrors.securityQuestion1 = "Veuillez sélectionner une question"
        if (!formData.securityAnswer1) newErrors.securityAnswer1 = "La réponse est requise"
        if (!formData.securityQuestion2) newErrors.securityQuestion2 = "Veuillez sélectionner une question"
        if (formData.securityQuestion1 === formData.securityQuestion2) {
          newErrors.securityQuestion2 = "Veuillez choisir une question différente"
        }
        if (!formData.securityAnswer2) newErrors.securityAnswer2 = "La réponse est requise"
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

  const handleStartKYC = () => {
    // Stocker les données du formulaire dans localStorage pour les utiliser dans la page KYC
    localStorage.setItem("userFormData", JSON.stringify(formData))
    router.push("/kyc")
  }

  const getPasswordStrength = () => {
    if (!formData.password) return { text: "", color: "", width: "w-0" }

    if (formData.password.length < 8) {
      return { text: "Faible", color: "bg-red-500", width: "w-1/4" }
    }

    let strength = 0
    if (/[A-Z]/.test(formData.password)) strength++
    if (/[a-z]/.test(formData.password)) strength++
    if (/[0-9]/.test(formData.password)) strength++
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++

    if (strength === 4 && formData.password.length >= 8) {
      return { text: "Fort", color: "bg-green-500", width: "w-full" }
    } else if (strength >= 2) {
      return { text: "Moyen", color: "bg-yellow-500", width: "w-2/4" }
    } else {
      return { text: "Faible", color: "bg-red-500", width: "w-1/4" }
    }
  }

  const securityQuestions = [
    "Quel était le nom de votre première école ?",
    "Quel était le nom de votre premier animal de compagnie ?",
    "Dans quelle rue avez-vous grandi ?",
    "Quel est le prénom de votre meilleur(e) ami(e) d'enfance ?",
    "Quelle est la marque de votre premier téléphone mobile ?",
  ]

  const renderStepContent = () => {
    const currentStep = steps[currentStepIndex]

    switch (currentStep.id) {
      case "personal":
        return (
          <>
            <FormField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Entrez votre nom"
              error={errors.nom}
              icon={<User className="h-5 w-5" />}
            />
            <FormField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              placeholder="Entrez votre prénom"
              error={errors.prenom}
              icon={<User className="h-5 w-5" />}
            />
          </>
        )
      case "contact":
        return (
          <>
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="exemple@email.com"
              error={errors.email}
              icon={<Mail className="h-5 w-5" />}
            />
            <FormField
              label="Numéro de téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="+213770123456"
              error={errors.telephone}
              icon={<Phone className="h-5 w-5" />}
            />
          </>
        )
      case "password":
        return (
          <>
            <FormField
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Créez votre mot de passe"
              error={errors.password}
            />
            {formData.password && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full ${getPasswordStrength().color} ${getPasswordStrength().width} transition-all duration-300`}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Force: {getPasswordStrength().text}</p>
              </div>
            )}
            <FormField
              label="Confirmer le mot de passe"
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              placeholder="Confirmez votre mot de passe"
              error={errors.passwordConfirm}
            />
          </>
        )
      case "verification":
        return (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600">Un code de vérification a été envoyé à votre téléphone</p>
              <p className="font-medium mt-1">{formData.telephone}</p>
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
          </>
        )
      case "security":
        return (
          <>
            <p className="text-gray-600 mb-4 text-center">
              Ces questions permettent de sécuriser votre compte en cas de perte d'accès.
            </p>
            <SelectField
              label="Première question"
              name="securityQuestion1"
              value={formData.securityQuestion1}
              onChange={handleInputChange}
              options={securityQuestions}
              error={errors.securityQuestion1}
            />
            <FormField
              label="Réponse"
              name="securityAnswer1"
              value={formData.securityAnswer1}
              onChange={handleInputChange}
              placeholder="Votre réponse"
              error={errors.securityAnswer1}
            />
            <SelectField
              label="Deuxième question"
              name="securityQuestion2"
              value={formData.securityQuestion2}
              onChange={handleInputChange}
              options={securityQuestions}
              error={errors.securityQuestion2}
            />
            <FormField
              label="Réponse"
              name="securityAnswer2"
              value={formData.securityAnswer2}
              onChange={handleInputChange}
              placeholder="Votre réponse"
              error={errors.securityAnswer2}
            />
          </>
        )
      case "confirmation":
        return (
          <div className="text-center py-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#003087] mb-2">Félicitations!</h3>
            <p className="text-gray-600 mb-6">
              Votre compte a été créé avec succès. Vous pouvez maintenant commencer le processus d'ouverture de compte
              bancaire.
            </p>
            <Button onClick={handleStartKYC} className="w-full py-3">
              Commencer l'ouverture de compte
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
          {currentStepIndex !== 5 && (
            <CardFooter className="flex justify-between pt-2">
              {currentStepIndex > 0 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
              ) : (
                <Link href="/" className="text-[#003087] text-sm hover:underline">
                  Retour à la connexion
                </Link>
              )}

              {currentStepIndex < 5 && (
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
