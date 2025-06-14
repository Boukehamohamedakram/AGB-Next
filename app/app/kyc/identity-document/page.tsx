"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ProgressIndicator } from "@/components/progress-indicator"
import { DocumentTypeSelector } from "@/components/document-upload/document-type-selector"
import { DocumentUploader } from "@/components/document-upload/document-uploader"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"

export default function IdentityDocumentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [documentType, setDocumentType] = useState("cni")
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Documents téléchargés - États séparés pour éviter la confusion
  const [rectoFile, setRectoFile] = useState<File | null>(null)
  const [versoFile, setVersoFile] = useState<File | null>(null)
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [permisFile, setPermisFile] = useState<File | null>(null)

  // Instructions spécifiques par type de document
  const documentInstructions = {
    cni: {
      recto:
        "Prenez une photo claire du RECTO de votre carte d'identité. Assurez-vous que toutes les informations sont lisibles et que les quatre coins sont visibles.",
      verso:
        "Prenez une photo claire du VERSO de votre carte d'identité. Assurez-vous que toutes les informations sont lisibles et que les quatre coins sont visibles.",
    },
    passport:
      "Prenez une photo de la page principale de votre passeport contenant votre photo et vos informations personnelles. Assurez-vous que le texte est parfaitement lisible.",
    permis:
      "Prenez une photo claire du recto de votre permis de conduire. Assurez-vous que toutes les informations sont lisibles et que les quatre coins sont visibles.",
  }

  // Réinitialiser les fichiers quand le type de document change
  useEffect(() => {
    setCurrentStep(1)
    setRectoFile(null)
    setVersoFile(null)
    setPassportFile(null)
    setPermisFile(null)
    setErrors({})
  }, [documentType])

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    if (documentType === "cni") {
      if (currentStep === 1 && !rectoFile) {
        newErrors.recto = "Veuillez télécharger le recto de votre carte d'identité"
      } else if (currentStep === 2 && !versoFile) {
        newErrors.verso = "Veuillez télécharger le verso de votre carte d'identité"
      }
    } else if (documentType === "passport" && !passportFile) {
      newErrors.passport = "Veuillez télécharger la page principale de votre passeport"
    } else if (documentType === "permis" && !permisFile) {
      newErrors.permis = "Veuillez télécharger votre permis de conduire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)

        if (documentType === "cni" && currentStep === 1) {
          setCurrentStep(2)
        } else {
          // Stocker les données dans localStorage
          const documentData = {
            type: documentType,
            files: {
              cni: {
                recto: rectoFile?.name || null,
                verso: versoFile?.name || null,
              },
              passport: passportFile?.name || null,
              permis: permisFile?.name || null,
            },
          }
          localStorage.setItem("identityDocument", JSON.stringify(documentData))

          // Rediriger vers l'extrait de naissance
          router.push("/kyc/birth-certificate")
        }
      }, 500)
    }
  }

  const handleBack = () => {
    if (documentType === "cni" && currentStep === 2) {
      setCurrentStep(1)
      // Réinitialiser le verso quand on revient au recto
      setVersoFile(null)
      setErrors({})
    } else {
      router.push("/kyc")
    }
  }

  // Déterminer le titre et l'étape actuelle
  const getStepTitle = () => {
    if (documentType === "cni") {
      return currentStep === 1 ? "Carte d'identité (Recto)" : "Carte d'identité (Verso)"
    } else if (documentType === "passport") {
      return "Passeport"
    } else {
      return "Permis de conduire"
    }
  }

  const getTotalSteps = () => {
    return documentType === "cni" ? 2 : 1
  }

  const renderDocumentUploader = () => {
    if (documentType === "cni") {
      if (currentStep === 1) {
        return (
          <DocumentUploader
            title="Recto de la carte d'identité"
            instructions={documentInstructions.cni.recto}
            onFileSelected={setRectoFile}
            error={errors.recto}
            existingFile={rectoFile}
          />
        )
      } else {
        return (
          <DocumentUploader
            title="Verso de la carte d'identité"
            instructions={documentInstructions.cni.verso}
            onFileSelected={setVersoFile}
            error={errors.verso}
            existingFile={versoFile}
          />
        )
      }
    } else if (documentType === "passport") {
      return (
        <DocumentUploader
          title="Page principale du passeport"
          instructions={documentInstructions.passport}
          onFileSelected={setPassportFile}
          error={errors.passport}
          existingFile={passportFile}
        />
      )
    } else {
      return (
        <DocumentUploader
          title="Permis de conduire"
          instructions={documentInstructions.permis}
          onFileSelected={setPermisFile}
          error={errors.permis}
          existingFile={permisFile}
        />
      )
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="pb-2">
            <ProgressIndicator currentStep={currentStep} totalSteps={getTotalSteps()} title={getStepTitle()} />
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <DocumentTypeSelector selectedType={documentType} onChange={setDocumentType} />}

            {renderDocumentUploader()}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Retour
            </Button>

            <Button type="button" onClick={handleNext} disabled={isLoading} className="flex items-center gap-1">
              {isLoading ? "Chargement..." : "Suivant"}
              {!isLoading && <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ChatbotWidget
        context={{
          page: "identity_document",
          step: currentStep,
          documentType,
          hasRecto: !!rectoFile,
          hasVerso: !!versoFile,
        }}
      />
    </div>
  )
}
