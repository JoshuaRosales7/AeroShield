"use client"

import { useQuery } from "@tanstack/react-query"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

// 🌐 URL base de la API en Cloud Run
const API_BASE = "https://nasa-gt-api-248654985571.us-central1.run.app"

// ======================
// 🧠 Función genérica para llamadas a la API
// ======================
const fetcher = async (endpoint: string) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return await res.json()
  } catch (error) {
    console.error(`❌ Error al obtener ${endpoint}:`, error)
    throw error
  }
}

// ======================
// 🔹 KPIs DEL DASHBOARD
// ======================
export const useKPIs = () =>
  useQuery({
    queryKey: ["kpis"],
    queryFn: async () => {
      const data = await fetcher("/dashboard/summary")
      return data.kpis || []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  })

// ======================
// 🔹 SERIES TEMPORALES
// ======================
export const useTimeSeries = (pollutants: string[] = ["NO2", "O3", "PM25", "HCHO"]) =>
  useQuery({
    queryKey: ["timeSeries", pollutants],
    queryFn: async () => {
      const data = await fetcher("/dashboard/summary")
      if (!data.timeseries_24h) return []
      return Object.entries(data.timeseries_24h).map(([pollutant, values]) => ({
        pollutant,
        data: (values as any[]).map((p) => ({
          timestamp: p.timestamp,
          value: p.value,
        })),
      }))
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 90 * 1000,
  })

// ======================
// 🔹 ALERTAS
// ======================
export const useAlerts = () =>
  useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const data = await fetcher("/dashboard/summary")
      return data.alerts_recent || []
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  })

// ======================
// 🔹 MAPA
// ======================
export const useMapLayers = () =>
  useQuery({
    queryKey: ["mapLayers"],
    queryFn: async () => {
      const data = await fetcher("/dashboard/summary")
      if (!data.timeseries_24h) return []
      const entries = Object.entries(data.timeseries_24h || {})
      if (!entries.length) return []
      return entries.map(([pollutant, values]) => ({
        pollutant,
        data: Array.isArray(values)
          ? values.map((p) => ({ timestamp: p.timestamp, value: p.value }))
          : [],
      }))
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })

// ======================
// 🔹 CONTAMINACIÓN POR CIUDAD
// ======================
export const useCitiesPollution = () =>
  useQuery({
    queryKey: ["citiesPollution"],
    queryFn: async () => {
      const data = await fetcher("/cities/pollution")
      return data.cities || []
    },
    staleTime: 10 * 60 * 1000,
  })

// ======================
// 🔹 DETALLE DE CONTAMINANTE
// ======================
export const usePollutantDetail = (pollutant: string) =>
  useQuery({
    queryKey: ["pollutantDetail", pollutant],
    queryFn: async () => {
      const data = await fetcher(`/pollutants/${pollutant}`)
      return data
    },
    enabled: !!pollutant,
    staleTime: 5 * 60 * 1000,
  })

// ======================
// 🔹 DATOS AMBIENTALES COMPLETOS
// ======================
export const useEnvironmentFull = () =>
  useQuery({
    queryKey: ["environmentFull"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/environment/full`)
      if (!res.ok) throw new Error("Error al cargar datos ambientales")
      const data = await res.json()
      console.log("📊 Datos del mapa recibidos:", {
        air_quality: data.air_quality?.length,
        stations: data.stations?.length,
        wind: data.wind?.length,
        volcanoes: data.volcanoes?.length,
        earthquakes: data.earthquakes?.length,
      })
      return data
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })

// ======================
// 🌋 VOLCANES
// ======================
export const useVolcanoes = () =>
  useQuery({
    queryKey: ["volcanoes"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/environment/full`)
      if (!res.ok) throw new Error("Error al obtener datos de volcanes")
      const data = await res.json()
      console.log("🌋 Datos de volcanes recibidos:", data.volcanoes)
      return (data.volcanoes || []).map((v: any, index: number) => ({
        id: index,
        name: v.name || "Volcán Desconocido",
        lat: v.lat,
        lon: v.lon,
        status:
          v.status === "activo"
            ? "warning"
            : v.status === "moderado"
            ? "watch"
            : "normal",
        elevation: v.elevation || "N/D",
        lastEruption: v.last_eruption || "Desconocida",
        gases: v.gases || null,
        ashPlume: v.ash_plume || null,
      }))
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })

// ======================
// 👥 USERS QUERY (desde Firestore)
// ======================
export const usersQuery = () => ({
  queryKey: ["users"],
  queryFn: async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"))
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log("✅ Usuarios obtenidos desde Firestore:", users.length)
      return users
    } catch (error) {
      console.error("❌ Error al obtener usuarios desde Firestore:", error)
      throw error
    }
  },
  staleTime: 5 * 60 * 1000,
  refetchInterval: 2 * 60 * 1000,
})

// ======================
// 💬 POSTS DE LA COMUNIDAD
// ======================
export const communityPostsQuery = () => ({
  queryKey: ["communityPosts"],
  queryFn: async () => {
    const res = await fetch(`${API_BASE}/community/posts`, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) throw new Error("Error al obtener publicaciones de comunidad")
    const data = await res.json()
    return data.posts || []
  },
  staleTime: 2 * 60 * 1000,
  refetchInterval: 60 * 1000,
})

// 📦 Exportación genérica
export { fetcher }
