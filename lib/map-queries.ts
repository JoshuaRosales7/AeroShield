"use client"

import { useQuery } from "@tanstack/react-query"

const API_BASE = "http://127.0.0.1:8000"

export const useMapLayers = () =>
  useQuery({
    queryKey: ["mapLayers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/dashboard/summary`)
      if (!res.ok) throw new Error("Error loading map data")
      const data = await res.json()
      
      return {
        center: data.center || { lat: 15.7835, lon: -90.2308 },
        bbox: data.center?.bbox || [-92.3, 13.5, -88.0, 17.8],
        layers: data.map?.layers || {},
        heatmapData: data.map?.heatmap_data || { points: [] }
      }
    },
  })