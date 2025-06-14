"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProgressStep {
  step: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  notes?: string
  completed_at?: string
  created_at: string
}

interface ApplicationProgressProps {
  className?: string
}

const STEP_LABELS: Record<string, string> = {
  registration: "Inscription",
  personal_info: "Informations personnelles",
  document_upload: "Upload des documents",
  document_verification: "Vérification des documents",
  kyc_check: "Vérification KYC",
  risk_assessment: "Évaluation des risques",
  contract_signature: "Signature du contrat",
  account_activation: "Activation du compte",
  welcome: "Bienvenue",
}

const STEP_ORDER = [
  "registration",
  "personal_info",
  "document_upload",
  "document_verification",
  "kyc_check",
  "risk_assessment",
  "contract_signature",
  "account_activation",
  "welcome",
]

export function ApplicationProgress({ className }: ApplicationProgressProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getApplicationProgress()
      if (response.success && response.data) {
        setSteps(response.data.steps || [])
      } else {
        setError("Impossible de charger le statut de votre demande")
      }
    } catch (error) {
      console.error("Error loading progress:", error)
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (stepName: string): ProgressStep["status"] => {
    const step = steps.find((s) => s.step === stepName)
    return step?.status || "pending"
  }

  const getStepIcon = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepColor = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200"
      case "in_progress":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "rejected":
        return "text-red-700 bg-red-50 border-red-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const calculateProgress = () => {
    const completedSteps = steps.filter((s) => s.status === "completed").length
    return (completedSteps / STEP_ORDER.length) * 100
  }

  const getCurrentStep = () => {
    const currentStepIndex = STEP_ORDER.findIndex((stepName) => {
      const status = getStepStatus(stepName)
      return status === "pending" || status === "in_progress"
    })
    return currentStepIndex >= 0 ? currentStepIndex + 1 : STEP_ORDER.length
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1E3A8A]">Suivi de votre demande</CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Étape {getCurrentStep()} sur {STEP_ORDER.length}
            </span>
            <span>{Math.round(calculateProgress())}% complété</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {STEP_ORDER.map((stepName, index) => {
          const status = getStepStatus(stepName)
          const step = steps.find((s) => s.step === stepName)
          const isActive = status === "in_progress"

          return (
            <div
              key={stepName}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                getStepColor(status),
                isActive && "ring-2 ring-blue-200",
              )}
            >
              <div className="flex-shrink-0 mt-0.5">{getStepIcon(status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{STEP_LABELS[stepName] || stepName}</h4>
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
                {step?.notes && <p className="text-xs mt-1 text-gray-600">{step.notes}</p>}
                {step?.completed_at && (
                  <p className="text-xs mt-1 text-gray-500">
                    Complété le {new Date(step.completed_at).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
