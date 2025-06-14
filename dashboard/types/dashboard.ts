export interface KPI {
  title: string
  value: string
  change: number
  trend: "up" | "down" | "stable"
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  action: string
  actionUrl?: string
  treated: boolean
}

export interface DashboardData {
  kpis: KPI[]
  recommendations: Recommendation[]
  chartData: any[]
}
