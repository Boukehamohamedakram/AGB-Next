"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Camera, Upload, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function VerificationPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 2
  const [rectoUploaded, setRectoUploaded] = useState(false)
  const [versoUploaded, setVersoUploaded] = useState(false)
  const [justificatifUploaded, setJustificatifUploaded] = useState(false)

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      window.location.href = "/signature"
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
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
              <CardTitle className="text-xl text-blue-900">Vérification d'identité</CardTitle>
              <div className="text-sm text-gray-500">
                Étape {step}/{totalSteps}
              </div>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
            <CardDescription>
              {step === 1 && "Carte d'identité nationale"}
              {step === 2 && "Justificatif de résidence"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Instructions</p>
                    <p>
                      Prenez une photo claire du recto et verso de votre carte d'identité. Évitez le flash et
                      assurez-vous que toutes les informations sont lisibles.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Recto de la carte d'identité</p>

                    {!rectoUploaded ? (
                      <div className="flex flex-col gap-3">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                          <Image
                            src="/placeholder.svg?height=100&width=160"
                            alt="Exemple carte d'identité recto"
                            width={160}
                            height={100}
                            className="mb-4 rounded"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => setRectoUploaded(true)}
                            >
                              <Camera className="h-4 w-4" /> Prendre une photo
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <Image
                            src="/placeholder.svg?height=200&width=320"
                            alt="Carte d'identité recto"
                            width={320}
                            height={200}
                            className="w-full h-auto rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                              variant="outline"
                              className="bg-white/80 hover:bg-white"
                              onClick={() => setRectoUploaded(false)}
                            >
                              Reprendre
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Verso de la carte d'identité</p>

                    {!versoUploaded ? (
                      <div className="flex flex-col gap-3">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                          <Image
                            src="/placeholder.svg?height=100&width=160"
                            alt="Exemple carte d'identité verso"
                            width={160}
                            height={100}
                            className="mb-4 rounded"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => setVersoUploaded(true)}
                            >
                              <Camera className="h-4 w-4" /> Prendre une photo
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <Image
                            src="/placeholder.svg?height=200&width=320"
                            alt="Carte d'identité verso"
                            width={320}
                            height={200}
                            className="w-full h-auto rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Button
                              variant="outline"
                              className="bg-white/80 hover:bg-white"
                              onClick={() => setVersoUploaded(false)}
                            >
                              Reprendre
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Instructions</p>
                    <p>
                      Téléversez un document valide à votre nom (ex. facture d'électricité, contrat de location) datant
                      de moins de 3 mois.
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Justificatif de résidence</p>

                  {!justificatifUploaded ? (
                    <div className="flex flex-col gap-3">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                        <Image
                          src="/placeholder.svg?height=100&width=160"
                          alt="Exemple justificatif"
                          width={160}
                          height={100}
                          className="mb-4 rounded"
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => setJustificatifUploaded(true)}
                          >
                            <Camera className="h-4 w-4" /> Prendre une photo
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => setJustificatifUploaded(true)}
                          >
                            <Upload className="h-4 w-4" /> Téléverser un document
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Image
                          src="/placeholder.svg?height=200&width=320"
                          alt="Justificatif de résidence"
                          width={320}
                          height={200}
                          className="w-full h-auto rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            variant="outline"
                            className="bg-white/80 hover:bg-white"
                            onClick={() => setJustificatifUploaded(false)}
                          >
                            Reprendre
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={prevStep} className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Retour
              </Button>
            )}

            {step === 1 && <div className="flex-1"></div>}

            <Button
              onClick={nextStep}
              disabled={(step === 1 && (!rectoUploaded || !versoUploaded)) || (step === 2 && !justificatifUploaded)}
              className="flex items-center gap-1 bg-blue-800 hover:bg-blue-900 ml-auto"
            >
              {step < totalSteps ? "Suivant" : "Valider"} <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
