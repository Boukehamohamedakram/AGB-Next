"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Shield } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Identifiants de test acceptés
      const validCredentials = [
        { email: "admin@agb.dz", password: "admin123" },
        { email: "admin@agb-algerie.com", password: "admin123" },
        { email: "directeur@agb.dz", password: "password" },
        { email: "admin@agb.com", password: "123456" },
      ]

      const isValidCredential = validCredentials.some(
        (cred) => cred.email === credentials.email && cred.password === credentials.password,
      )

      if (!show2FA && isValidCredential) {
        setShow2FA(true)
        setLoading(false)
        return
      }

      if (show2FA && credentials.twoFactorCode.length === 6) {
        // Simuler une connexion réussie
        const mockUser = {
          id: "1",
          email: credentials.email,
          name: "Administrateur AGB",
          role: "Admin",
          twoFactorEnabled: true,
        }

        // Simuler le login
        useAuth.getState().setUser(mockUser)
        router.push("/dashboard")
        return
      }

      throw new Error("Identifiants incorrects")
    } catch (err) {
      setError("Identifiants incorrects ou code 2FA invalide")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {!show2FA ? (
            <>
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <Image src="/agb-logo.png" alt="AGB Logo" width={80} height={80} className="object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion Administrateur</h1>
                <p className="text-gray-600 text-sm">Accédez au tableau de bord d'administration AGB Algérie</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email / Identifiant
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="admin@agb.dz"
                    style={{ color: credentials.email ? "#3b82f6" : "#6b7280" }}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              {/* Forgot Password Link */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => alert("Fonctionnalité à venir")}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 2FA Interface */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentification à deux facteurs</h1>
                <p className="text-gray-600 text-sm">Entrez le code de votre application d'authentification</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-900 mb-2">
                    Code d'authentification
                  </label>
                  <input
                    id="twoFactorCode"
                    type="text"
                    required
                    value={credentials.twoFactorCode}
                    onChange={(e) => setCredentials({ ...credentials, twoFactorCode: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest font-mono"
                    placeholder="123456"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Code à 6 chiffres de votre application d'authentification
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Vérification..." : "Vérifier le code"}
                </button>

                <button
                  type="button"
                  onClick={() => setShow2FA(false)}
                  className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm font-medium transition-colors"
                >
                  ← Retour à la connexion
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
