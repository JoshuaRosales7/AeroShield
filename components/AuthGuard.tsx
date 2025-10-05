"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useAppStore } from "@/lib/store"
import { LoadingSpinner } from "@/components/loading-spinner"

/**
 * Protege rutas privadas y sincroniza el estado de autenticación entre
 * Firebase y el store local (Zustand). Espera a que Firebase restaure
 * la sesión antes de redirigir, evitando redirecciones falsas o parpadeos.
 */

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "analyst" | "user"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter()
  const { user: storeUser, setUser } = useAppStore()
  const { user: authUser, isAuthenticated } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // 🔹 Sincroniza el usuario de Firebase con Zustand (si es necesario)
    if (authUser && !storeUser) {
      setUser(authUser)
    }

    // 🔹 Si no hay usuario autenticado después de un breve delay, redirige
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !authUser && !storeUser) {
        router.push("/sign-in")
      }
      setIsChecking(false)
    }, 600) // delay corto para esperar restauración de sesión

    return () => clearTimeout(timeout)
  }, [authUser, storeUser, isAuthenticated, router, setUser])

  // 🔸 Verifica roles, si aplica
  useEffect(() => {
    if (requiredRole && storeUser && storeUser.role !== requiredRole && storeUser.role !== "admin") {
      router.push("/dashboard")
    }
  }, [requiredRole, storeUser, router])

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner />
          <p className="text-muted-foreground text-sm">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  // 🔹 Renderiza el contenido solo si hay usuario
  if (!storeUser && !authUser) return null

  return <>{children}</>
}
