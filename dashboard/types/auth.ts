export interface LoginCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  twoFactorEnabled: boolean
}

export interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  loading: boolean
}
