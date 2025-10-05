"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapContainer } from "@/components/map-container"
import { Mountain, AlertTriangle, Wind, Droplets } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { VolcanoStatus } from "@/types"

const API_BASE = "http://127.0.0.1:8000"

// ===============================
// 🔹 Hook para obtener volcanes
// ===============================
function useVolcanoes() {
  return useQuery({
    queryKey: ["volcanoes"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/environment/full`)
      if (!res.ok) throw new Error("Error al obtener datos de volcanes")

      const data = await res.json()
      return (data.volcanoes || []).map((v: any, index: number) => ({
        id: index,
        name: v.name || "Volcán Desconocido",
        lat: v.lat,
        lon: v.lon,
        status:
          v.status === "activo"
            ? "warning"
            : v.status === "moderado"
            ? "watch"
            : "normal",
        elevation: v.elevation || "N/D",
        lastEruption: v.last_eruption || "Desconocida",
        gases: v.gases || null,
        ashPlume: v.ash_plume || null,
      }))
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })
}

// ===============================
// 🌋 Página principal
// ===============================
export default function VolcanoesPage() {
  const { data: volcanoes, isLoading } = useVolcanoes()
  const [selectedVolcano, setSelectedVolcano] = useState<any>(null)
  const [aiReport, setAiReport] = useState<string>("")
  const [loadingReport, setLoadingReport] = useState(false)

  const getStatusColor = (status: VolcanoStatus) => {
    switch (status) {
      case "normal":
        return "bg-green-500/10 text-green-500"
      case "advisory":
        return "bg-blue-500/10 text-blue-500"
      case "watch":
        return "bg-yellow-500/10 text-yellow-500"
      case "warning":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusDescription = (status: VolcanoStatus) => {
    switch (status) {
      case "normal":
        return "Actividad normal de fondo"
      case "advisory":
        return "Actividad elevada por encima de lo normal"
      case "watch":
        return "Erupción posible en semanas"
      case "warning":
        return "Erupción inminente o en curso"
      default:
        return "Estado desconocido"
    }
  }

  // 🔍 Obtener reporte de IA (opcional)
  const fetchAIReport = async (volcano: any) => {
    setLoadingReport(true)
    setAiReport("")

    try {
      const res = await fetch("/api/openai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            type: "volcano_analysis",
            name: volcano.name,
            status: volcano.status,
            elevation: volcano.elevation,
            gases: volcano.gases,
            lastEruption: volcano.lastEruption,
          },
        }),
      })

      const json = await res.json()
      setAiReport(json.report || "No se pudo generar un análisis automático.")
    } catch (err) {
      setAiReport("Error al generar el reporte de IA.")
    } finally {
      setLoadingReport(false)
    }
  }

  return (
    <div className="space-y-6 relative z-0">
      {/* 🔺 MODAL MOVIDO ARRIBA DE TODO */}
      <Dialog open={!!selectedVolcano} onOpenChange={() => setSelectedVolcano(null)}>
        <DialogContent className="max-w-2xl z-[9999]">
          <DialogHeader>
            <DialogTitle>{selectedVolcano?.name}</DialogTitle>
            <DialogDescription>
              Estado actual: <strong>{selectedVolcano?.status}</strong> — {getStatusDescription(selectedVolcano?.status)}
            </DialogDescription>
          </DialogHeader>

          {selectedVolcano && (
            <div className="space-y-3 text-sm">
              <p><strong>Elevación:</strong> {selectedVolcano.elevation} m</p>
              <p><strong>Última erupción:</strong> {selectedVolcano.lastEruption}</p>
              {selectedVolcano.gases && (
                <p><strong>SO₂:</strong> {selectedVolcano.gases.SO2 || "Sin datos"} t/día</p>
              )}

              <hr />

              <h4 className="font-medium text-lg">Análisis generado por IA</h4>
              {loadingReport ? (
                <p className="text-muted-foreground animate-pulse">Generando análisis...</p>
              ) : (
                <p className="text-muted-foreground whitespace-pre-line">{aiReport}</p>
              )}

              <div className="pt-4 text-right">
                <Button variant="secondary" onClick={() => setSelectedVolcano(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 🏔️ Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoreo Volcánico</h1>
          <p className="text-muted-foreground">Estado de volcanes activos y análisis de emisiones</p>
        </div>
        <Button variant="outline">
          <Mountain className="mr-2 h-4 w-4" />
          Configurar Alertas
        </Button>
      </div>

      {/* ⚠️ Nota */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Nota sobre Datos</AlertTitle>
        <AlertDescription>
          Los datos de SO₂ provienen de fuentes externas. TEMPO no mide CO₂ ni SO₂ de forma nativa; TEMPO complementa
          con aerosoles y HCHO para análisis de calidad del aire relacionado con actividad volcánica.
        </AlertDescription>
      </Alert>

      {/* 🗺️ Mapa */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Volcanes Activos</CardTitle>
          <CardDescription>Ubicación y estado de volcanes monitoreados</CardDescription>
        </CardHeader>
        <CardContent className="relative z-0">
          <MapContainer
            center={[14.7248, -90.9989]}
            zoom={8}
            className="h-[500px] w-full rounded-lg z-0"
            layers={[{ id: "volcanoes", visible: true, opacity: 0.9 }]}
            volcanoes={volcanoes || []}
          />
        </CardContent>
      </Card>

      {/* 🧾 Detalles de cada volcán */}
      <div className="grid gap-6 lg:grid-cols-2 max-h-[90vh]">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-96" />)
          : volcanoes?.map((volcano) => (
              <Card key={volcano.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{volcano.name}</CardTitle>
                      <CardDescription>Elevación: {volcano.elevation} m</CardDescription>
                    </div>
                    <Badge className={getStatusColor(volcano.status)}>{volcano.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <p className="text-sm text-muted-foreground">{getStatusDescription(volcano.status)}</p>
                  </div>
                  {volcano.lastEruption && (
                    <div>
                      <p className="text-sm font-medium">Última Erupción</p>
                      <p className="text-sm text-muted-foreground">{volcano.lastEruption}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        setSelectedVolcano(volcano)
                        fetchAIReport(volcano)
                      }}
                    >
                      Ver Análisis Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
