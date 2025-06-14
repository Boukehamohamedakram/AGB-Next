"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineStep {
  id: string
  title: string
  description: string
  status: "completed" | "current" | "pending" | "error"
  date?: string
}

interface TimelineProgressProps {
  steps: TimelineStep[]
  className?: string
}

export function TimelineProgress({ steps, className }: TimelineProgressProps) {
  const getStepIcon = (status: TimelineStep["status"], index: number) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "current":
        return (
          <div className="w-5 h-5 bg-[#1E3A8A] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  const getStepColor = (status: TimelineStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-700"
      case "current":
        return "text-[#1E3A8A] font-medium"
      case "error":
        return "text-red-700"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#1E3A8A]">Progression de votre demande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                {getStepIcon(step.status, index)}
                {index < steps.length - 1 && (
                  <div className={cn("w-px h-8 mt-2", step.status === "completed" ? "bg-green-200" : "bg-gray-200")} />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className={cn("font-medium", getStepColor(step.status))}>{step.title}</h4>
                  {step.date && <span className="text-xs text-gray-500">{step.date}</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                {step.status === "current" && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-[#1E3A8A] h-1 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
