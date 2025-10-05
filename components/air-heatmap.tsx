"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEnvironmentFull } from "@/lib/queries"

// Fix iconos de Leaflet en Next
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

type Pollutant = "NO2" | "O3" | "PM25" | "HCHO" | "Aerosols"

type Props = {
  pollutant: Pollutant
  center?: [number, number]
  zoom?: number
  className?: string
}

export default function AirHeatmap({
  pollutant,
  center = [14.6349, -90.5069],
  zoom = 7,
  className = "h-[500px] w-full rounded-lg overflow-hidden relative",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const heatRef = useRef<any>(null) // heatLayer del plugin
  const circlesRef = useRef<L.LayerGroup | null>(null) // fallback
  const [heatAvailable, setHeatAvailable] = useState<boolean | null>(null)

  // API
  const { data, isLoading, error } = useEnvironmentFull()
  const air = data?.air_quality || []

  // ---- Escaladores de peso (0..1) por contaminante ----
  const clamp01 = (x: number) => Math.max(0.01, Math.min(1, x))
  const scalePM25 = (v?: number | null) => (v == null ? null : clamp01(Math.pow(v / 80, 0.6)))
  const scaleNO2 = (v?: number | null) => (v == null ? null : clamp01(Math.pow(v / 100, 0.6)))
  const scaleGeneric = (x?: number | null) => (x == null ? 0.4 : clamp01(x))

  // ---- Convertir API -> puntos heat [lat, lon, weight] ----
  const heatPoints = useMemo<[number, number, number][]>(() => {
    if (!Array.isArray(air)) return []

    return air
      .filter((p: any) => typeof p.lat === "number" && typeof p.lon === "number")
      .map((p: any) => {
        let w: number | null = null
        if (pollutant === "PM25") w = scalePM25(p.pm25)
        else if (pollutant === "NO2") w = scaleNO2(p.no2)
        else w = scaleGeneric(p.intensity)

        return [p.lat, p.lon, w ?? 0.3]
      })
  }, [air, pollutant])

  // ---- Inicializar mapa una sola vez ----
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    })

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { attribution: "", maxZoom: 19 }
    ).addTo(map)

    mapRef.current = map

    // Ajuste de radio del heatmap al hacer zoom (si existe)
    const onZoom = () => {
      if (heatRef.current && typeof heatRef.current.setOptions === "function") {
        const z = map.getZoom()
        const radius = z >= 10 ? 18 : z >= 8 ? 24 : 30
        heatRef.current.setOptions({ radius })
      }
    }
    map.on("zoomend", onZoom)

    return () => {
      map.off("zoomend", onZoom)
      map.remove()
      mapRef.current = null
    }
  }, [center, zoom])

  // ---- Cargar plugin leaflet.heat dinámicamente (una vez) ----
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // si ya existe, marcamos disponible
        if ((L as any).heatLayer) {
          if (!cancelled) setHeatAvailable(true)
          return
        }
        await import("leaflet.heat")
        if (!cancelled) setHeatAvailable(true)
      } catch {
        if (!cancelled) setHeatAvailable(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ---- Pintar/actualizar heatmap o fallback ----
  useEffect(() => {
    const map = mapRef.current
    if (!map || isLoading || error) return

    // limpiar capas previas
    try {
      if (heatRef.current) {
        map.removeLayer(heatRef.current)
        heatRef.current = null
      }
    } catch {}
    try {
      if (circlesRef.current) {
        map.removeLayer(circlesRef.current)
        circlesRef.current = null
      }
    } catch {}

    if (!heatPoints.length) return

    // encuadrar mapa a puntos
    try {
      const bounds = L.latLngBounds(heatPoints.map(([lat, lon]) => [lat, lon]))
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.15))
    } catch {}

    // 1) Si hay plugin, usar heatLayer
    if (heatAvailable) {
      try {
        const gradient = {
          0.2: "#00c853",
          0.4: "#ffee58",
          0.6: "#ff8f00",
          0.8: "#ff5252",
          1.0: "#d50000",
        }
        const z = map.getZoom()
        const radius = z >= 10 ? 18 : z >= 8 ? 24 : 30

        const heat = (L as any).heatLayer(heatPoints, {
          radius,
          blur: 22,
          minOpacity: 0.3,
          maxZoom: 12,
          gradient,
        })
        heat.addTo(map)
        heatRef.current = heat
        return
      } catch (e) {
        // si falla, caemos al fallback
        console.warn("leaflet.heat falló, usando fallback con círculos", e)
      }
    }

    // 2) Fallback con círculos coloreados
    const group = L.layerGroup()
    heatPoints.forEach(([lat, lon, w]) => {
      const color =
        w > 0.8 ? "#d50000" : w > 0.6 ? "#ff5252" : w > 0.4 ? "#ff8f00" : w > 0.2 ? "#ffee58" : "#00c853"
      const r = 6 + 20 * w
      const c = L.circleMarker([lat, lon], {
        radius: r,
        color,
        fillColor: color,
        fillOpacity: 0.55,
        weight: 1,
      })
      c.addTo(group)
    })
    group.addTo(map)
    circlesRef.current = group
  }, [heatPoints, heatAvailable, isLoading, error])

  // ---- UI ----
  if (isLoading) {
    return (
      <div className={className + " flex items-center justify-center bg-slate-100"}>
        <div className="text-sm text-slate-600">Cargando mapa…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className={className + " flex items-center justify-center bg-red-50"}>
        <div className="text-sm text-red-700">Error cargando datos del mapa</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={containerRef} className={className} />
      {/* Info box */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border rounded-lg px-3 py-2 shadow">
        <div className="text-xs font-semibold text-slate-800">Mapa de calor · {pollutant}</div>
        <div className="text-[11px] text-slate-600">
          puntos: {air?.length || 0} · modo: {heatAvailable ? "heatLayer" : "círculos"}
        </div>
      </div>
    </div>
  )
}
