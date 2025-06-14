"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { apiClient } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  role: "user" | "admin" | "director"
  account_status: string
  two_factor_enabled: boolean
  biometric_enabled: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
  updateProfile: (profileData: any) => Promise<boolean>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      apiClient.setToken(token)
      refreshUser()
    } else {
      setLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        apiClient.clearToken()
        setUser(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
      apiClient.clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login({ email, password })
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token)
        await refreshUser()
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiClient.register(userData)
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token)
        await refreshUser()
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      const response = await apiClient.updateProfile(profileData)
      if (response.success) {
        await refreshUser()
        return true
      }
      return false
    } catch (error) {
      console.error("Profile update error:", error)
      return false
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
  }
}

export { AuthContext }
