"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { KPI } from "@/types/dashboard"

interface KPICardProps {
  kpi: KPI
}

export default function KPICard({ kpi }: KPICardProps) {
  const getTrendIcon = () => {
    switch (kpi.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (kpi.trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-agb-primary">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {kpi.change > 0 ? "+" : ""}
              {kpi.change}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
