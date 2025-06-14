"use client"

import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import type { ProcessStep } from "@/types/process"
import { formatDate } from "@/lib/utils"

interface ProcessTimelineProps {
  steps: ProcessStep[]
}

export default function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500"
      case "in-progress":
        return "border-blue-500"
      case "rejected":
        return "border-red-500"
      default:
        return "border-gray-300"
    }
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${getStepColor(step.status)}`}
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${getStepColor(step.status)} bg-white`}
                >
                  {getStepIcon(step.status)}
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step.name}</p>
                    {step.comment && <p className="text-sm text-gray-500">{step.comment}</p>}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {step.date && formatDate(step.date)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
