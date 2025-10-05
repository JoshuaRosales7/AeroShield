// hooks/useStableHeatmap.ts
import { useEffect, useRef } from 'react'
import L from 'leaflet'

export function useStableHeatmap(
  map: L.Map | null,
  points: [number, number, number][],
  opacity: number,
  visible: boolean
) {
  const heatLayerRef = useRef<any>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!map) return

    // Si no está visible o no hay puntos, limpiar
    if (!visible || points.length === 0) {
      if (heatLayerRef.current && isInitializedRef.current) {
        try {
          map.removeLayer(heatLayerRef.current)
          heatLayerRef.current = null
          isInitializedRef.current = false
        } catch (err) {
          // Ignorar errores de cleanup
        }
      }
      return
    }

    // Si ya está inicializado, solo actualizar datos
    if (heatLayerRef.current && isInitializedRef.current) {
      try {
        heatLayerRef.current.setLatLngs(points)
        heatLayerRef.current.setOptions({ minOpacity: opacity })
      } catch (err) {
        console.warn("Error actualizando heatmap, recreando...")
        // Si falla, recrear la capa
        if (heatLayerRef.current) {
          try {
            map.removeLayer(heatLayerRef.current)
          } catch (e) {}
          heatLayerRef.current = null
          isInitializedRef.current = false
        }
      }
      return
    }

    // Crear nueva capa de heatmap
    if (!heatLayerRef.current && !isInitializedRef.current) {
      try {
        heatLayerRef.current = (L as any).heatLayer(points, {
          radius: 35,
          blur: 25,
          maxZoom: 10,
          minOpacity: opacity,
          gradient: {
            0.1: '#00ff88',
            0.3: '#aaff00', 
            0.5: '#ffff00',
            0.7: '#ffaa00',
            0.9: '#ff4444'
          }
        })
        
        heatLayerRef.current.addTo(map)
        isInitializedRef.current = true
        
      } catch (err) {
        console.error("Error creando heatmap:", err)
        heatLayerRef.current = null
        isInitializedRef.current = false
      }
    }

  }, [map, points, opacity, visible])

  // Cleanup cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (heatLayerRef.current && map && isInitializedRef.current) {
        try {
          map.removeLayer(heatLayerRef.current)
        } catch (err) {
          // Ignorar errores de cleanup
        }
      }
    }
  }, [map])
}