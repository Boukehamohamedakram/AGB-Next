"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApplicationProgress } from "@/components/progress/application-progress"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api"
import { CreditCard, TrendingUp, Gift, Bell, Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Account {
  id: number
  account_type: string
  account_number: string
  balance: number
  currency: string
  status: string
}

interface Transaction {
  id: number
  amount: number
  transaction_type: string
  description: string
  created_at: string
  status: string
}

interface Notification {
  id: number
  process_type: string
  status: string
  last_step: string
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fidelityPoints, setFidelityPoints] = useState(0)
  const [offers, setOffers] = useState([])
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load accounts
      const accountsResponse = await apiClient.getAccounts()
      if (accountsResponse.success) {
        setAccounts(accountsResponse.data || [])
      }

      // Load recent transactions
      const transactionsResponse = await apiClient.getTransactions()
      if (transactionsResponse.success) {
        setTransactions((transactionsResponse.data || []).slice(0, 5))
      }

      // Load notifications
      const notificationsResponse = await apiClient.getNotifications()
      if (notificationsResponse.success) {
        setNotifications(notificationsResponse.data || [])
      }

      // Load fidelity points
      const fidelityResponse = await apiClient.getFidelityPoints()
      if (fidelityResponse.success) {
        setFidelityPoints(fidelityResponse.data?.points || 0)
      }

      // Load offers
      const offersResponse = await apiClient.getOffers()
      if (offersResponse.success) {
        setOffers(offersResponse.data || [])
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance: number) => {
    if (!balanceVisible) return "••••••"
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 2,
    }).format(balance)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "transfer":
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0)
  }

  if (!user) {
    router.push("/")
    return null
  }

  if (user.account_status === "pending") {
    return (
      <div className="min-h-screen bg-[#F3F4F6]">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">Bienvenue, {user.first_name || user.username} !</h1>
            <p className="text-gray-600">Votre demande d'ouverture de compte est en cours de traitement</p>
          </div>

          <ApplicationProgress className="mb-8" />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">{notification.process_type}</p>
                        <p className="text-xs text-blue-700">Étape: {notification.last_step}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune notification</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Points de fidélité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1E3A8A] mb-2">{fidelityPoints}</div>
                  <p className="text-sm text-gray-600">Points disponibles</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <ChatbotWidget context={{ page: "dashboard", userStatus: "pending" }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">Bonjour, {user.first_name || user.username} !</h1>
          <p className="text-gray-600">Voici un aperçu de vos comptes et activités récentes</p>
        </div>

        {/* Accounts Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Solde total
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setBalanceVisible(!balanceVisible)}>
                {balanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1E3A8A] mb-4">{formatBalance(getTotalBalance())}</div>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{account.account_type}</p>
                      <p className="text-xs text-gray-500">••••{account.account_number.slice(-4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatBalance(account.balance)}</p>
                      <p className="text-xs text-gray-500">{account.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ouvrir un nouveau compte
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Fidélité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1E3A8A] mb-2">{fidelityPoints}</div>
                <p className="text-sm text-gray-600 mb-4">Points disponibles</p>
                <Button size="sm" variant="outline" className="w-full">
                  Voir les récompenses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions and Offers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Transactions récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description || transaction.transaction_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.transaction_type === "deposit" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.transaction_type === "deposit" ? "+" : "-"}
                          {formatBalance(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Voir toutes les transactions
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune transaction récente</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Offres personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offers.length > 0 ? (
                <div className="space-y-3">
                  {offers.slice(0, 3).map((offer: any) => (
                    <div key={offer.id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                      <h4 className="font-medium text-sm text-[#1E3A8A] mb-1">{offer.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{offer.description}</p>
                      <Button size="sm" variant="outline" className="text-xs">
                        En savoir plus
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune offre disponible</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatbotWidget context={{ page: "dashboard", userStatus: "active", accounts, fidelityPoints }} />
    </div>
  )
}
