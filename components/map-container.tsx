"use client"

import { useEffect, useRef, useMemo, useState } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEnvironmentFull } from "@/lib/queries"

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapContainerProps {
  center?: [number, number]
  zoom?: number
  className?: string
  layers: {
    id: string
    visible: boolean
    opacity: number
  }[]
}

// SOLUCIÓN ALTERNATIVA PARA HEATMAP - Usando círculos en lugar de leaflet.heat
function useHeatmapCircles(
  map: L.Map | null,
  points: [number, number, number][],
  opacity: number,
  visible: boolean
) {
  const heatLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!map) return

    if (!visible || points.length === 0) {
      if (heatLayerRef.current) {
        try {
          map.removeLayer(heatLayerRef.current)
          heatLayerRef.current = null
        } catch (err) {
          console.warn("Error removiendo heatmap:", err)
        }
      }
      return
    }

    try {
      // Crear o limpiar layer group
      if (!heatLayerRef.current) {
        heatLayerRef.current = L.layerGroup()
        heatLayerRef.current.addTo(map)
      } else {
        heatLayerRef.current.clearLayers()
      }

      // Crear círculos para simular heatmap
      points.forEach(([lat, lon, intensity]) => {
        const radius = 15 + (intensity * 25) // Radio basado en intensidad
        const color = getHeatmapColor(intensity)
        
        const circle = L.circleMarker([lat, lon], {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: opacity * 0.6,
          weight: 1,
          className: 'heatmap-circle'
        })

        circle.bindPopup(`
          <div class="p-3 min-w-[160px] bg-white rounded-lg shadow-lg">
            <div class="font-bold text-sm mb-2 text-gray-800">🌫️ Calidad del Aire</div>
            <div class="text-xs space-y-1 text-gray-600">
              <div class="flex justify-between">
                <span class="font-medium">Intensidad:</span>
                <span class="font-bold" style="color: ${color}">${(intensity * 100).toFixed(0)}%</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Coordenadas:</span>
                <span>${lat.toFixed(4)}, ${lon.toFixed(4)}</span>
              </div>
            </div>
          </div>
        `)

        heatLayerRef.current!.addLayer(circle)
      })

    } catch (err) {
      console.error("Error creando heatmap con círculos:", err)
    }

    return () => {
      if (heatLayerRef.current && map) {
        try {
          map.removeLayer(heatLayerRef.current)
          heatLayerRef.current = null
        } catch (err) {
          console.warn("Error cleanup heatmap:", err)
        }
      }
    }
  }, [map, points, opacity, visible])
}

// Hook genérico para capas simples
function useMapLayer(
  map: L.Map | null,
  data: any[],
  opacity: number,
  visible: boolean,
  createLayer: (item: any, opacity: number) => L.Layer | null
) {
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!map) return

    if (!visible || !data?.length) {
      if (layerGroupRef.current) {
        try {
          map.removeLayer(layerGroupRef.current)
          layerGroupRef.current = null
        } catch (err) {
          // Ignorar errores
        }
      }
      return
    }

    try {
      // Crear o limpiar layer group
      if (!layerGroupRef.current) {
        layerGroupRef.current = L.layerGroup()
        layerGroupRef.current.addTo(map)
      } else {
        layerGroupRef.current.clearLayers()
      }

      // Añadir layers
      data.forEach(item => {
        const layer = createLayer(item, opacity)
        if (layer && layerGroupRef.current) {
          layerGroupRef.current.addLayer(layer)
        }
      })

    } catch (err) {
      console.error("Error creando capa:", err)
    }

    return () => {
      if (layerGroupRef.current && map) {
        try {
          map.removeLayer(layerGroupRef.current)
          layerGroupRef.current = null
        } catch (err) {
          // Ignorar errores
        }
      }
    }
  }, [map, data, opacity, visible, createLayer])
}

