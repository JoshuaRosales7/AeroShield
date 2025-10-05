"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Wind, Mountain, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  title: string
  severity: string
  message: string
  timestamp?: string
  type?: string
}

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/dashboard/summary")
        const data = await res.json()
        setAlerts(data?.alerts_recent || [])
      } catch (err) {
        console.error("Error cargando alertas:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "air":
        return Wind
      case "volcano":
        return Mountain
      case "earthquake":
        return Activity
      default:
        return AlertTriangle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/10 text-red-500"
      case "medium":
        return "bg-orange-500/10 text-orange-500"
      case "low":
        return "bg-yellow-500/10 text-yellow-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Recientes</CardTitle>
        <CardDescription>Últimas notificaciones del sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[625px] pr-4">
          {loading ? (
            <p className="text-muted-foreground text-sm">Cargando alertas...</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay alertas recientes en Guatemala.</p>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, idx) => {
                const Icon = getAlertIcon(alert.type || "")
                return (
                  <div key={idx} className="flex gap-3 rounded-lg border border-border p-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded",
                        getSeverityColor(alert.severity),
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{alert.title}</p>
                        <Badge variant="outline" className="shrink-0 text-xs capitalize">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.message || "Actualización ambiental"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
