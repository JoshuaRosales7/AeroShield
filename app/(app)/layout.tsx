import type React from "react"
import { AppShell } from "@/components/app-shell"
import { AuthGuard } from "@/components/auth-guard"

export const dynamic = "force-dynamic"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
