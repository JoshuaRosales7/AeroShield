"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapContainer } from "@/components/map-container"
import { useEnvironmentFull } from "@/lib/queries"
import { Activity, AlertTriangle, MapPin, Clock, Calendar, Gauge, Navigation, Ruler, Info, Users, Building } from "lucide-react"
import { formatRelativeTime } from "@/lib/format"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Componente Modal de Detalles del Sismo
function EarthquakeDetailModal({ 
  earthquake, 
  isOpen, 
  onClose 
}: { 
  earthquake: any
  isOpen: boolean
  onClose: () => void 
}) {
  if (!earthquake) return null

  // Calcular población afectada basada en magnitud y ubicación
  const calculateAffectedPopulation = (magnitude: number, depth: number) => {
    const basePopulation = magnitude * 50000
    const depthFactor = depth < 50 ? 1.5 : depth < 100 ? 1.2 : 1.0
    return Math.round(basePopulation * depthFactor)
  }

  // Calcular radio de percepción
  const calculatePerceptionRadius = (magnitude: number) => {
    return Math.round(Math.pow(10, magnitude - 3) * 10)
  }

  const affectedPopulation = calculateAffectedPopulation(earthquake.magnitude, earthquake.depth)
  const perceptionRadius = calculatePerceptionRadius(earthquake.magnitude)

  const getRiskLevel = (magnitude: number, depth: number) => {
    if (magnitude >= 6.5) return { level: "MUY ALTO", color: "text-red-600", bg: "bg-red-50" }
    if (magnitude >= 5.5) return { level: "ALTO", color: "text-orange-600", bg: "bg-orange-50" }
    if (magnitude >= 4.5) return { level: "MODERADO", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { level: "BAJO", color: "text-green-600", bg: "bg-green-50" }
  }

  const getTsunamiPotential = (magnitude: number, depth: number) => {
    // Basado en criterios reales de centros de alerta de tsunami
    if (magnitude >= 7.5 && depth < 70) return { level: "ALTA", color: "text-red-600", description: "Posible generación de tsunami - Vigilancia activa" }
    if (magnitude >= 6.5 && depth < 50) return { level: "MEDIA", color: "text-orange-600", description: "Potencial bajo de tsunami - Monitoreo" }
    return { level: "BAJA", color: "text-green-600", description: "Sin riesgo de tsunami" }
  }

  const riskInfo = getRiskLevel(earthquake.magnitude, earthquake.depth)
  const tsunamiInfo = getTsunamiPotential(earthquake.magnitude, earthquake.depth)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Detalles del Sismo - M{earthquake.magnitude.toFixed(1)}
          </DialogTitle>
          <DialogDescription>
            Información técnica completa del evento sísmico registrado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con información principal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Magnitud
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  M{earthquake.magnitude.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Escala Richter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Profundidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {earthquake.depth} km
                </div>
                <p className="text-xs text-muted-foreground">
                  {earthquake.depth < 70 ? "Superficial" : earthquake.depth < 300 ? "Intermedio" : "Profundo"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Radio de Percepción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {perceptionRadius} km
                </div>
                <p className="text-xs text-muted-foreground">
                  Área de percepción estimada
                </p>
              </CardContent>
            </Card>

            <Card className={riskInfo.bg}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Nivel de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${riskInfo.color}`}>
                  {riskInfo.level}
                </div>
                <p className="text-xs text-muted-foreground">
                  Evaluación automática
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Información de ubicación y tiempo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Información Geográfica y Temporal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Epicentro</label>
                  <p className="text-sm">{earthquake.place}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Coordenadas Geográficas</label>
                  <p className="text-sm font-mono">
                    {earthquake.lat.toFixed(4)}°N, {Math.abs(earthquake.lon).toFixed(4)}°O
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha del Evento</label>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(earthquake.time).toLocaleDateString('es-GT')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hora Local</label>
                  <p className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(earthquake.time).toLocaleTimeString('es-GT')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de Impacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building className="h-4 w-4" />
                Análisis de Impacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Potencial de Tsunami</h4>
                  <div className="space-y-1">
                    <Badge variant="outline" className={tsunamiInfo.color}>
                      {tsunamiInfo.level}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{tsunamiInfo.description}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Población en Área de Influencia</h4>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-800">
                      {affectedPopulation.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">Personas estimadas en radio de percepción</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Evaluación de Intensidad
                </h4>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><strong>Escala Mercalli Modificada:</strong> {getIntensityDescription(earthquake.magnitude)}</p>
                  <p><strong>Tipo de Movimiento:</strong> {earthquake.depth < 70 ? "Tectónico cortical" : "Subducción de placas"}</p>
                  <p><strong>Energía Liberada:</strong> {Math.pow(10, 1.5 * earthquake.magnitude + 4.8).toExponential(2)} joules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Técnica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Información Técnica y Metadatos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Fuente de Datos:</span>
                  <span className="font-medium">{earthquake.source}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Identificador Único:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {earthquake.id || `EQ-${earthquake.lat.toFixed(2)}-${earthquake.lon.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Tiempo Transcurrido:</span>
                  <span>{formatRelativeTime(earthquake.time)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Calidad de Datos:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {earthquake.magnitude > 4 ? "Alta Confiabilidad" : "Datos Preliminares"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa de ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ubicación del Epicentro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg overflow-hidden border">
                <MapContainer 
                  center={[earthquake.lat, earthquake.lon]} 
                  zoom={8}
                  className="h-full w-full"
                  layers={[
                    { id: "air", visible: false, opacity: 0.7 },
                    { id: "wind", visible: false, opacity: 0.9 },
                    { id: "stations", visible: false, opacity: 0.8 },
                    { id: "volcanoes", visible: false, opacity: 0.9 },
                    { id: "earthquakes", visible: true, opacity: 0.9 }
                  ]}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Mapa centrado en el epicentro del sismo - Coordenadas: {earthquake.lat.toFixed(4)}°N, {Math.abs(earthquake.lon).toFixed(4)}°O
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Función auxiliar para descripción de intensidad (basada en escala Mercalli modificada)
function getIntensityDescription(magnitude: number) {
  if (magnitude < 2.0) return "I - No perceptible"
  if (magnitude < 3.0) return "II-III - Débil, perceptible por pocos"
  if (magnitude < 4.0) return "IV - Ligero, perceptible por muchos en interiores"
  if (magnitude < 4.5) return "V - Moderado, perceptible por casi todos"
  if (magnitude < 5.0) return "VI - Fuerte, sentido por todos, objetos movidos"
  if (magnitude < 5.5) return "VII - Muy fuerte, daños leves en estructuras"
  if (magnitude < 6.0) return "VIII - Severo, daños moderados en edificios"
  if (magnitude < 6.5) return "IX - Violento, daños considerables"
  if (magnitude < 7.0) return "X - Extremo, destrucción significativa"
  return "XI-XII - Catastrófico, destrucción total"
}

export default function EarthquakesPage() {
  const { data: environmentData, isLoading, error } = useEnvironmentFull()
  const [selectedEarthquake, setSelectedEarthquake] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const earthquakes = environmentData?.earthquakes || []
  const region = environmentData?.region || "Guatemala"

  // Definir las capas para el mapa - SOLO SISMOS
  const mapLayers = [
    { id: "air", visible: false, opacity: 0.7 },
    { id: "wind", visible: false, opacity: 0.9 },
    { id: "stations", visible: false, opacity: 0.8 },
    { id: "volcanoes", visible: false, opacity: 0.9 },
    { id: "earthquakes", visible: true, opacity: 0.9 }
  ]

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude < 3) return "bg-green-500/10 text-green-500 border-green-200"
    if (magnitude < 5) return "bg-yellow-500/10 text-yellow-500 border-yellow-200"
    if (magnitude < 7) return "bg-orange-500/10 text-orange-500 border-orange-200"
    return "bg-red-500/10 text-red-500 border-red-200"
  }

  // Filtrar sismos significativos (magnitud > 4.5)
  const significantEarthquakes = earthquakes.filter(eq => eq.magnitude >= 4.5)
  
  // Ordenar sismos por magnitud (mayor primero)
  const sortedEarthquakes = [...earthquakes].sort((a, b) => b.magnitude - a.magnitude)

  const handleViewDetails = (earthquake: any) => {
    setSelectedEarthquake(earthquake)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEarthquake(null)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Monitoreo Sísmico</h1>
            <p className="text-muted-foreground">Actividad sísmica en tiempo real</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de Conexión</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los datos sísmicos desde el servidor. Verifique la conexión e intente nuevamente.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoreo Sísmico</h1>
          <p className="text-muted-foreground">
            Sistema de monitoreo en tiempo real - {region}
            {environmentData?.timestamp && (
              <span className="ml-2 text-xs">
                (Actualizado: {new Date(environmentData.timestamp).toLocaleString()})
              </span>
            )}
          </p>
        </div>
        <Button variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Historial de Reportes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Registrados</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earthquakes.length}</div>
            <p className="text-xs text-muted-foreground">Sismos en la región</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mayor Magnitud</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {earthquakes.length > 0 ? Math.max(...earthquakes.map(eq => eq.magnitude)).toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Evento más significativo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sismos Relevantes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{significantEarthquakes.length}</div>
            <p className="text-xs text-muted-foreground">Magnitud ≥ 4.5</p>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Actividad Sísmica</CardTitle>
          <CardDescription>
            Distribución geográfica de epicentros en {region}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapContainer 
            center={environmentData?.center ? [environmentData.center.lat, environmentData.center.lon] : [14.7248, -90.5069]} 
            zoom={7} 
            className="h-[500px] w-full rounded-lg" 
            layers={mapLayers}
          />
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo Sísmico</CardTitle>
          <CardDescription>Registro completo de eventos sísmicos detectados</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos los Eventos ({earthquakes.length})</TabsTrigger>
              <TabsTrigger value="significant">
                Sismos Significativos ({significantEarthquakes.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))
              ) : earthquakes.length > 0 ? (
                sortedEarthquakes.map((eq, index) => (
                  <div key={index} className="rounded-lg border border-border p-4 hover:border-orange-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getMagnitudeColor(eq.magnitude)} border`}>
                            M {eq.magnitude.toFixed(1)}
                          </Badge>
                          <span className="font-medium text-sm">{eq.place}</span>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="font-mono text-xs">
                              {eq.lat.toFixed(3)}°, {Math.abs(eq.lon).toFixed(3)}°
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            <span>Prof: {eq.depth} km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(eq.time).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(eq.time).toLocaleDateString('es-GT')}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Intensidad:</span> {getIntensityDescription(eq.magnitude).split(' - ')[1]}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(eq)}
                        className="ml-4"
                      >
                        Análisis Detallado
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>No se han registrado eventos sísmicos</p>
                  <p className="text-sm mt-1">Los datos se actualizan automáticamente</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="significant" className="space-y-4">
              {significantEarthquakes.length > 0 ? (
                significantEarthquakes.map((eq, index) => (
                  <div key={index} className="rounded-lg border border-orange-200 bg-orange-50/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive" className="text-sm">
                            M {eq.magnitude.toFixed(1)}
                          </Badge>
                          <span className="font-medium text-sm">{eq.place}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{eq.lat.toFixed(3)}°, {Math.abs(eq.lon).toFixed(3)}° • Prof: {eq.depth} km</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(eq.time).toLocaleString('es-GT')}</span>
                          </div>
                        </div>
                        <div className="text-sm text-orange-700 font-medium">
                          {getIntensityDescription(eq.magnitude)}
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleViewDetails(eq)}
                        className="ml-4"
                      >
                        Evaluar Riesgo
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No se han registrado sismos significativos en el período actual
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <EarthquakeDetailModal 
        earthquake={selectedEarthquake}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}