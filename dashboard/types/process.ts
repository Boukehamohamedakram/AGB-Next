export interface ProcessStatus {
  id: string
  userId: string
  userName: string
  email: string
  status: "pending" | "in-progress" | "completed" | "rejected"
  processType: "KYC" | "verification" | "activation"
  lastUpdate: string
  currentStep: string
  priority: "high" | "medium" | "low"
}

export interface UserProgress {
  userId: string
  userName: string
  email: string
  steps: ProcessStep[]
}

export interface ProcessStep {
  id: string
  name: string
  status: "completed" | "pending" | "rejected" | "in-progress"
  date?: string
  comment?: string
  documents?: Document[]
}

export interface Document {
  id: string
  name: string
  type: string
  url: string
  status: "pending" | "approved" | "rejected"
  uploadDate: string
}
