export interface PendingAccount {
  id: string
  userId: string
  userName: string
  email: string
  phone: string
  submissionDate: string
  status: "pending" | "under-review" | "approved" | "rejected"
  documents: AccountDocument[]
  eSignature?: ESignature
}

export interface AccountDocument {
  id: string
  type: "identity" | "proof-address" | "bank-statement" | "other"
  name: string
  url: string
  status: "pending" | "approved" | "rejected"
  uploadDate: string
  comment?: string
}

export interface ESignature {
  id: string
  signatureUrl: string
  signedDate: string
  ipAddress: string
  verified: boolean
}
