"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, FileText, Download, CheckCircle } from "lucide-react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { OtpInput } from "@/components/form-field"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"

export default function SignaturePage() {
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [otpCompleted, setOtpCompleted] = useState(false)
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""])

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      window.location.href = "/confirmation"
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otpCode]
    newOtp[index] = value
    setOtpCode(newOtp)
  }

  const handleOtpComplete = () => {
    if (otpCode.every((digit) => digit !== "")) {
      setOtpCompleted(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Image
            src="/placeholder.svg?height=80&width=200"
            alt="AGB Logo"
            width={200}
            height={80}
            className="h-16 w-auto"
          />
        </div>

        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl text-blue-900">Signature électronique</CardTitle>
              <div className="text-sm text-gray-500">
                Étape {step}/{totalSteps}
              </div>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
            <CardDescription>
              {step === 1 && "Pré-signature"}
              {step === 2 && "Contrat"}
              {step === 3 && "Confirmation"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <FileText className="h-16 w-16 text-blue-800" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Vous allez signer votre contrat électroniquement</h3>
                  <p className="text-sm text-gray-600">
                    La signature électronique via e-Tawki3 est légalement reconnue en Algérie selon la loi 15-04.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                  <p>
                    Assurez-vous d'avoir votre téléphone à portée de main pour recevoir le code de validation par SMS.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
                  <h3 className="font-medium mb-2">Contrat d'ouverture de compte</h3>
                  <p className="text-sm text-gray-600 mb-4">CONTRAT D'OUVERTURE DE COMPTE BANCAIRE</p>
                  <p className="text-xs text-gray-600 mb-2">Entre les soussignés :</p>
                  <p className="text-xs text-gray-600 mb-4">
                    Algeria Gulf Bank, société par actions au capital de 20.000.000.000 DA, dont le siège social est
                    situé à Alger, immatriculée au registre du commerce sous le numéro XX/XX-XXXXXXXX, représentée par
                    son Directeur Général, ci-après dénommée "la Banque",
                  </p>
                  <p className="text-xs text-gray-600 mb-2">Et</p>
                  <p className="text-xs text-gray-600 mb-4">
                    Le client, identifié dans le formulaire d'ouverture de compte, ci-après dénommé "le Client",
                  </p>
                  <p className="text-xs text-gray-600 mb-2">Il a été convenu ce qui suit :</p>
                  <p className="text-xs text-gray-600 mb-2">Article 1 : Objet du contrat</p>
                  <p className="text-xs text-gray-600 mb-4">
                    Le présent contrat a pour objet de définir les conditions d'ouverture, de fonctionnement et de
                    clôture du compte bancaire ouvert par le Client auprès de la Banque.
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
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    J'ai lu et j'accepte les conditions générales d'utilisation et le contrat
                  </label>
                </div>
              </div>
            )}

            {step === 3 && !otpCompleted && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium mb-2">Entrez le code reçu par SMS</h3>
                  <p className="text-sm text-gray-600">
                    Un code de vérification a été envoyé à votre numéro de téléphone
                  </p>
                  <p className="font-medium">+213 0770******</p>
                </div>

                <OtpInput value={otpCode} onChange={handleOtpChange} />

                <div className="text-center text-sm">
                  <div className="text-gray-500 mb-2">
                    Expiration dans: <span className="font-medium">02:59</span>
                  </div>
                  <button className="text-blue-600 hover:underline">Renvoyer le code</button>
                </div>
                <Button
                  onClick={handleOtpComplete}
                  className="w-full bg-blue-800 hover:bg-blue-900"
                  disabled={!otpCode.every((digit) => digit !== "")}
                >
                  Valider et signer
                </Button>
              </div>
            )}

            {step === 3 && otpCompleted && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Votre contrat a été signé avec succès !</h3>
                  <p className="text-sm text-gray-600">
                    Une copie du contrat signé a été envoyée à votre adresse email.
                  </p>
                </div>
                <Button variant="outline" className="flex items-center gap-1 w-full">
                  <Download className="h-4 w-4" /> Télécharger le contrat signé
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step > 1 && step < 3 && (
              <Button variant="outline" onClick={prevStep} className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
            )}

            {step === 1 && <div className="flex-1"></div>}

            {step === 1 && (
              <Button onClick={nextStep} className="flex items-center gap-1 bg-blue-800 hover:bg-blue-900 ml-auto">
                Lire et signer le contrat <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {step === 2 && (
              <Button
                onClick={nextStep}
                disabled={!acceptTerms}
                className="flex items-center gap-1 bg-blue-800 hover:bg-blue-900 ml-auto"
              >
                Continuer vers la signature <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {step === 3 && otpCompleted && (
              <Button
                onClick={() => (window.location.href = "/confirmation")}
                className="w-full bg-blue-800 hover:bg-blue-900"
              >
                ✅ Accéder à votre compte
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <ChatbotWidget
        context={{
          page: "signature",
          step,
          acceptTerms,
          otpCompleted,
        }}
      />
    </div>
  )
}
