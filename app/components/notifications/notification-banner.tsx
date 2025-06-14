"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Mail } from "lucide-react"
import { apiClient } from "@/lib/api"
import { cn } from "@/lib/utils"

interface NotificationBannerProps {
  className?: string
}

export function NotificationBanner({ className }: NotificationBannerProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [visible, setVisible] = useState(false)
  const [lastEmailSent, setLastEmailSent] = useState<string | null>(null)

  useEffect(() => {
    checkNotifications()
    const interval = setInterval(checkNotifications, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkNotifications = async () => {
    try {
      const response = await apiClient.getProcessStatus()
      if (response.success && response.data) {
        const activeNotifications = response.data.filter(
          (notif: any) => notif.status === "pending" || notif.status === "sent",
        )

        setNotifications(activeNotifications)

        // Check if email was recently sent
        const recentEmail = activeNotifications.find(
          (notif: any) => notif.last_reminder_sent && new Date(notif.last_reminder_sent).getTime() > Date.now() - 60000, // Last minute
        )

        if (recentEmail && !lastEmailSent) {
          setLastEmailSent(recentEmail.process_type)
          setVisible(true)

          // Auto-hide after 5 seconds
          setTimeout(() => {
            setVisible(false)
          }, 5000)
        }
      }
    } catch (error) {
      console.error("Error checking notifications:", error)
    }
  }

  const dismissBanner = () => {
    setVisible(false)
    setLastEmailSent(null)
  }

  if (!visible || !lastEmailSent) return null

  return (
    <Card
      className={cn(
        "fixed top-4 left-4 right-4 z-40 bg-green-50 border-green-200 shadow-lg",
        "animate-in slide-in-from-top-2 duration-300",
        className,
      )}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="h-4 w-4 text-green-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800">Email de confirmation envoyé !</p>
          <p className="text-xs text-green-600 mt-1">
            Vérifiez votre boîte mail pour les prochaines étapes de {lastEmailSent}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={dismissBanner}
          className="flex-shrink-0 text-green-600 hover:text-green-800 hover:bg-green-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