// REPRESENTACIÓN MEJORADA DEL VIENTO CON FLECHAS
const createWindLayer = (w: any, opacity: number): L.LayerGroup | null => {
  if (!w.lat || !w.lon || !w.speed) return null

  const group = L.layerGroup()
  const speed = w.speed || 0
  const direction = w.direction || 0
  
  // Colores basados en velocidad
  const getWindColor = (speed: number): string => {
    if (speed > 20) return '#dc2626'      // Rojo oscuro - Muy fuerte
    if (speed > 15) return '#ea580c'      // Naranja - Fuerte
    if (speed > 10) return '#d97706'      // Amarillo oscuro - Moderado
    if (speed > 5) return '#65a30d'       // Verde - Suave
    return '#0284c7'                      // Azul - Ligero
  }

  const windColor = getWindColor(speed)
  
  // Configuración de la flecha basada en velocidad
  const arrowLength = 20 + (speed * 1.5) // Longitud proporcional
  const arrowWidth = 2 + (speed * 0.2)   // Ancho proporcional
  const arrowheadSize = 8 + (speed * 0.3) // Tamaño de la punta

  const rad = (direction * Math.PI) / 180
  const endLat = w.lat + (arrowLength / 111000) * Math.sin(rad)
  const endLon = w.lon + (arrowLength / 111000) * Math.cos(rad)

  // 1. Línea principal de la flecha
  const shaft = L.polyline(
    [[w.lat, w.lon], [endLat, endLon]],
    {
      color: windColor,
      weight: arrowWidth,
      opacity: opacity,
      lineCap: 'round',
      className: 'wind-shaft'
    }
  )

  // 2. Punta de flecha (triángulo)
  const arrowheadAngle = 35 // Ángulo de las puntas
  
  const arrowhead1Rad = ((direction - arrowheadAngle) * Math.PI) / 180
  const arrowhead2Rad = ((direction + arrowheadAngle) * Math.PI) / 180
  
  const head1Lat = endLat + (arrowheadSize / 111000) * Math.sin(arrowhead1Rad)
  const head1Lon = endLon + (arrowheadSize / 111000) * Math.cos(arrowhead1Rad)
  
  const head2Lat = endLat + (arrowheadSize / 111000) * Math.sin(arrowhead2Rad)
  const head2Lon = endLon + (arrowheadSize / 111000) * Math.cos(arrowhead2Rad)

  const arrowhead = L.polygon(
    [[endLat, endLon], [head1Lat, head1Lon], [head2Lat, head2Lon]],
    {
      color: windColor,
      fillColor: windColor,
      fillOpacity: opacity,
      weight: 1,
      opacity: opacity,
      className: 'wind-arrowhead'
    }
  )

  // 3. Círculo base indicador
  const baseCircle = L.circleMarker([w.lat, w.lon], {
    radius: 3 + (speed * 0.15),
    color: windColor,
    fillColor: windColor,
    fillOpacity: opacity * 0.9,
    weight: 1,
    className: 'wind-base'
  })

  // Popup informativo
  const popupContent = `
    <div class="p-3 min-w-[180px] bg-white rounded-lg shadow-lg border">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-4 h-4 rounded-full" style="background: ${windColor}"></div>
        <h3 class="font-bold text-sm text-gray-800">🌪️ Datos del Viento</h3>
      </div>
      <div class="text-xs space-y-2 text-gray-600">
        <div class="flex justify-between items-center">
          <span class="font-semibold">Velocidad:</span>
          <span class="font-bold text-lg" style="color: ${windColor}">${speed.toFixed(1)} km/h</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Dirección:</span>
          <span><strong>${getWindDirection(direction)}</strong> (${direction}°)</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Intensidad:</span>
          <span class="font-medium capitalize" style="color: ${windColor}">${getWindIntensity(speed)}</span>
        </div>
      </div>
    </div>
  `

  // Añadir todos los elementos al grupo
  shaft.bindPopup(popupContent)
  arrowhead.bindPopup(popupContent)
  baseCircle.bindPopup(popupContent)
  
  group.addLayer(shaft)
  group.addLayer(arrowhead)
  group.addLayer(baseCircle)

  return group
}

