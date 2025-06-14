"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProgressIndicator } from "@/components/progress-indicator"
import { DocumentUploader } from "@/components/document-upload/document-uploader"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"

export default function BirthCertificatePage() {
  const router = useRouter()
  const [birthCertificateFile, setBirthCertificateFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const documentInstructions =
    "Téléchargez votre extrait de naissance (acte de naissance) datant de moins de 6 mois. Le document doit être lisible et comporter toutes vos informations d'état civil."

  const handleFileSelected = (file: File | null) => {
    setBirthCertificateFile(file)
    setErrors({}) // Clear errors when file is selected

    if (file) {
      // Store immediately when file is selected
      const documentData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        status: "ready",
      }
      localStorage.setItem("birthCertificate", JSON.stringify(documentData))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!birthCertificateFile) {
      newErrors.birthCertificate = "Veuillez télécharger votre extrait de naissance"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // Direct navigation to next step
      router.push("/kyc/residence-proof")
    }
  }

  const handleBack = () => {
    router.push("/kyc/identity-document")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-2">
            <ProgressIndicator currentStep={1} totalSteps={1} title="Extrait de naissance" />
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 text-[#1E3A8A] mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Extrait de naissance</h3>
              <p className="text-sm text-gray-600">
                Ce document est requis pour vérifier votre état civil et compléter votre dossier d'ouverture de compte.
              </p>
            </div>

            <DocumentUploader
              title="Extrait de naissance"
              instructions={documentInstructions}
              onFileSelected={handleFileSelected}
              error={errors.birthCertificate}
              acceptedFileTypes={["image/jpeg", "image/png", "application/pdf"]}
              existingFile={birthCertificateFile}
            />

            {birthCertificateFile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <span>✅</span> Document prêt : {birthCertificateFile.name}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!birthCertificateFile}
              className="flex items-center gap-1"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ChatbotWidget
        context={{
          page: "birth_certificate",
          hasDocument: !!birthCertificateFile,
        }}
      />
    </div>
  )
}
