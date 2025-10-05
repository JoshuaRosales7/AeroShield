"use client"

import { useQuery } from "@tanstack/react-query"
import { Database, Plus, RefreshCw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dataSourcesQuery } from "@/lib/queries"
import LoadingSpinner from "@/components/common/loading-spinner"
import ErrorState from "@/components/common/error-state"
import EmptyState from "@/components/common/empty-state"

export default function DataSourcesPageContent() {
  const { data: dataSources, isLoading, error } = useQuery(dataSourcesQuery())

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="No se pudieron cargar las fuentes de datos" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuentes de Datos</h1>
          <p className="text-muted-foreground">Administra y sincroniza las fuentes de datos disponibles</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar fuente
        </Button>
      </div>

      {/* Data Sources Grid */}
      {!dataSources || dataSources.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No hay fuentes de datos"
          description="Aún no se han configurado fuentes de datos"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dataSources.map((source) => (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{source.name ?? "Fuente sin nombre"}</CardTitle>
                    <CardDescription>{source.type ?? "Desconocido"}</CardDescription>
                  </div>
                  <Badge variant={source.status === "active" ? "default" : "secondary"}>
                    {source.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última sincronización</span>
                    <span>
                      {source.lastSync ? new Date(source.lastSync).toLocaleString() : "Nunca"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Puntos de datos</span>
                    <span>{source.dataPoints?.toLocaleString?.() ?? 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Sincronizar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Settings className="mr-2 h-3 w-3" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
