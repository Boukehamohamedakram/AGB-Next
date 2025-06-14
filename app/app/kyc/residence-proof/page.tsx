"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProgressIndicator } from "@/components/progress-indicator"
import { ResidenceDocumentSelector } from "@/components/document-upload/residence-document-selector"
import { DocumentUploader } from "@/components/document-upload/document-uploader"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"

export default function ResidenceProofPage() {
  const router = useRouter()
  const [documentType, setDocumentType] = useState("facture")
  const [residenceFile, setResidenceFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Instructions spécifiques par type de document
  const documentInstructions = {
    facture:
      "Téléchargez une facture d'électricité, d'eau ou de gaz datant de moins de 3 mois. Le document doit comporter votre nom complet et votre adresse actuelle.",
    contrat:
      "Téléchargez votre contrat de location ou attestation de résidence datant de moins de 6 mois. Le document doit comporter votre nom complet et votre adresse actuelle.",
  }

  const handleFileSelected = (file: File | null) => {
    setResidenceFile(file)
    setErrors({}) // Clear errors when file is selected

    if (file) {
      // Store immediately when file is selected
      const documentData = {
        documentType: documentType,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        status: "ready",
      }
      localStorage.setItem("residenceProof", JSON.stringify(documentData))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!residenceFile) {
      newErrors.residenceFile = "Veuillez télécharger un justificatif de résidence"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      // Direct navigation to next step
      router.push("/kyc/selfie-verification")
    }
  }

  const handleBack = () => {
    router.push("/kyc/birth-certificate")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-2">
            <ProgressIndicator currentStep={1} totalSteps={1} title="Justificatif de résidence" />
          </CardHeader>
          <CardContent>
            <ResidenceDocumentSelector selectedType={documentType} onChange={setDocumentType} />

            <DocumentUploader
              title={documentType === "facture" ? "Facture" : "Contrat de location"}
              instructions={documentType === "facture" ? documentInstructions.facture : documentInstructions.contrat}
              onFileSelected={handleFileSelected}
              error={errors.residenceFile}
              acceptedFileTypes={["image/jpeg", "image/png", "application/pdf"]}
              existingFile={residenceFile}
            />

            {residenceFile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <span>✅</span> Document prêt : {residenceFile.name}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>

            <Button type="button" onClick={handleNext} disabled={!residenceFile} className="flex items-center gap-1">
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ChatbotWidget
        context={{
          page: "residence_proof",
          documentType,
          hasDocument: !!residenceFile,
        }}
      />
    </div>
  )
}
