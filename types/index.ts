// types/index.ts
export type Theme = "light" | "dark"
export type UserRole = "user" | "analyst" | "admin"


export interface UserPreferences {
  locale: "es" | "en"
  theme: "light" | "dark"
  alerts: {
    enabled: boolean
    channels: string[]
    thresholds: Record<string, number>
  }
  notifications: {
    push: boolean
    email: boolean
    sms: boolean
  }
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  organization?: string | null
  photoURL?: string | null
  hasOnboarded: boolean // 🔹 ¡campo obligatorio!
  preferences: UserPreferences
}
// /types/index.ts
export interface Alert {
  id: string
  title: string
  message: string
  description?: string
  type: "air_quality" | "earthquake" | "volcano" | "system" | "wildfire"
  severity: "info" | "watch" | "warning" | "severe" | "high"
  status: "sent" | "active" | "resolved" | "unread"
  location?: string
  latitude?: number
  longitude?: number
  timestamp: string
  delivered?: boolean
  read?: boolean
  test?: boolean
  recommendations?: string[]
  details?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}
