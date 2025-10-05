export interface UserProfile {
  id: string
  name: string
  email: string
  role: "admin" | "analyst" | "user"
  preferences: Record<string, any>
  createdAt: string
  organization?: string | null
}
