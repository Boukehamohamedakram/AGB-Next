"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import Modal from "@/components/ui/modal"
import ProcessTimeline from "@/components/processes/process-timeline"
import type { ProcessStatus, UserProgress } from "@/types/process"

const mockProcesses: ProcessStatus[] = [
  {
    id: "1",
    userId: "12345",
    userName: "Ahmed Benali",
    email: "ahmed.benali@email.com",
    status: "pending",
    processType: "KYC",
    lastUpdate: "2024-01-15T10:30:00Z",
    currentStep: "Vérification documents",
    priority: "high",
  },
  {
    id: "2",
    userId: "12346",
    userName: "Fatima Khelifi",
    email: "fatima.khelifi@email.com",
    status: "in-progress",
    processType: "verification",
    lastUpdate: "2024-01-14T15:45:00Z",
    currentStep: "Signature électronique",
    priority: "medium",
  },
  {
    id: "3",
    userId: "12347",
    userName: "Mohamed Saidi",
    email: "mohamed.saidi@email.com",
    status: "completed",
    processType: "activation",
    lastUpdate: "2024-01-13T09:20:00Z",
    currentStep: "Compte activé",
    priority: "low",
  },
]

const mockUserProgress: UserProgress = {
  userId: "12345",
  userName: "Ahmed Benali",
  email: "ahmed.benali@email.com",
  steps: [
    {
      id: "1",
      name: "Soumission des documents",
      status: "completed",
      date: "2024-01-10T10:00:00Z",
      comment: "Documents reçus et validés",
    },
    {
      id: "2",
      name: "Vérification d'identité",
      status: "completed",
      date: "2024-01-12T14:30:00Z",
      comment: "Identité confirmée",
    },
    {
      id: "3",
      name: "Vérification documents",
      status: "in-progress",
      date: "2024-01-15T10:30:00Z",
      comment: "En cours de vérification manuelle",
    },
    {
      id: "4",
      name: "Activation du compte",
      status: "pending",
      comment: "En attente de validation finale",
    },
  ],
}

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<ProcessStatus[]>(mockProcesses)
  const [filteredProcesses, setFilteredProcesses] = useState<ProcessStatus[]>(mockProcesses)
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    processType: "all",
    search: "",
  })

  useEffect(() => {
    let filtered = processes

    if (filters.status !== "all") {
      filtered = filtered.filter((process) => process.status === filters.status)
    }

    if (filters.processType !== "all") {
      filtered = filtered.filter((process) => process.processType === filters.processType)
    }

    if (filters.search) {
      filtered = filtered.filter(
        (process) =>
          process.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          process.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          process.userId.includes(filters.search),
      )
    }

    setFilteredProcesses(filtered)
  }, [filters, processes])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Terminé</Badge>
      case "in-progress":
        return <Badge variant="info">En cours</Badge>
      case "pending":
        return <Badge variant="warning">En attente</Badge>
      case "rejected":
        return <Badge variant="danger">Rejeté</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="danger">Haute</Badge>
      case "medium":
        return <Badge variant="warning">Moyenne</Badge>
      case "low":
        return <Badge variant="success">Basse</Badge>
      default:
        return <Badge variant="default">{priority}</Badge>
    }
  }

  const handleViewDetails = (userId: string) => {
    // Simulate API call
    setSelectedUser(mockUserProgress)
    setIsModalOpen(true)
  }

  const criticalProcesses = processes.filter((p) => p.priority === "high" && p.status === "pending")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi des Processus</h1>
          <p className="text-gray-600 mt-1">Suivez les processus de tous les clients à travers chaque étape</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalProcesses.length > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-medium text-red-800">
                {criticalProcesses.length} processus critique(s) nécessitent une attention immédiate
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="rejected">Rejeté</option>
            </select>

            <select
              value={filters.processType}
              onChange={(e) => setFilters({ ...filters, processType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
            >
              <option value="all">Tous les types</option>
              <option value="KYC">KYC</option>
              <option value="verification">Vérification</option>
              <option value="activation">Activation</option>
            </select>

            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Processus ({filteredProcesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priorité</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Dernière MAJ</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map((process) => (
                  <tr key={process.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{process.userId}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{process.userName}</div>
                        <div className="text-sm text-gray-500">{process.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{process.processType}</Badge>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(process.status)}</td>
                    <td className="py-3 px-4">{getPriorityBadge(process.priority)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(process.lastUpdate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(process.userId)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Détails du processus - ${selectedUser?.userName}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                <p className="text-sm text-gray-900">{selectedUser.userName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Chronologie du processus</h4>
              <ProcessTimeline steps={selectedUser.steps} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
