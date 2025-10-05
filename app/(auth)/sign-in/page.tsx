"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function SignInPage() {
  const router = useRouter()
  const { login, resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const response = await login(email, password)

    if (response.success) {
      router.push("/dashboard")
    } else {
      setError(response.error || "Error al iniciar sesión")
    }

    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Ingresa tu correo para recuperar la contraseña")
      return
    }
    const response = await resetPassword(email)
    if (response.success) {
      setResetMessage("Correo de recuperación enviado. Revisa tu bandeja de entrada.")
    } else {
      setError(response.error || "Error al enviar el correo de recuperación.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <span className="font-mono text-lg font-bold text-primary-foreground">AS</span>
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">Ingresa a tu cuenta de AeroShield</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {resetMessage && (
                <Alert>
                  <AlertDescription>{resetMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/sign-up" className="text-primary hover:underline">
                  Crear cuenta
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
