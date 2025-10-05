"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  onReport?: () => void
}

export function ErrorState({ title = "Error", message, onRetry, onReport }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{message}</p>
        <div className="mt-4 flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          )}
          {onReport && (
            <Button variant="outline" size="sm" onClick={onReport}>
              Reportar problema
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
