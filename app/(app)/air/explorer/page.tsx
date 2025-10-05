"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEnvironmentFull, useTimeSeries } from "@/lib/queries"
import { Download, Filter } from "lucide-react"
import { PollutantChart } from "@/components/pollutant-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import dynamic from "next/dynamic"
import type { Pollutant } from "@/types"

// ✅ Import dinámico de React-Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import("react-leaflet").then(mod => mod.CircleMarker), { ssr: false })
const Tooltip = dynamic(() => import("react-leaflet").then(mod => mod.Tooltip), { ssr: false })

export default function AirExplorerPage() {
  const [selectedPollutant, setSelectedPollutant] = useState<Pollutant>("NO2")
  const [timeRange, setTimeRange] = useState<24 | 48 | 72>(24)

  // 🔹 Llamadas a la API
  const { data: environmentData, isLoading, error } = useEnvironmentFull()
  const { data: timeSeries } = useTimeSeries([selectedPollutant], timeRange)

  const stations = environmentData?.stations || []
  const airQuality = environmentData?.air_quality || []

  // 🎨 Colores de intensidad
  const getColor = (intensity: number) => {
    if (intensity > 0.8) return "#dc2626" // rojo
    if (intensity > 0.6) return "#f97316" // naranja
    if (intensity > 0.4) return "#facc15" // amarillo
    if (intensity > 0.2) return "#4ade80" // verde
    return "#22c55e" // verde claro
  }

  // 🔥 Generar puntos para mapa de calor
  const heatPoints = useMemo(() => {
    return airQuality.map((p: any) => ({
      lat: p.lat,
      lon: p.lon,
      city: p.city,
      intensity: p.intensity,
      color: getColor(p.intensity)
    }))
  }, [airQuality, selectedPollutant])

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error al cargar los datos del mapa</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explorador Avanzado</h1>
          <p className="text-muted-foreground">Análisis detallado de la calidad del aire por contaminante</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Contaminante</label>
            <Select value={selectedPollutant} onValueChange={(v) => setSelectedPollutant(v as Pollutant)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un contaminante" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO2">NO₂ - Dióxido de Nitrógeno</SelectItem>
                <SelectItem value="O3">O₃ - Ozono</SelectItem>
                <SelectItem value="PM25">PM2.5 - Partículas Finas</SelectItem>
                <SelectItem value="HCHO">HCHO - Formaldehído</SelectItem>
                <SelectItem value="Aerosols">Aerosoles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Rango Temporal</label>
            <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v) as 24 | 48 | 72)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">Últimas 24 horas</SelectItem>
                <SelectItem value="48">Últimas 48 horas</SelectItem>
                <SelectItem value="72">Últimas 72 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 🗺️ Mapa */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor</CardTitle>
          <CardDescription>
            Distribución espacial del contaminante seleccionado ({selectedPollutant})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              Cargando mapa...
            </div>
          ) : (
            <div className="h-[500px] w-full rounded-lg overflow-hidden relative">
              <MapContainer
                center={[14.6349, -90.5069]}
                zoom={7}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution=""
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {heatPoints.map((p, i) => (
                  <CircleMarker
                    key={i}
                    center={[p.lat, p.lon]}
                    radius={12 + p.intensity * 20}
                    pathOptions={{
                      color: p.color,
                      fillColor: p.color,
                      fillOpacity: 0.6
                    }}
                  >
                    <Tooltip direction="top">
                      <div className="text-xs">
                        <b>Ciudad:</b> {p.city || "Desconocida"}<br />
                        <b>Intensidad:</b> {(p.intensity * 100).toFixed(0)}%<br />
                        <b>Contaminante:</b> {selectedPollutant}
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📊 Gráfica temporal */}
      {timeSeries && (
        <PollutantChart
          data={timeSeries}
          title={`Serie Temporal - ${selectedPollutant}`}
          description={`Evolución de ${selectedPollutant} durante las últimas ${timeRange} horas`}
        />
      )}

      {/* 🧭 Tabla de estaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Estaciones de Monitoreo</CardTitle>
          <CardDescription>Información general</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Fuente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.length > 0 ? (
                stations.map((s: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{s.name || "Desconocida"}</TableCell>
                    <TableCell>
                      {s.lat?.toFixed(4)}, {s.lon?.toFixed(4)}
                    </TableCell>
                    <TableCell>{s.source || "N/A"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No hay estaciones disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
