// Crea un nuevo componente MapLoader.tsx
"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface MapLoaderProps {
  center: [number, number]
  zoom: number
  className?: string
}

export function MapLoader({ center, zoom, className }: MapLoaderProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const loadMap = async () => {
      try {
        const { MapContainer } = await import("./map-container")
        setMapComponent(() => MapContainer)
      } catch (error) {
        console.error("Error loading map:", error)
        setLoadError(true)
      }
    }

    loadMap()
  }, [])

  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/50`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Error cargando el mapa</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!MapComponent) {
    return <Skeleton className={className} />
  }

  return <MapComponent center={center} zoom={zoom} className={className} />
}

// Luego en tu dashboard, reemplaza:
// <MapContainer ... /> con:
// <MapLoader center={...} zoom={...} className="h-[400px] sm:h-[500px] w-full" />