"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, AdminUser, LoginCredentials } from "@/types/auth"

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  setUser: (user: AdminUser | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      login: async (credentials: LoginCredentials) => {
        set({ loading: true })
        try {
          // Simulate API call
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          })

          if (response.ok) {
            const userData = await response.json()
            set({
              user: userData.user,
              isAuthenticated: true,
              loading: false,
            })
          } else {
            throw new Error("Login failed")
          }
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user: AdminUser | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setLoading: (loading: boolean) => {
        set({ loading })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
