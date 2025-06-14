"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import KPICard from "@/components/dashboard/kpi-card"
import RecommendationCard from "@/components/dashboard/recommendation-card"
import type { DashboardData, Recommendation } from "@/types/dashboard"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const mockDashboardData: DashboardData = {
  kpis: [
    { title: "Utilisateurs Actifs", value: "2,847", change: 12.5, trend: "up" },
    { title: "Comptes en Attente", value: "156", change: -8.2, trend: "down" },
    { title: "KYC Complétés", value: "1,923", change: 15.3, trend: "up" },
    { title: "Transactions Aujourd'hui", value: "847", change: 3.1, trend: "up" },
  ],
  recommendations: [
    {
      id: "1",
      title: "Activer un utilisateur en attente",
      description: "L'utilisateur ID 12345 a complété son KYC il y a 2 jours mais n'est pas encore activé",
      priority: "high",
      action: "Activer maintenant",
      actionUrl: "/confirmations",
      treated: false,
    },
    {
      id: "2",
      title: "Vérifier des documents suspects",
      description: "3 documents soumis aujourd'hui nécessitent une vérification manuelle",
      priority: "medium",
      action: "Vérifier documents",
      actionUrl: "/processes",
      treated: false,
    },
    {
      id: "3",
      title: "Relancer un utilisateur bloqué",
      description: "L'utilisateur ID 67890 est bloqué à l'étape de vérification depuis 5 jours",
      priority: "low",
      action: "Envoyer notification",
      treated: false,
    },
  ],
  chartData: [
    { name: "Jan", users: 400, transactions: 240 },
    { name: "Fév", users: 300, transactions: 139 },
    { name: "Mar", users: 520, transactions: 380 },
    { name: "Avr", users: 278, transactions: 390 },
    { name: "Mai", users: 189, transactions: 480 },
    { name: "Juin", users: 239, transactions: 380 },
  ],
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(mockDashboardData)
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockDashboardData.recommendations)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      // This would be replaced with actual API calls
      setDashboardData(mockDashboardData)
    }

    fetchDashboardData()
  }, [period])

  const handleRecommendationAction = (id: string) => {
    const recommendation = recommendations.find((r) => r.id === id)
    if (recommendation?.actionUrl) {
      window.location.href = recommendation.actionUrl
    }
  }

  const handleMarkTreated = (id: string) => {
    setRecommendations((prev) => prev.map((rec) => (rec.id === id ? { ...rec, treated: !rec.treated } : rec)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble des indicateurs clés et recommandations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant={period === "day" ? "primary" : "outline"} onClick={() => setPeriod("day")} size="sm">
            Jour
          </Button>
          <Button variant={period === "week" ? "primary" : "outline"} onClick={() => setPeriod("week")} size="sm">
            Semaine
          </Button>
          <Button variant={period === "month" ? "primary" : "outline"} onClick={() => setPeriod("month")} size="sm">
            Mois
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.kpis.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#1e3a8a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="transactions" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recommandations</h2>
          <span className="text-sm text-gray-500">
            {recommendations.filter((r) => !r.treated).length} recommandations actives
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onAction={handleRecommendationAction}
              onMarkTreated={handleMarkTreated}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
