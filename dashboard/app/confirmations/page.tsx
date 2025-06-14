"use client"

import { useState, useEffect } from "react"
import { Search, Eye, Check, X, FileText, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Badge from "@/components/ui/badge"
import Modal from "@/components/ui/modal"
import type { PendingAccount } from "@/types/confirmation"
import { formatDate } from "@/lib/utils"

const mockPendingAccounts: PendingAccount[] = [
  {
    id: "1",
    userId: "12345",
    userName: "Ahmed Benali",
    email: "ahmed.benali@email.com",
    phone: "+213 555 123 456",
    submissionDate: "2024-01-15T10:30:00Z",
    status: "pending",
    documents: [
      {
        id: "1",
        type: "identity",
        name: "Carte d'identité nationale",
        url: "/placeholder.svg?height=400&width=600",
        status: "pending",
        uploadDate: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        type: "proof-address",
        name: "Facture électricité",
        url: "/placeholder.svg?height=400&width=600",
        status: "pending",
        uploadDate: "2024-01-15T10:35:00Z",
      },
    ],
    eSignature: {
      id: "1",
      signatureUrl: "/placeholder.svg?height=200&width=400",
      signedDate: "2024-01-15T10:40:00Z",
      ipAddress: "192.168.1.1",
      verified: true,
    },
  },
  {
    id: "2",
    userId: "12346",
    userName: "Fatima Khelifi",
    email: "fatima.khelifi@email.com",
    phone: "+213 555 789 012",
    submissionDate: "2024-01-14T15:45:00Z",
    status: "under-review",
    documents: [
      {
        id: "3",
        type: "identity",
        name: "Passeport",
        url: "/placeholder.svg?height=400&width=600",
        status: "approved",
        uploadDate: "2024-01-14T15:45:00Z",
      },
    ],
  },
]

export default function ConfirmationsPage() {
  const [accounts, setAccounts] = useState<PendingAccount[]>(mockPendingAccounts)
  const [filteredAccounts, setFilteredAccounts] = useState<PendingAccount[]>(mockPendingAccounts)
  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionComment, setActionComment] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  })

  useEffect(() => {
    let filtered = accounts

    if (filters.status !== "all") {
      filtered = filtered.filter((account) => account.status === filters.status)
    }

    if (filters.search) {
      filtered = filtered.filter(
        (account) =>
          account.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          account.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          account.userId.includes(filters.search),
      )
    }

    setFilteredAccounts(filtered)
  }, [filters, accounts])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approuvé</Badge>
      case "under-review":
        return <Badge variant="info">En révision</Badge>
      case "pending":
        return <Badge variant="warning">En attente</Badge>
      case "rejected":
        return <Badge variant="danger">Rejeté</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "identity":
        return "Pièce d'identité"
      case "proof-address":
        return "Justificatif de domicile"
      case "bank-statement":
        return "Relevé bancaire"
      default:
        return "Autre document"
    }
  }

  const handleViewDetails = (account: PendingAccount) => {
    setSelectedAccount(account)
    setIsModalOpen(true)
    setActionComment("")
  }

  const handleApprove = async (accountId: string) => {
    try {
      // Simulate API call
      console.log(`Approving account ${accountId} with comment: ${actionComment}`)

      setAccounts((prev) =>
        prev.map((account) => (account.id === accountId ? { ...account, status: "approved" } : account)),
      )

      setIsModalOpen(false)
      setActionComment("")
    } catch (error) {
      console.error("Error approving account:", error)
    }
  }

  const handleReject = async (accountId: string) => {
    try {
      // Simulate API call
      console.log(`Rejecting account ${accountId} with comment: ${actionComment}`)

      setAccounts((prev) =>
        prev.map((account) => (account.id === accountId ? { ...account, status: "rejected" } : account)),
      )

      setIsModalOpen(false)
      setActionComment("")
    } catch (error) {
      console.error("Error rejecting account:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Confirmation de Compte</h1>
          <p className="text-gray-600 mt-1">Gérez les demandes d'activation de compte en attente</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="under-review">En révision</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center">Total: {filteredAccounts.length} compte(s)</div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comptes en Attente de Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date soumission</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Documents</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{account.userId}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{account.userName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm text-gray-900">{account.email}</div>
                        <div className="text-sm text-gray-500">{account.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(account.submissionDate)}</td>
                    <td className="py-3 px-4">{getStatusBadge(account.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{account.documents.length}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(account)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Examiner
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Account Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Confirmation de compte - ${selectedAccount?.userName}`}
        size="xl"
      >
        {selectedAccount && (
          <div className="space-y-6">
            {/* Account Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                <p className="text-sm text-gray-900">{selectedAccount.userName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedAccount.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="text-sm text-gray-900">{selectedAccount.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de soumission</label>
                <p className="text-sm text-gray-900">{formatDate(selectedAccount.submissionDate)}</p>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Documents soumis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedAccount.documents.map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{getDocumentTypeName(document.type)}</h5>
                        <p className="text-sm text-gray-500">{document.name}</p>
                      </div>
                      {getStatusBadge(document.status)}
                    </div>
                    <div className="mt-3">
                      <img
                        src={document.url || "/placeholder.svg"}
                        alt={document.name}
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Téléchargé le {formatDate(document.uploadDate)}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E-Signature */}
            {selectedAccount.eSignature && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Signature électronique</h4>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de signature</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedAccount.eSignature.signedDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adresse IP</label>
                      <p className="text-sm text-gray-900">{selectedAccount.eSignature.ipAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={selectedAccount.eSignature.signatureUrl || "/placeholder.svg"}
                      alt="Signature"
                      className="h-16 border rounded"
                    />
                    {selectedAccount.eSignature.verified && <Badge variant="success">Signature vérifiée</Badge>}
                  </div>
                </div>
              </div>
            )}

            {/* Action Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agb-primary focus:border-agb-primary"
                placeholder="Ajoutez un commentaire pour justifier votre décision..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={() => handleReject(selectedAccount.id)} className="flex items-center">
                <X className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
              <Button onClick={() => handleApprove(selectedAccount.id)} className="flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Approuver
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
