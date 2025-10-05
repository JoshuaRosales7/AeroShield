import type {
  AirQualityData,
  Station,
  WeatherData,
  Earthquake,
  Volcano,
  Wildfire,
  Alert,
  PollutantTimeSeries,
  KPIData,
} from "@/types"

// Mock Air Quality Data
export const mockAirQualityData: AirQualityData[] = [
  {
    timestamp: new Date().toISOString(),
    location: { lat: 19.4326, lng: -99.1332, name: "Ciudad de México" },
    pollutants: {
      NO2: 45.2,
      O3: 68.5,
      PM25: 28.3,
      PM10: 42.1,
      HCHO: 12.5,
      Aerosols: 0.15,
    },
    aqi: 68,
    aqiLevel: "moderate",
    source: "TEMPO",
  },
]

// Mock Stations
export const mockStations: Station[] = [
  {
    id: "sta-001",
    name: "Centro",
    location: { lat: 19.4326, lng: -99.1332 },
    pollutants: ["NO2", "O3", "PM25", "PM10"],
    status: "active",
    lastUpdate: new Date().toISOString(),
  },
  {
    id: "sta-002",
    name: "Polanco",
    location: { lat: 19.4363, lng: -99.191 },
    pollutants: ["NO2", "O3", "PM25"],
    status: "active",
    lastUpdate: new Date().toISOString(),
  },
]

// Mock Weather Data
export const mockWeatherData: WeatherData = {
  timestamp: new Date().toISOString(),
  location: { lat: 19.4326, lng: -99.1332 },
  temperature: 22,
  humidity: 45,
  windSpeed: 12,
  windDirection: 180,
  precipitation: 0,
  pressure: 1013,
}

// Mock Earthquakes
export const mockEarthquakes: Earthquake[] = [
  {
    id: "eq-001",
    magnitude: 4.2,
    depth: 10,
    location: { lat: 18.5, lng: -98.5, name: "Puebla" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    distance: 120,
    intensity: "Light",
  },
]

// Mock Volcanoes
export const mockVolcanoes: Volcano[] = [
  {
    id: "vol-001",
    name: "Popocatépetl",
    location: { lat: 19.0225, lng: -98.6278 },
    status: "watch",
    elevation: 5426,
    lastEruption: "2024-01-15",
    ashPlume: {
      height: 2000,
      direction: 90,
      extent: 50,
    },
    gases: {
      SO2: 1200,
    },
  },
]

// Mock Wildfires
export const mockWildfires: Wildfire[] = [
  {
    id: "fire-001",
    name: "Incendio Forestal Norte",
    location: { lat: 19.6, lng: -99.2 },
    area: 150,
    containment: 45,
    startDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "active",
    smokeImpact: {
      radius: 25,
      aqiImpact: 85,
    },
  },
]

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: "alert-001",
    type: "air",
    severity: "warning",
    status: "active",
    title: "Alta concentración de ozono",
    message: "Se detectaron niveles elevados de O3. Se recomienda limitar actividades al aire libre.",
    location: { lat: 19.4326, lng: -99.1332, radius: 10 },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    source: "TEMPO",
  },
  {
    id: "alert-002",
    type: "earthquake",
    severity: "info",
    status: "resolved",
    title: "Sismo detectado",
    message: "Sismo de magnitud 4.2 a 120km de distancia.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    source: "USGS",
  },
]

// Mock Time Series
export const generateMockTimeSeries = (hours = 24): PollutantTimeSeries[] => {
  const now = Date.now()
  const pollutants: Array<{ pollutant: any; baseValue: number; unit: string }> = [
    { pollutant: "NO2", baseValue: 45, unit: "µg/m³" },
    { pollutant: "O3", baseValue: 68, unit: "µg/m³" },
    { pollutant: "PM25", baseValue: 28, unit: "µg/m³" },
    { pollutant: "HCHO", baseValue: 12, unit: "µg/m³" },
  ]

  return pollutants.map(({ pollutant, baseValue, unit }) => ({
    pollutant,
    unit,
    data: Array.from({ length: hours }, (_, i) => ({
      timestamp: new Date(now - (hours - i) * 3600000).toISOString(),
      value: baseValue + Math.random() * 20 - 10,
      predicted: i > hours - 12,
    })),
  }))
}

