"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  currentStep: string
  steps: string[]
}

export function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  const currentIndex = steps.indexOf(currentStep)
  const progress = (currentIndex / (steps.length - 1)) * 100

  return (
    <div className="w-full mb-6">
      <Progress value={progress} className="h-2" />
      <p className="text-center text-sm mt-2 text-agb-blue">
        Étape {currentIndex + 1} sur {steps.length}
      </p>
    </div>
  )
}
