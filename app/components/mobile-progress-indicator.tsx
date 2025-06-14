"use client"

import { Progress } from "@/components/ui/progress"

interface MobileProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  title: string
  subtitle?: string
}

export function MobileProgressIndicator({ currentStep, totalSteps, title, subtitle }: MobileProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1E3A8A] leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-[#1E3A8A]">Étape {currentStep}</span>
          <p className="text-xs text-gray-500">sur {totalSteps}</p>
        </div>
      </div>
      <Progress value={progress} className="h-3 bg-[#D1D5DB]" />
    </div>
  )
}
