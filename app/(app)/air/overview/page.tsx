"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapContainer } from "@/components/map-container"
import { useEnvironmentFull } from "@/lib/queries"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mapeo de categorías AQI a colores
const AQI_COLORS: Record<string, string> = {
  low: "bg-green-500 text-white",
  moderate: "bg-yellow-500 text-black",
  high: "bg-orange-500 text-white",
  very_high: "bg-red-600 text-white",
  severe: "bg-purple-700 text-white",
}

export default function AirOverviewPage() {
  const [timeRange, setTimeRange] = useState<12 | 24 | 48>(24)
  const { data, isLoading, error } = useEnvironmentFull()

  const airData = data?.air_quality || []
  const firstCity = airData[0] || null

  // Calcular promedio global de intensidad
  const avgIntensity =
    airData.length > 0 ? airData.reduce((sum: number, p: any) => sum + (p.intensity || 0), 0) / airData.length : 0

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calidad del Aire Global</h1>
          <p className="text-muted-foreground">
            Monitoreo ambiental en tiempo real — datos de {data?.region || "el mundo"} 🌍
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTimeRange(12)}>
            12h
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeRange(24)}>
            24h
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeRange(48)}>
            48h
          </Button>
        </div>
      </div>

      {/* Estado actual del aire */}
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar datos</CardTitle>
            <CardDescription>Intenta recargar la página.</CardDescription>
          </CardHeader>
        </Card>
      ) : firstCity ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Condiciones actuales</CardTitle>
                <CardDescription>{firstCity.city || "Desconocido"}</CardDescription>
              </div>
              <Badge
                className={cn(
                  "text-lg",
                  avgIntensity > 0.8
                    ? AQI_COLORS.very_high
                    : avgIntensity > 0.6
                    ? AQI_COLORS.high
                    : avgIntensity > 0.4
                    ? AQI_COLORS.moderate
                    : AQI_COLORS.low
                )}
              >
                {(avgIntensity * 100).toFixed(0)} / 100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Estado global:</span>
              <Badge variant="outline">
                {avgIntensity > 0.8
                  ? "Muy Insalubre"
                  : avgIntensity > 0.6
                  ? "Insalubre"
                  : avgIntensity > 0.4
                  ? "Moderada"
                  : "Buena"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Mapa de calor */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calidad del Aire</CardTitle>
          <CardDescription>Distribución global de contaminantes (fuente: OpenAQ)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          ) : (
            <MapContainer
  center={[14.6349, -90.5069]}
  zoom={8}
  className="h-[400px] w-full rounded-lg"
  layers={[
    { id: "air", visible: true, opacity: 0.9 },
    { id: "wind", visible: true, opacity: 0.8 },
    { id: "stations", visible: true, opacity: 0.8 },
    { id: "volcanoes", visible: true, opacity: 0.9 },
    { id: "earthquakes", visible: true, opacity: 0.9 },
  ]}
/>

          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid gap-4 md:grid-cols-2">
        {data?.earthquakes?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Sismos recientes</CardTitle>
              <CardDescription>Fuente: USGS</CardDescription>
            </CardHeader>
            <CardContent>
              {data.earthquakes.slice(0, 3).map((eq: any, idx: number) => (
                <div key={idx} className="text-sm mb-2">
                  🌋 {eq.place} — Magnitud {eq.magnitude}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {data?.volcanoes?.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Volcanes activos</CardTitle>
              <CardDescription>Fuente: NASA EONET</CardDescription>
            </CardHeader>
            <CardContent>
              {data.volcanoes.slice(0, 3).map((v: any, idx: number) => (
                <div key={idx} className="text-sm mb-2">
                  🌋 {v.name} — Estado: {v.status}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
