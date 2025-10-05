import type { UserProfile } from "@/types"

// Usuarios de demostración
export const DEMO_USERS = [
  {
    id: "1",
    email: "admin@aeroshield.com",
    password: "admin123",
    name: "Admin Usuario",
    role: "admin" as const,
    avatar: "/placeholder-user.jpg",
    organization: "AeroShield",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "usuario@aeroshield.com",
    password: "usuario123",
    name: "Usuario Demo",
    role: "user" as const,
    avatar: "/placeholder-user.jpg",
    organization: "AeroShield",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    email: "analista@aeroshield.com",
    password: "analista123",
    name: "Analista Ambiental",
    role: "analyst" as const,
    avatar: "/placeholder-user.jpg",
    organization: "Secretaría de Medio Ambiente",
    createdAt: new Date("2024-02-01"),
  },
]

export interface AuthResponse {
  success: boolean
  user?: UserProfile
  error?: string
}

// Simular delay de red
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  await delay(800)

  const user = DEMO_USERS.find((u) => u.email === email && u.password === password)

  if (!user) {
    return {
      success: false,
      error: "Correo o contraseña incorrectos",
    }
  }

  // Crear perfil de usuario sin la contraseña
  const { password: _, ...userProfile } = user

  // Guardar en localStorage para persistencia
  localStorage.setItem("auth_user", JSON.stringify(userProfile))
  localStorage.setItem("auth_token", `token_${user.id}_${Date.now()}`)

  return {
    success: true,
    user: userProfile as UserProfile,
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  organization?: string,
): Promise<AuthResponse> {
  await delay(1000)

  // Verificar si el usuario ya existe
  const existingUser = DEMO_USERS.find((u) => u.email === email)
  if (existingUser) {
    return {
      success: false,
      error: "Este correo ya está registrado",
    }
  }

  // Crear nuevo usuario
  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    email,
    name,
    role: "user",
    avatar: "/placeholder-user.jpg",
    organization: organization || "Usuario Individual",
    createdAt: new Date(),
  }

  // Guardar en localStorage
  localStorage.setItem("auth_user", JSON.stringify(newUser))
  localStorage.setItem("auth_token", `token_${newUser.id}_${Date.now()}`)

  return {
    success: true,
    user: newUser,
  }
}

export async function signOut(): Promise<void> {
  await delay(300)
  localStorage.removeItem("auth_user")
  localStorage.removeItem("auth_token")
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null

  try {
    const userStr = localStorage.getItem("auth_user")
    if (!userStr) return null
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("auth_token")
}
