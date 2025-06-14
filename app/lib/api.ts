"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      ...options.headers,
    }

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      console.log(`API Request: ${options.method || "GET"} ${url}`)

      const response = await fetch(url, {
        ...options,
        headers,
      })

      let data
      try {
        data = await response.json()
      } catch (e) {
        // If response is not JSON, create a generic response
        data = { message: response.statusText }
      }

      console.log(`API Response: ${response.status}`, data)

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("API Request failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur de connexion au serveur",
      }
    }
  }

  // Auth endpoints
  async register(userData: any) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async getProfile() {
    return this.request("/auth/me")
  }

  async updateProfile(profileData: any) {
    return this.request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  async enable2FA() {
    return this.request("/auth/enable-2fa", { method: "POST" })
  }

  async request2FA() {
    return this.request("/auth/request-2fa", { method: "POST" })
  }

  async verify2FA(code: string) {
    return this.request("/auth/verify-2fa", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  }

  async registerFace(faceData: any) {
    return this.request("/auth/register-face", {
      method: "POST",
      body: JSON.stringify(faceData),
    })
  }

  async verifyFace(faceData: any) {
    return this.request("/auth/verify-face", {
      method: "POST",
      body: JSON.stringify(faceData),
    })
  }

  // KYC and Verification endpoints
  async uploadDocument(formData: FormData) {
    // Add timeout and better error handling for file uploads
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await this.request("/verification/upload-document", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Document upload failed:", error)

      // Return a more user-friendly error for upload failures
      return {
        success: false,
        error: "Échec du téléchargement. Vérifiez votre connexion et réessayez.",
      }
    }
  }

  async getApplicationProgress() {
    return this.request("/verification/application-progress")
  }

  async kycCheck(data: any) {
    return this.request("/kyc/kyc/check", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Accounts endpoints
  async getAccounts() {
    return this.request("/accounts/")
  }

  async createAccount(accountData: any) {
    return this.request("/accounts/", {
      method: "POST",
      body: JSON.stringify(accountData),
    })
  }

  // Transactions endpoints
  async getTransactions() {
    return this.request("/transactions/")
  }

  async createTransaction(transactionData: any) {
    return this.request("/transactions/", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request("/notifications/notifications")
  }

  async completeNotification(notificationId: string) {
    return this.request(`/notifications/notifications/${notificationId}/complete`, {
      method: "POST",
    })
  }

  async getProcessStatus() {
    return this.request("/notifications/notifications/process-status")
  }

  // Recommendations endpoints
  async getOffers() {
    return this.request("/recommendations/offers")
  }

  async getFidelityPoints() {
    return this.request("/recommendations/fidelity-points")
  }

  async getRecommendedPacks() {
    return this.request("/packs/packs/recommendation")
  }

  // Chatbot endpoints
  async chatWithBot(message: string, context?: any) {
    return this.request("/chatbot/chat", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    })
  }

  async getChatHistory() {
    return this.request("/chatbot/history")
  }

  async analyzePhoto(photoData: any) {
    return this.request("/chatbot/photo", {
      method: "POST",
      body: JSON.stringify(photoData),
    })
  }

  async getChatPreferences() {
    return this.request("/chatbot/preferences")
  }

  async updateChatPreferences(preferences: any) {
    return this.request("/chatbot/preferences", {
      method: "POST",
      body: JSON.stringify(preferences),
    })
  }

  // Admin endpoints (for future admin interface)
  async getDashboard() {
    return this.request("/admin/dashboard")
  }

  async getUserProgress(userId: string) {
    return this.request(`/admin/user-progress/${userId}`)
  }

  async scheduleAppointment(appointmentData: any) {
    return this.request("/admin/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    })
  }

  async activateUser(userId: string) {
    return this.request(`/admin/users/${userId}/activate`, {
      method: "POST",
    })
  }

  async getESignature(userId: string) {
    return this.request(`/admin/users/${userId}/e-signature`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
