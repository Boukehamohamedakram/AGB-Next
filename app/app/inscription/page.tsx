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
    countryCode: "213",
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

  useEffect(() => {
    if (currentStepIndex === 3 && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [currentStepIndex, timer])

  const formatTimer = () => {
    const m = Math.floor(timer / 60), s = timer % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
  }

  const handleOtpChange = (i: number, v: string) => {
    const otp = [...formData.otpCode]; otp[i] = v
    setFormData(prev => ({ ...prev, otpCode: otp }))
    if (errors.otpCode) setErrors(prev => ({ ...prev, otpCode: "" }))
  }

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}
    const { countryCode, telephone } = formData

    switch (currentStepIndex) {
      case 0:
        if (!formData.nom) newErrors.nom = "Le nom est requis"
        if (!formData.prenom) newErrors.prenom = "Le prénom est requis"
        break
      case 1:
        if (!formData.email) newErrors.email = "L'email est requis"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = "Format d'email invalide"

        if (!telephone) newErrors.telephone = "Le numéro est requis"
        else {
          let regex: RegExp
          let placeholder = ""
          if (countryCode === "213") {
            regex = /^[5-7][0-9]{8}$/
            placeholder = "770123456"
          } else if (countryCode === "216") {
            regex = /^[2-9][0-9]{7}$/
            placeholder = "20123456"
          } else if (countryCode === "33") {
            regex = /^[1-9][0-9]{8}$/
            placeholder = "612345678"
          } else {
            regex = /^[0-9]+$/
          }
          if (!regex.test(telephone))
            newErrors.telephone = `Format invalide (ex: ${placeholder})`
        }
        break
      case 2:
        if (!formData.password) newErrors.password = "Le mot de passe est requis"
        else {
          const p = formData.password
          if (!(/[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p) && p.length >= 8))
            newErrors.password = "Le mot de passe doit faire ≥8 car., majuscule, minuscule, chiffre, caractère spécial."
        }
        if (!formData.passwordConfirm) newErrors.passwordConfirm = "La confirmation est requise"
        else if (formData.password !== formData.passwordConfirm)
          newErrors.passwordConfirm = "Les mots de passe ne correspondent pas"
        break
      case 3:
        if (formData.otpCode.some(d => !d))
          newErrors.otpCode = "Veuillez entrer le code complet"
        break
      case 4:
        const q1 = formData.securityQuestion1
        const q2 = formData.securityQuestion2
        if (!q1) newErrors.securityQuestion1 = "Veuillez sélectionner une question"
        if (!formData.securityAnswer1) newErrors.securityAnswer1 = "Réponse requise"
        if (!q2) newErrors.securityQuestion2 = "Veuillez sélectionner une autre question"
        if (q1 && q1 === q2) newErrors.securityQuestion2 = "Question identique"
        if (!formData.securityAnswer2) newErrors.securityAnswer2 = "Réponse requise"
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
        if (currentStepIndex < steps.length - 1)
          setCurrentStepIndex(idx => idx + 1)
      }, 500)
    }
  }

  const handleBack = () => currentStepIndex > 0 && setCurrentStepIndex(idx => idx - 1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleNext()
  }

  const handleStartKYC = () => {
    localStorage.setItem("userFormData", JSON.stringify(formData))
    router.push("/kyc")
  }

  const getPasswordStrength = () => {
    const p = formData.password
    let strength = (/[A-Z]/.test(p) + /[a-z]/.test(p) + /[0-9]/.test(p) + /[^A-Za-z0-9]/.test(p))
    if (strength === 4 && p.length >= 8) return { text: "Fort", color: "bg-green-500", width: "w-full" }
    else if (strength >= 2) return { text: "Moyen", color: "bg-yellow-500", width: "w-2/4" }
    else return { text: "Faible", color: "bg-red-500", width: "w-1/4" }
  }

  const securityQuestions = [
    "Quel était le nom de votre première école ?",
    "Quel était le nom de votre premier animal de compagnie ?",
    "Dans quelle rue avez-vous grandi ?",
    "Quel est le prénom de votre meilleur(e) ami(e) d'enfance ?",
    "Quelle est la marque de votre premier téléphone mobile ?",
  ]

  const renderStepContent = () => {
    const { countryCode } = formData
    switch (steps[currentStepIndex].id) {
      case "personal":
        return (
          <>
            <FormField label="Nom" name="nom" value={formData.nom} onChange={handleInputChange} placeholder="Entrez votre nom" error={errors.nom} icon={<User className="h-5 w-5" />} />
            <FormField label="Prénom" name="prenom" value={formData.prenom} onChange={handleInputChange} placeholder="Entrez votre prénom" error={errors.prenom} icon={<User className="h-5 w-5" />} />
          </>
        )
      case "contact":
        return (
          <>
            <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="exemple@email.com" error={errors.email} icon={<Mail className="h-5 w-5" />} />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Téléphone</label>
              <div className="flex items-center space-x-2">
                <select name="countryCode" value={countryCode} onChange={handleInputChange} className="px-3 py-2 border rounded-md text-sm">
                  <option value="213">🇩🇿 +213</option>
                  <option value="216">🇹🇳 +216</option>
                  <option value="33">🇫🇷 +33</option>
                </select>
                <div className="flex-1">
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder={
                    countryCode === "213" ? "770123456" :
                    countryCode === "216" ? "20123456" :
                    "612345678"
                  } className="w-full px-3 py-2 border rounded-md text-sm" />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>
              </div>
            </div>
          </>
        )
      case "password":
        return (
          <>
            <FormField label="Mot de passe" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Créez votre mot de passe" error={errors.password} />
            {formData.password && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className={`h-2 rounded-full ${getPasswordStrength().color} ${getPasswordStrength().width} transition-all duration-300`} />
                </div>
                <p className="text-xs text-gray-600 mt-1">Force : {getPasswordStrength().text}</p>
                <p className="text-xs text-gray-500 mt-1 italic">Ex : A123@bcd</p>
              </div>
            )}
            <FormField label="Confirmer le mot de passe" name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleInputChange} placeholder="Confirmez votre mot de passe" error={errors.passwordConfirm} />
          </>
        )
      case "verification":
        return (
          <>
            <div className="text-center mb-6">
              <p className="text-gray-600">Un code de vérification a été envoyé au :</p>
              <p className="font-medium mt-1">{`+${formData.countryCode}${formData.telephone}`}</p>
            </div>
            <OtpInput value={formData.otpCode} onChange={handleOtpChange} error={errors.otpCode} />
            <div className="text-center">
              <p className="text-gray-600 mb-2">Expiration dans : <span className="font-medium">{formatTimer()}</span></p>
              <Button variant="link" disabled={timer > 0} onClick={() => setTimer(180)} className="text-[#003087]">Renvoyer le code</Button>
            </div>
          </>
        )
      case "security":
        return (
          <>
            <p className="text-gray-600 mb-4 text-center">Ces questions sécurisent votre compte en cas de perte d'accès.</p>
            <SelectField label="Première question" name="securityQuestion1" value={formData.securityQuestion1} onChange={handleInputChange} options={securityQuestions} error={errors.securityQuestion1} />
            <FormField label="Réponse" name="securityAnswer1" value={formData.securityAnswer1} onChange={handleInputChange} placeholder="Votre réponse" error={errors.securityAnswer1} />
            <SelectField label="Deuxième question" name="securityQuestion2" value={formData.securityQuestion2} onChange={handleInputChange} options={securityQuestions} error={errors.securityQuestion2} />
            <FormField label="Réponse" name="securityAnswer2" value={formData.securityAnswer2} onChange={handleInputChange} placeholder="Votre réponse" error={errors.securityAnswer2} />
          </>
        )
      case "confirmation":
        return (
          <div className="text-center py-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#003087] mb-2">Félicitations !</h3>
            <p className="text-gray-600 mb-6">Votre compte a été créé avec succès. Vous pouvez maintenant commencer le processus d'ouverture de compte bancaire.</p>
            <Button onClick={handleStartKYC} className="w-full py-3">Commencer l'ouverture de compte</Button>
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
            <ProgressIndicator currentStep={currentStepIndex + 1} totalSteps={steps.length} title={steps[currentStepIndex].title} />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>{renderStepContent()}</form>
          </CardContent>
          {currentStepIndex !== steps.length - 1 && (
            <CardFooter className="flex justify-between pt-2">
              {currentStepIndex > 0 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
              ) : (
                <Link href="/" className="text-[#003087] text-sm hover:underline">Retour à la connexion</Link>
              )}
              <Button type="button" onClick={handleNext} disabled={isLoading} className="flex items-center gap-1">
                {isLoading ? "Chargement..." : "Suivant"}
                {!isLoading && <ChevronRight className="h-4 w-4" />}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
