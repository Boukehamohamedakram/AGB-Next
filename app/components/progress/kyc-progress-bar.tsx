"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface KYCStep {
  id: string
  title: string
  status: "completed" | "current" | "pending"
}

interface KYCProgressBarProps {
  currentPage: string
  className?: string
}

export function KYCProgressBar({ currentPage, className }: KYCProgressBarProps) {
  const steps: KYCStep[] = [
    { id: "identity-document", title: "Pièce d'identité", status: "completed" },
    { id: "birth-certificate", title: "Extrait de naissance", status: "completed" },
    { id: "residence-proof", title: "Justificatif de résidence", status: "completed" },
    { id: "selfie-verification", title: "Vérification d'identité", status: "current" },
    { id: "contrat", title: "Contrat", status: "pending" },
    { id: "signature", title: "Signature", status: "pending" },
  ]

  // Déterminer le statut basé sur la page actuelle
  const updateStepsStatus = () => {
    const pageOrder = [
      "identity-document",
      "birth-certificate",
      "residence-proof",
      "selfie-verification",
      "contrat",
      "signature",
    ]

    const currentIndex = pageOrder.findIndex((page) => currentPage.includes(page))

    return steps.map((step, index) => ({
      ...step,
      status: index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending",
    }))
  }

  const updatedSteps = updateStepsStatus()
  const currentStepIndex = updatedSteps.findIndex((step) => step.status === "current")
  const progress = ((currentStepIndex + 1) / updatedSteps.length) * 100

  const getStepIcon = (status: KYCStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "current":
        return <Clock className="h-4 w-4 text-[#1E3A8A]" />
      default:
        return <Circle className="h-4 w-4 text-gray-300" />
    }
  }

  return (
    <div className={cn("w-full bg-white border-b border-gray-200 p-4", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#1E3A8A]">Processus KYC</h2>
          <span className="text-sm text-gray-600">
            Étape {currentStepIndex + 1} sur {updatedSteps.length}
          </span>
        </div>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {updatedSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-xs",
                step.status === "completed" && "bg-green-50 text-green-700",
                step.status === "current" && "bg-blue-50 text-[#1E3A8A] font-medium",
                step.status === "pending" && "bg-gray-50 text-gray-500",
              )}
            >
              {getStepIcon(step.status)}
              <span className="truncate">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
