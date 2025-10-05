"use client"

import type React from "react"
import { useState } from "react"
import { Bell, Plus, Search, AlertTriangle, Info, AlertCircle, XCircle, MapPin, Clock, FileText, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import LoadingSpinner from "@/components/common/loading-spinner"
import ErrorState from "@/components/common/error-state"
import EmptyState from "@/components/common/empty-state"
import { useAlerts } from "@/lib/hooks/useAlerts"
import type { Alert } from "@/types"

export default function AlertsPageContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const { alerts, loading: isLoading, error } = useAlerts()

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "severe":
      case "high":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "watch":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "severe":
      case "high":
        return "destructive"
      case "warning":
        return "default"
      case "watch":
        return "secondary"
      default:
        return "outline"
    }
  }

  const filteredAlerts = alerts?.filter((alert) => {
    const title = alert.title ?? ""
    const message = alert.message ?? ""
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const groupedAlerts = {
    all: filteredAlerts || [],
    air: filteredAlerts?.filter((a) => a.type === "air_quality") || [],
    seismic: filteredAlerts?.filter((a) => a.type === "earthquake") || [],
    volcanic: filteredAlerts?.filter((a) => a.type === "volcano") || [],
    system: filteredAlerts?.filter((a) => a.type === "system") || [],
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="No se pudieron cargar las alertas desde Firestore" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground">Gestión y monitoreo de alertas en tiempo real (Firestore)</p>
        </div>
        <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Regla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Regla de Alerta</DialogTitle>
              <DialogDescription>Define condiciones para recibir notificaciones automáticas</DialogDescription>
            </DialogHeader>
            <AlertRuleForm onClose={() => setIsRuleDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="watch">Vigilancia</SelectItem>
                <SelectItem value="warning">Advertencia</SelectItem>
                <SelectItem value="severe">Severa</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({groupedAlerts.all.length})</TabsTrigger>
          <TabsTrigger value="air">Aire ({groupedAlerts.air.length})</TabsTrigger>
          <TabsTrigger value="seismic">Sismos ({groupedAlerts.seismic.length})</TabsTrigger>
          <TabsTrigger value="volcanic">Volcanes ({groupedAlerts.volcanic.length})</TabsTrigger>
          <TabsTrigger value="system">Sistema ({groupedAlerts.system.length})</TabsTrigger>
        </TabsList>

        {Object.entries(groupedAlerts).map(([key, alertsList]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {alertsList.length === 0 ? (
              <EmptyState icon={Bell} title="Sin alertas" description="No se encontraron alertas en esta categoría" />
            ) : (
              <div className="space-y-3">
                {alertsList.map((alert) => (
                  <Card
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`cursor-pointer transition hover:border-primary ${
                      alert.status === "unread" ? "border-primary" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            alert.severity === "severe" || alert.severity === "high"
                              ? "bg-destructive/10 text-destructive"
                              : alert.severity === "warning"
                                ? "bg-amber-500/10 text-amber-500"
                                : alert.severity === "watch"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold">{alert.title}</h3>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                            </div>
                            <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{alert.location || "Ubicación desconocida"}</span>
                            <span>•</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 🔍 Dialog Detalle de Alerta */}
      {selectedAlert && (
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAlert.title}</DialogTitle>
              <DialogDescription>{selectedAlert.message}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm text-muted-foreground">
              {selectedAlert.description && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1" />
                  <p>{selectedAlert.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(selectedAlert.timestamp).toLocaleString()}</span>
              </div>

              {selectedAlert.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {selectedAlert.location} ({selectedAlert.latitude}, {selectedAlert.longitude})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Tipo: {selectedAlert.type}</span>
              </div>

              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Severidad: {selectedAlert.severity}</span>
              </div>

              {selectedAlert.recommendations?.length ? (
                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold text-foreground">Recomendaciones:</h4>
                  <ul className="list-disc list-inside">
                    {selectedAlert.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="italic">Sin recomendaciones específicas.</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

/* 🧩 Formulario de reglas */
function AlertRuleForm({ onClose }: { onClose: () => void }) {
  const [ruleName, setRuleName] = useState("")
  const [source, setSource] = useState("air_quality")
  const [pollutant, setPollutant] = useState("no2")
  const [threshold, setThreshold] = useState([50])
  const [channels, setChannels] = useState({
    push: true,
    email: false,
    sms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[Firestore] Creando regla:", { ruleName, source, pollutant, threshold, channels })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="ruleName">Nombre de la regla</Label>
        <Input
          id="ruleName"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
          placeholder="Ejemplo: Alerta de NO₂ alto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Fuente</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger id="source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="air_quality">Calidad del aire</SelectItem>
            <SelectItem value="earthquake">Sismo</SelectItem>
            <SelectItem value="volcano">Volcán</SelectItem>
            <SelectItem value="wildfire">Incendio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {source === "air_quality" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="pollutant">Contaminante</Label>
            <Select value={pollutant} onValueChange={setPollutant}>
              <SelectTrigger id="pollutant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no2">NO₂</SelectItem>
                <SelectItem value="o3">O₃</SelectItem>
                <SelectItem value="pm25">PM2.5</SelectItem>
                <SelectItem value="hcho">HCHO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Umbral: {threshold[0]} µg/m³</Label>
            <Slider id="threshold" value={threshold} onValueChange={setThreshold} min={0} max={200} step={5} />
          </div>
        </>
      )}

      <div className="space-y-4">
        <Label>Canales de notificación</Label>
        <div className="space-y-3">
          {Object.entries(channels).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="font-normal capitalize">
                Notificaciones {key}
              </Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => setChannels({ ...channels, [key]: checked })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Crear</Button>
      </div>
    </form>
  )
}
