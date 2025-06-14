"use client"

import { useState, useEffect } from "react"
import { Search, Download, Calendar, User, MessageSquare, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import type { HistoryEntry, HistoryFilters } from "@/types/history"
import { formatDate } from "@/lib/utils"

const mockHistoryEntries: HistoryEntry[] = [
  {
    id: "1",
    date: "2024-01-15T14:30:00Z",
    type: "admin",
    action: "Activation de compte",
    details: "Compte utilisateur ID 12345 activé avec succès",
    userId: "12345",
    userName: "Ahmed Benali",
    adminId: "admin1",
    adminName: "Administrateur AGB",
  },
  {
    id: "2",
    date: "2024-01-15T13:45:00Z",
    type: "user",
    action: "Soumission de documents",
    details: "Documents KYC soumis pour vérification",
    userId: "12346",
    userName: "Fatima Khelifi",
  },
  {
    id: "3",
    date: "2024-01-15T12:20:00Z",
    type: "chatbot",
    action: "Interaction chatbot",
    details: "Utilisateur a demandé des informations sur le processus KYC",
    userId: "12347",
    userName: "Mohamed Saidi",
  },
  {
    id: "4",
    date: "2024-01-15T11:15:00Z",
    type: "system",
    action: "Transaction",
    details: "Virement de 50,000 DZD effectué",
    userId: "12345",
    userName: "Ahmed Benali",
    metadata: { amount: 50000, currency: "DZD", type: "transfer" },
  },
  {
    id: "5",
    date: "2024-01-15T10:30:00Z",
    type: "admin",
    action: "Connexion administrateur",
    details: "Connexion réussie au tableau de bord",
    adminId: "admin1",
    adminName: "Administrateur AGB",
  },
]

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(mockHistoryEntries)
  const [filteredEntries, setFilteredEntries] = useState<HistoryEntry[]>(mockHistoryEntries)
  const [filters, setFilters] = useState<HistoryFilters>({
    type: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
  })

  useEffect(() => {
    let filtered = entries

    if (filters.type !== "all") {
      filtered = filtered.filter((entry) => entry.type === filters.type)
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((entry) => new Date(entry.date) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      filtered = filtered.filter((entry) => new Date(entry.date) <= new Date(filters.dateTo))
    }

    if (filters.search) {
      filtered = filtered.filter(
        (entry) =>
          entry.action.toLowerCase().includes(filters.search.toLowerCase()) ||
          entry.details.toLowerCase().includes(filters.search.toLowerCase()) ||
          entry.userName?.toLowerCase().includes(filters.search.toLowerCase()) ||
          entry.adminName?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    setFilteredEntries(filtered)
  }, [filters, entries])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <User className="h-4 w-4" />
      case "user":
        return <User className="h-4 w-4" />
      case "chatbot":
        return <MessageSquare className="h-4 w-4" />
      case "system":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "admin":
        return <Badge variant="info">Admin</Badge>
      case "user":
        return <Badge variant="success">Utilisateur</Badge>
      case "chatbot":
        return <Badge variant="warning">Chatbot</Badge>
      case "system":
        return <Badge variant="default">Système</Badge>
      default:
        return <Badge variant="default">{type}</Badge>
    }
  }

  const handleExport = (format: "csv" | "pdf") => {
    // Simulate export functionality
    console.log(`Exporting ${filteredEntries.length} entries as ${format.toUpperCase()}`)

    if (format === "csv") {
      const csvContent = [
        ["Date", "Type", "Action", "Détails", "Utilisateur", "Admin"].join(","),
        ...filteredEntries.map((entry) =>
          [entry.date, entry.type, entry.action, entry.details, entry.userName || "", entry.adminName || ""].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `historique_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique</h1>
          <p className="text-gray-600 mt-1">Consultez l'historique complet des actions et interactions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
              />
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
            >
              <option value="all">Tous les types</option>
              <option value="admin">Admin</option>
              <option value="user">Utilisateur</option>
              <option value="chatbot">Chatbot</option>
              <option value="system">Système</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
              placeholder="Date de début"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
              placeholder="Date de fin"
            />

            <Button variant="outline" onClick={() => setFilters({ type: "all", dateFrom: "", dateTo: "", search: "" })}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Actions Admin</p>
                <p className="text-2xl font-bold text-gray-900">{entries.filter((e) => e.type === "admin").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Actions Utilisateur</p>
                <p className="text-2xl font-bold text-gray-900">{entries.filter((e) => e.type === "user").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Interactions Chatbot</p>
                <p className="text-2xl font-bold text-gray-900">{entries.filter((e) => e.type === "chatbot").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{entries.filter((e) => e.type === "system").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Actions ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Détails</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Admin</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(entry.type)}
                        {getTypeBadge(entry.type)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{entry.action}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{entry.details}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.userName || "-"}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{entry.adminName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
