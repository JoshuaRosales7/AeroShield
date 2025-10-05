"use client"

import { useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { PollutantChart } from "@/components/pollutant-chart"
import { MapContainer } from "@/components/map-container"
import { LayerControl, defaultLayers } from "@/components/layer-control"
import { RecentAlerts } from "@/components/recent-alerts"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/lib/store"
import { AuthGuard } from "@/components/AuthGuard"

// Queries
import { useKPIs } from "@/lib/queries"
import { useTimeSeries } from "@/lib/queries"
import { useAlerts } from "@/lib/queries"
import { useEnvironmentFull } from "@/lib/queries" // ✅ NUEVO hook correcto

export default function DashboardPage() {
  const { mapZoom } = useAppStore()
  const [layers, setLayers] = useState(defaultLayers)

  // 🔹 Consultas a la API
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useKPIs()
  const { data: timeSeries, isLoading: timeSeriesLoading, error: timeSeriesError } = useTimeSeries()
  const { data: alerts, isLoading: alertsLoading, error: alertsError } = useAlerts()
  const { data: mapData, isLoading: mapLoading, error: mapError } = useEnvironmentFull() // ✅ CORRECTO

  // 🔹 Indicador global de carga
  const isGlobalLoading = kpisLoading || timeSeriesLoading || alertsLoading || mapLoading

  const handleLayerToggle = (id: string) =>
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    )

  const handleOpacityChange = (id: string, opacity: number) =>
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, opacity } : layer
      )
    )

  // 🌀 Indicador de carga global
  const GlobalLoader = () => (
    <div className="fixed top-0 left-0 w-full z-[9999]">
      <div className="bg-blue-600 text-white text-sm py-2 text-center animate-pulse">
        🔄 Cargando datos en tiempo real desde la API...
      </div>
    </div>
  )

  // 🎯 KPIs
  const renderKpis = () => {
    if (kpisLoading)
      return Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 sm:h-32 rounded-xl" />
      ))

    if (kpisError)
      return (
        <div className="col-span-4 p-4 text-center text-red-600 bg-red-50 rounded-xl">
          Error cargando KPIs: {kpisError.message}
        </div>
      )

    return kpis?.map((kpi, index) => <KpiCard key={index} data={kpi} />)
  }

  // 🎯 MAPA
  // En tu dashboard page, modifica la función renderMap:
const renderMap = () => {
  if (mapLoading)
    return (
      <div className="h-[550px] sm:h-[650px] rounded-xl flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )

  if (mapError)
    return (
      <div className="h-[550px] flex items-center justify-center bg-red-50 rounded-xl">
        <p className="text-red-600">Error cargando el mapa: {mapError.message}</p>
      </div>
    )

  return (
    <div className="relative rounded-xl border border-border shadow-xl overflow-hidden">
      <MapContainer
        center={[
          mapData?.center?.lat || 14.6349,
          mapData?.center?.lon || -90.5069,
        ]}
        zoom={mapZoom || 7}
        layers={layers}
        className="min-h-[550px] sm:min-h-[650px] w-full rounded-xl overflow-hidden"
      />

      
    </div>
  )
}

  // 🎯 GRÁFICO
  const renderChart = () => {
    if (timeSeriesLoading)
      return <Skeleton className="h-[300px] rounded-xl" />

    if (timeSeriesError)
      return (
        <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-xl">
          <p className="text-red-600">
            Error cargando gráfico: {timeSeriesError.message}
          </p>
        </div>
      )

    return (
      <PollutantChart
        data={timeSeries || []}
        description="Datos satelitales NASA TEMPO"
      />
    )
  }

  // 🎯 ALERTAS
  const renderAlerts = () => {
    if (alertsLoading) return <Skeleton className="h-[300px] rounded-xl" />
    if (alertsError)
      return (
        <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-xl">
          <p className="text-red-600">Error cargando alertas</p>
        </div>
      )

    return <RecentAlerts alerts={alerts || []} />
  }

  return (
    <AuthGuard>
      {isGlobalLoading && <GlobalLoader />}

      <div className="space-y-6 px-4 sm:px-6 lg:px-8 pb-8">
        {/* 🏷️ Encabezado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Panel de Control
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitoreo de calidad del aire y alertas ambientales en Guatemala
            </p>
          </div>
        </div>

        {/* 📊 KPIs */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {renderKpis()}
        </div>

        {/* 🗺️ Mapa + gráfico + panel lateral */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {renderMap()}
            {renderChart()}
          </div>

          <div className="space-y-6">
            <LayerControl
              layers={layers}
              onLayerToggle={handleLayerToggle}
              onOpacityChange={handleOpacityChange}
            />
            {renderAlerts()}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
