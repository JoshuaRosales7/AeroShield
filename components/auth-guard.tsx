"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // ⏳ Esperar a que Firebase termine de cargar el usuario
    if (loading) return

    // 🔐 Si no hay sesión, enviar al login
    if (!isAuthenticated && pathname !== "/sign-in" && pathname !== "/sign-up") {
      router.push("/sign-in")
      return
    }

    // 🚀 Si hay sesión pero no completó el onboarding, enviarlo al onboarding
    if (isAuthenticated && user && user.hasOnboarded === false && pathname !== "/onboarding") {
      router.push("/onboarding")
      return
    }

    // ✅ Si ya completó onboarding y está en /onboarding, redirigir al dashboard
    if (isAuthenticated && user?.hasOnboarded && pathname === "/onboarding") {
      router.push("/dashboard")
    }
  }, [user, isAuthenticated, loading, pathname, router])

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    )
  }

  return <>{children}</>
}
