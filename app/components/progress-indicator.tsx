import { Progress } from "@/components/ui/progress"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  title: string
}

export function ProgressIndicator({ currentStep, totalSteps, title }: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-[#003087]">{title}</h2>
        <span className="text-sm text-gray-500">
          Étape {currentStep} sur {totalSteps}
        </span>
      </div>
      <Progress value={progress} />
    </div>
  )
}
