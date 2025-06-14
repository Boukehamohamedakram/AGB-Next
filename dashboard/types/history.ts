export interface HistoryEntry {
  id: string
  date: string
  type: "admin" | "user" | "chatbot" | "system"
  action: string
  details: string
  userId?: string
  userName?: string
  adminId?: string
  adminName?: string
  metadata?: Record<string, any>
}

export interface HistoryFilters {
  type: string
  dateFrom: string
  dateTo: string
  search: string
}