const createStationLayer = (s: any, opacity: number): L.CircleMarker | null => {
  if (!s.lat || !s.lon) return null

  const marker = L.circleMarker([s.lat, s.lon], {
    radius: 6,
    color: "#00ff88",
    fillColor: "#00ff88",
    fillOpacity: opacity * 0.9,
    weight: 2,
    className: 'station-marker'
  })

  marker.bindPopup(`
    <div class="p-3 min-w-[150px] bg-white rounded-lg shadow-lg border">
      <div class="font-bold text-sm mb-2 text-gray-800">📡 Estación de Monitoreo</div>
      <div class="text-xs text-gray-600">
        <div class="font-semibold">${s.name || "Estación"}</div>
        <div class="mt-1 text-xs opacity-75">${s.source || "OpenAQ"}</div>
      </div>
    </div>
  `)

  return marker
}

const createVolcanoLayer = (v: any, opacity: number): L.Marker | null => {
  if (!v.lat || !v.lon) return null

  const statusColor = v.status === 'activo' ? '#ef4444' : 
                     v.status === 'moderado' ? '#f59e0b' : '#6b7280'

  const marker = L.marker([v.lat, v.lon], {
    icon: L.divIcon({
      html: `
        <div style="
          background: ${statusColor};
          border: 3px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.4);
          color: white;
          font-weight: bold;
        ">🌋</div>
      `,
      className: 'volcano-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    })
  })

  marker.bindPopup(`
    <div class="p-3 min-w-[180px] bg-white rounded-lg shadow-lg border">
      <div class="font-bold text-sm mb-2 text-gray-800">🌋 ${v.name || "Volcán"}</div>
      <div class="text-xs space-y-1 text-gray-600">
        <div class="flex justify-between">
          <span class="font-medium">Estado:</span>
          <span style="color: ${statusColor}; font-weight: 600">${v.status || "Sin datos"}</span>
        </div>
      </div>
    </div>
  `)

  return marker
}

const createEarthquakeLayer = (e: any, opacity: number): L.CircleMarker | null => {
  if (!e.lat || !e.lon) return null

  const magnitude = e.magnitude || 2
  const radius = Math.min(20, Math.max(8, magnitude * 3))
  
  const marker = L.circleMarker([e.lat, e.lon], {
    radius: radius,
    color: "#ef4444",
    fillColor: "#dc2626",
    fillOpacity: opacity * 0.8,
    weight: 2,
    className: 'earthquake-marker'
  })

  marker.bindPopup(`
    <div class="p-3 min-w-[180px] bg-white rounded-lg shadow-lg border">
      <div class="font-bold text-sm mb-2 text-gray-800">🌊 Información del Sismo</div>
      <div class="text-xs space-y-2 text-gray-600">
        <div class="flex justify-between items-center">
          <span class="font-medium">Magnitud:</span>
          <span class="font-bold text-red-600 text-lg">M${magnitude}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-medium">Profundidad:</span>
          <span>${e.depth || 0} km</span>
        </div>
      </div>
    </div>
  `)

  return marker
}

// Funciones auxiliares
function getHeatmapColor(intensity: number): string {
  if (intensity > 0.8) return '#dc2626' // Rojo - Muy alto
  if (intensity > 0.6) return '#ea580c' // Naranja - Alto
  if (intensity > 0.4) return '#d97706' // Amarillo - Moderado
  if (intensity > 0.2) return '#65a30d' // Verde - Bajo
  return '#16a34a' // Verde claro - Muy bajo
}

function getWindDirection(degrees: number): string {
  if (degrees === undefined || degrees === null) return 'N/A'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round((degrees % 360) / 22.5)
  return directions[index % 16]
}

function getWindIntensity(speed: number): string {
  if (speed > 20) return 'muy fuerte'
  if (speed > 15) return 'fuerte'
  if (speed > 10) return 'moderado'
  if (speed > 5) return 'suave'
  return 'ligero'
}

export function MapContainer({
  center = [14.6349, -90.5069],
  zoom = 8,
  className = "h-[650px] w-full rounded-xl overflow-hidden relative",
  layers,
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapReady, setMapReady] = useState(false)
  
  const { data, isLoading, error } = useEnvironmentFull()

  // Memoizar datos del heatmap
  const heatmapPoints = useMemo(() => {
    if (!data?.air_quality) return []
    return data.air_quality
      .filter((point: any) => point.lat && point.lon)
      .map((point: any) => [
        point.lat,
        point.lon,
        (point.intensity || 0.5) * 2
      ] as [number, number, number])
  }, [data?.air_quality])

  // Encontrar capas activas
  const airLayer = layers.find(layer => layer.id === "air")
  const windLayer = layers.find(layer => layer.id === "wind")
  const stationsLayer = layers.find(layer => layer.id === "stations")
  const volcanoesLayer = layers.find(layer => layer.id === "volcanoes")
  const earthquakesLayer = layers.find(layer => layer.id === "earthquakes")

  // Usar hooks para las capas
  useHeatmapCircles(
    mapRef.current,
    heatmapPoints,
    airLayer?.opacity || 0.7,
    (airLayer?.visible && mapReady) || false
  )

  useMapLayer(
    mapRef.current,
    data?.wind,
    windLayer?.opacity || 0.9,
    (windLayer?.visible && mapReady) || false,
    createWindLayer
  )

  useMapLayer(
    mapRef.current,
    data?.stations,
    stationsLayer?.opacity || 0.8,
    (stationsLayer?.visible && mapReady) || false,
    createStationLayer
  )

  useMapLayer(
    mapRef.current,
    data?.volcanoes,
    volcanoesLayer?.opacity || 0.9,
    (volcanoesLayer?.visible && mapReady) || false,
    createVolcanoLayer
  )

  useMapLayer(
    mapRef.current,
    data?.earthquakes,
    earthquakesLayer?.opacity || 0.9,
    (earthquakesLayer?.visible && mapReady) || false,
    createEarthquakeLayer
  )

  // Inicializar mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let mapInstance: L.Map | null = null

    const initMap = () => {
      try {
        mapInstance = L.map(containerRef.current!, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: false,
          preferCanvas: true,
        })

        // Mapa base claro para mejor contraste
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '',
          maxZoom: 19,
        }).addTo(mapInstance)

        mapRef.current = mapInstance
        setMapReady(true)

      } catch (err) {
        console.error("Error inicializando mapa:", err)
      }
    }

    const timer = setTimeout(initMap, 150)
    return () => {
      clearTimeout(timer)
      if (mapInstance) {
        mapInstance.remove()
        mapRef.current = null
      }
      setMapReady(false)
    }
  }, [center, zoom])

  if (isLoading) {
    return (
      <div className={className + " flex items-center justify-center bg-slate-900"}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-white text-sm">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className + " flex items-center justify-center bg-red-50"}>
        <div className="text-center p-4">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-red-800 font-medium">Error cargando el mapa</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={containerRef} className={className} />
      
      {/* Información del mapa */}
      {mapReady && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-lg rounded-xl px-4 py-3 shadow-xl border">
          <div className="text-sm font-semibold text-gray-800">Mapa Ambiental</div>
          <div className="text-xs text-gray-600 mt-1 flex gap-3">
            <span>🌫️ {data?.air_quality?.length || 0}</span>
            <span>💨 {data?.wind?.length || 0}</span>
            <span>🌋 {data?.volcanoes?.length || 0}</span>
            <span>🌊 {data?.earthquakes?.length || 0}</span>
          </div>
        </div>
      )}

      {/* Leyenda del heatmap */}
      {mapReady && airLayer?.visible && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-lg rounded-xl px-4 py-3 shadow-xl border">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-800 mb-2">🌫️ Calidad del Aire</span>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex gap-1">
                <div className="w-4 h-3 bg-green-600 rounded-sm"></div>
                <div className="w-4 h-3 bg-yellow-500 rounded-sm"></div>
                <div className="w-4 h-3 bg-orange-500 rounded-sm"></div>
                <div className="w-4 h-3 bg-red-600 rounded-sm"></div>
              </div>
              <span className="text-gray-600">Bueno → Crítico</span>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .leaflet-container {
          background: #f8fafc;
          font-family: inherit;
        }
        
        .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          border-radius: 0;
        }

        .leaflet-popup-content {
          margin: 0;
        }

        .leaflet-popup-tip {
          background: white;
        }

        /* Animaciones para mejor visibilidad */
        .heatmap-circle {
          animation: pulse 3s ease-in-out infinite;
        }

        .wind-shaft {
          animation: windFlow 2s ease-in-out infinite;
        }

        .wind-arrowhead {
          animation: windFlow 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.9; }
        }

        @keyframes windFlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}