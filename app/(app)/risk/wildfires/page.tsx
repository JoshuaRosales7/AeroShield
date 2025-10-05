"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapContainer } from "@/components/map-container"
import { useWildfires } from "@/lib/queries"
import { Flame, Wind, AlertTriangle } from "lucide-react"
import { formatRelativeTime } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

export default function WildfiresPage() {
  const { data: wildfires, isLoading } = useWildfires()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "controlled":
        return "bg-green-500/10 text-green-500"
      case "contained":
        return "bg-yellow-500/10 text-yellow-500"
      case "active":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incendios Forestales</h1>
          <p className="text-muted-foreground">Monitoreo de incendios e impacto en calidad del aire</p>
        </div>
        <Button variant="outline">
          <Flame className="mr-2 h-4 w-4" />
          Configurar Alertas
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incendios Activos</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {wildfires?.filter((f) => f.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Afectada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wildfires?.reduce((sum, f) => sum + f.area, 0).toFixed(0) || 0}
              <span className="ml-1 text-sm font-normal text-muted-foreground">ha</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contención Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wildfires && wildfires.length > 0
                ? Math.round(wildfires.reduce((sum, f) => sum + f.containment, 0) / wildfires.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impacto AQI</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{wildfires?.[0]?.smokeImpact?.aqiImpact || "N/A"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Incendios</CardTitle>
          <CardDescription>Ubicación de focos activos y dispersión de humo</CardDescription>
        </CardHeader>
        <CardContent>
          <MapContainer center={[19.6, -99.2]} zoom={8} className="h-[500px] w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Wildfire Details */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64" />)
          : wildfires?.map((fire) => (
              <Card key={fire.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{fire.name}</CardTitle>
                      <CardDescription>Iniciado {formatRelativeTime(fire.startDate)}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(fire.status)}>{fire.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Área Afectada</p>
                        <p className="text-2xl font-bold">{fire.area} hectáreas</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Contención</span>
                          <span>{fire.containment}%</span>
                        </div>
                        <Progress value={fire.containment} className="h-2" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ubicación</p>
                        <p className="text-sm text-muted-foreground">
                          {fire.location.lat.toFixed(4)}, {fire.location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {fire.smokeImpact && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Impacto de Humo</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Radio de Impacto:</span>
                            <span className="font-medium">{fire.smokeImpact.radius}km</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Impacto en AQI:</span>
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                              +{fire.smokeImpact.aqiImpact}
                            </Badge>
                          </div>
                        </div>
                        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-500" />
                            <div className="text-sm">
                              <p className="font-medium text-orange-500">Alerta de Calidad del Aire</p>
                              <p className="text-muted-foreground">
                                El humo del incendio está afectando la calidad del aire en un radio de{" "}
                                {fire.smokeImpact.radius}km
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Health Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones de Salud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 font-medium">Para Población General</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Mantén ventanas y puertas cerradas</li>
              <li>Usa purificadores de aire si están disponibles</li>
              <li>Limita actividades al aire libre</li>
              <li>Monitorea el AQI local regularmente</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 font-medium">Para Grupos Sensibles</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Permanece en interiores tanto como sea posible</li>
              <li>Usa mascarilla N95 si debes salir</li>
              <li>Ten medicamentos de emergencia a mano</li>
              <li>Consulta a tu médico si experimentas síntomas</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 font-medium">Para Deportistas</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Suspende entrenamientos al aire libre</li>
              <li>Considera actividades en interiores</li>
              <li>Espera a que mejore la calidad del aire</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
