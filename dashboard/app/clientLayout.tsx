"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import "./globals.css"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login")
    }
  }, [isAuthenticated, pathname, router])

  if (pathname === "/login") {
    return (
      <html lang="fr">
        <body>{children}</body>
      </html>
    )
  }

  if (!isAuthenticated) {
    return (
      <html lang="fr">
        <body>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-agb-primary"></div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="fr">
      <body>
        <div className="flex h-screen bg-white">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-64">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
