"use client"

import { AlertCircle, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Recommendation } from "@/types/dashboard"

interface RecommendationCardProps {
  recommendation: Recommendation
  onAction: (id: string) => void
  onMarkTreated: (id: string) => void
}

export default function RecommendationCard({ recommendation, onAction, onMarkTreated }: RecommendationCardProps) {
  const getPriorityIcon = () => {
    switch (recommendation.priority) {
      case "high":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "medium":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      default:
        return "border-l-green-500"
    }
  }

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-200 border-l-4 ${getPriorityColor()} ${recommendation.treated ? "opacity-60" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getPriorityIcon()}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{recommendation.title}</h4>
              <p className="text-gray-600 mb-4">{recommendation.description}</p>
              <div className="flex space-x-2">
                {!recommendation.treated && (
                  <Button onClick={() => onAction(recommendation.id)} size="sm" className="shadow-sm">
                    {recommendation.action}
                  </Button>
                )}
                <Button onClick={() => onMarkTreated(recommendation.id)} variant="outline" size="sm">
                  {recommendation.treated ? "Marqué comme traité" : "Marquer comme traité"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
