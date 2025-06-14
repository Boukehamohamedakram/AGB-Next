"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckCircle, Copy, Download } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Header } from "@/components/header"

export default function ConfirmationPage() {
  const [copied, setCopied] = useState(false)

  const copyIban = () => {
    navigator.clipboard.writeText("DZ12 3456 7890 1234 5678 9012")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#003087]">Félicitations !</h2>
            <p className="text-lg text-gray-700 mt-1">Votre compte est ouvert</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Votre IBAN</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-medium text-[#003087]">DZ12 3456 7890 1234 5678 9012</p>
                <button
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={copyIban}
                  aria-label="Copier l'IBAN"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-1">Copié !</p>}
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Votre carte bancaire sera disponible sous 7 jours ouvrables à l'agence de votre choix.</p>
            </div>

            <div className="space-y-3 pt-2">
              <Link href="/dashboard">
                <Button className="w-full">✅ Accéder à votre compte</Button>
              </Link>

              <Button variant="outline" className="w-full flex items-center justify-center gap-1">
                <Download className="h-4 w-4" /> Télécharger le contrat signé
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
