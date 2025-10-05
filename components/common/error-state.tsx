"use client"

import { AlertTriangle } from "lucide-react"

export default function ErrorState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="mb-2 h-8 w-8 text-destructive" />
      <h3 className="text-lg font-semibold">Error</h3>
      <p className="text-sm text-muted-foreground">{message || "Ocurrió un error inesperado"}</p>
    </div>
  )
}