// Mock KPIs
export const mockKPIs: KPIData[] = [
  {
    label: "AQI Actual",
    value: 68,
    unit: "",
    trend: { value: -5, direction: "down" },
    status: "moderate",
  },
  {
    label: "Sismos 24h",
    value: 3,
    unit: "eventos",
    status: "normal",
  },
  {
    label: "Temperatura",
    value: 22,
    unit: "°C",
    trend: { value: 2, direction: "up" },
  },
  {
    label: "Estaciones Activas",
    value: 45,
    unit: "",
    status: "normal",
  },
]

export interface DataSource {
  id: string
  name: string
  type: string
  status: "active" | "inactive" | "error"
  lastSync: string
  dataPoints: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "user" | "viewer"
  status: "active" | "inactive"
  lastActive: string
}

export interface CommunityPost {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  category?: string
  createdAt: string
  likes: number
  replies: number
}

export const mockDataSources: DataSource[] = [
  {
    id: "ds-001",
    name: "NASA TEMPO",
    type: "Calidad del Aire",
    status: "active",
    lastSync: new Date(Date.now() - 300000).toISOString(),
    dataPoints: 1250000,
  },
  {
    id: "ds-002",
    name: "USGS Earthquakes",
    type: "Actividad Sísmica",
    status: "active",
    lastSync: new Date(Date.now() - 600000).toISOString(),
    dataPoints: 45000,
  },
  {
    id: "ds-003",
    name: "FIRMS Wildfires",
    type: "Incendios Forestales",
    status: "active",
    lastSync: new Date(Date.now() - 900000).toISOString(),
    dataPoints: 32000,
  },
  {
    id: "ds-004",
    name: "Smithsonian Volcanoes",
    type: "Actividad Volcánica",
    status: "active",
    lastSync: new Date(Date.now() - 1200000).toISOString(),
    dataPoints: 8500,
  },
  {
    id: "ds-005",
    name: "OpenWeather",
    type: "Meteorología",
    status: "active",
    lastSync: new Date(Date.now() - 180000).toISOString(),
    dataPoints: 980000,
  },
]

export const mockUsers: User[] = [
  {
    id: "user-001",
    name: "María González",
    email: "maria.gonzalez@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "admin",
    status: "active",
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "user-002",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    status: "active",
    lastActive: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "user-003",
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "user",
    status: "active",
    lastActive: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "user-004",
    name: "Luis Hernández",
    email: "luis.hernandez@example.com",
    role: "viewer",
    status: "inactive",
    lastActive: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
]

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "post-001",
    title: "¿Cómo interpretar los niveles de ozono?",
    content:
      "He notado que los niveles de O3 varían mucho durante el día. ¿Alguien puede explicar por qué sucede esto y cuáles son los niveles seguros?",
    author: {
      name: "María González",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Calidad del Aire",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 12,
    replies: 5,
  },
  {
    id: "post-002",
    title: "Recomendaciones para días con alta contaminación",
    content:
      "Comparto algunas recomendaciones para protegerse en días con AQI alto: usar mascarilla N95, evitar ejercicio al aire libre, mantener ventanas cerradas...",
    author: {
      name: "Carlos Rodríguez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Salud",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: 28,
    replies: 8,
  },
  {
    id: "post-003",
    title: "Sismo de 4.2 esta mañana",
    content:
      "¿Alguien más sintió el sismo de esta mañana? La app me alertó justo a tiempo. ¿Qué tan precisas son estas alertas?",
    author: {
      name: "Ana Martínez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "Sismos",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    likes: 15,
    replies: 12,
  },
  {
    id: "post-004",
    title: "Actividad del Popocatépetl",
    content:
      "He estado monitoreando la actividad del Popocatépetl y parece que ha aumentado en los últimos días. ¿Deberíamos preocuparnos?",
    author: {
      name: "Luis Hernández",
    },
    category: "Volcanes",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    likes: 22,
    replies: 9,
  },
]
