"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField } from "@/components/form-field"
import Link from "next/link"
import { Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"

export default function LoginPage() {
  const router = useRouter()
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ emailOrPhone?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: { emailOrPhone?: string; password?: string } = {}
    if (!emailOrPhone) newErrors.emailOrPhone = "Ce champ est requis."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone) && !/^\+213[5-7][0-9]{8}$/.test(emailOrPhone)) {
      newErrors.emailOrPhone = "Email ou numéro de téléphone invalide."
    }
    if (!password) newErrors.password = "Ce champ est requis."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      setIsLoading(true)
      // Simulation d'appel API
      setTimeout(() => {
        setIsLoading(false)
        router.push("/inscription")
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-4">
      <div className="w-full max-w-md">
        <Header />

        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-[#003087]">Connexion</CardTitle>
            <p className="text-gray-600 mt-1">Accédez à votre compte AGB Next</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Email ou numéro de téléphone"
                name="emailOrPhone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="exemple@agb.dz ou +213770123456"
                error={errors.emailOrPhone}
                icon={<Mail className="h-5 w-5" />}
              />

              <FormField
                label="Mot de passe"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                error={errors.password}
                icon={<Lock className="h-5 w-5" />}
              />

              <div className="flex justify-end">
                <Link href="/mot-de-passe-oublie" className="text-sm text-[#003087] hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>

              <Button type="submit" className="w-full py-3 mt-2" disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col pt-2">
            <div className="text-center w-full">
              <span className="text-sm text-gray-600">Vous n'avez pas de compte?</span>{" "}
              <Link href="/inscription" className="text-sm text-[#003087] hover:underline font-medium">
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
