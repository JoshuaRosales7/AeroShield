export type UserRole = "citizen" | "athlete" | "asthmatic" | "educator" | "authority" | "admin"

export type AlertSeverity = "info" | "watch" | "warning" | "severe"
export type AlertType = "air" | "earthquake" | "volcano" | "wildfire" | "system"
export type AlertStatus = "unread" | "active" | "resolved"
export type AlertChannel = "push" | "email" | "sms"

export type Pollutant = "NO2" | "O3" | "PM25" | "PM10" | "HCHO" | "SO2" | "Aerosols"

export type AQILevel = "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous"

export type VolcanoStatus = "normal" | "advisory" | "watch" | "warning"

export type Theme = "light" | "dark" | "high-contrast"

export type Locale = "es" | "en"

// User Profile
export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  location?: {
    lat: number
    lng: number
    name: string
  }
  preferences: UserPreferences
  createdAt: string
}

// User Preferences
export interface UserPreferences {
  locale: Locale
  theme: Theme
  alerts: {
    enabled: boolean
    channels: AlertChannel[]
    thresholds: {
      NO2: number
      O3: number
      PM25: number
      HCHO: number
    }
  }
  notifications: {
    push: boolean
    email: boolean
    sms: boolean
  }
}

// Air Quality Data
export interface AirQualityData {
  timestamp: string
  location: {
    lat: number
    lng: number
    name?: string
  }
  pollutants: {
    NO2?: number
    O3?: number
    PM25?: number
    PM10?: number
    HCHO?: number
    SO2?: number
    Aerosols?: number
  }
  aqi: number
  aqiLevel: AQILevel
  source: "TEMPO" | "OpenAQ" | "Station"
}

// Time Series Data
export interface TimeSeriesData {
  timestamp: string
  value: number
  predicted?: boolean
}

export interface PollutantTimeSeries {
  pollutant: Pollutant
  data: TimeSeriesData[]
  unit: string
}

// Station Data
export interface Station {
  id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  pollutants: Pollutant[]
  status: "active" | "inactive" | "maintenance"
  lastUpdate: string
}

// Weather Data
export interface WeatherData {
  timestamp: string
  location: {
    lat: number
    lng: number
  }
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  precipitation: number
  pressure: number
}

// Earthquake Data
export interface Earthquake {
  id: string
  magnitude: number
  depth: number
  location: {
    lat: number
    lng: number
    name: string
  }
  timestamp: string
  distance?: number
  intensity?: string
  url?: string
}

// Volcano Data
export interface Volcano {
  id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  status: VolcanoStatus
  elevation: number
  lastEruption?: string
  ashPlume?: {
    height: number
    direction: number
    extent: number
  }
  gases?: {
    SO2?: number
    CO2?: number
  }
}

// Wildfire Data
export interface Wildfire {
  id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  area: number
  containment: number
  startDate: string
  status: "active" | "contained" | "controlled"
  smokeImpact?: {
    radius: number
    aqiImpact: number
  }
}

// Alert Data
export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  title: string
  message: string
  location?: {
    lat: number
    lng: number
    radius?: number
  }
  timestamp: string
  expiresAt?: string
  source: string
  metadata?: Record<string, any>
}

// Alert Rule
export interface AlertRule {
  id: string
  name: string
  enabled: boolean
  type: AlertType
  conditions: {
    pollutant?: Pollutant
    threshold?: number
    operator?: "gt" | "lt" | "eq"
    magnitude?: number
    distance?: number
  }
  channels: AlertChannel[]
  schedule?: {
    start: string
    end: string
    days: number[]
  }
  createdAt: string
  updatedAt: string
}

// Prediction Model
export interface PredictionModel {
  id: string
  name: string
  pollutant: Pollutant
  horizon: number // hours
  accuracy: {
    mae: number
    rmse: number
    r2: number
  }
  lastTrained: string
}

// Prediction Data
export interface PredictionData {
  pollutant: Pollutant
  observed: TimeSeriesData[]
  predicted: TimeSeriesData[]
  uncertainty?: {
    lower: TimeSeriesData[]
    upper: TimeSeriesData[]
  }
  model: string
}

// Community Contribution
export interface CommunityContribution {
  id: string
  userId: string
  userName: string
  type: "measurement" | "observation" | "photo"
  location: {
    lat: number
    lng: number
  }
  data?: {
    pollutant?: Pollutant
    value?: number
    description?: string
    photoUrl?: string
  }
  timestamp: string
  verified: boolean
  votes: number
}

// Data Source
export interface DataSource {
  id: string
  name: string
  type: "TEMPO" | "OpenAQ" | "USGS" | "Weather" | "Volcano"
  endpoint: string
  status: "healthy" | "degraded" | "down"
  lastCheck: string
  refreshRate: number // minutes
  apiKey?: string
}

// Map Layer
export interface MapLayer {
  id: string
  name: string
  type: "raster" | "vector" | "wms" | "geojson"
  url?: string
  visible: boolean
  opacity: number
  zIndex: number
}

// Report Configuration
export interface ReportConfig {
  title: string
  dateRange: {
    start: string
    end: string
  }
  location?: {
    lat: number
    lng: number
    radius: number
  }
  pollutants: Pollutant[]
  includeMap: boolean
  includeCharts: boolean
  includeRecommendations: boolean
  format: "pdf" | "csv" | "json"
}

// KPI Data
export interface KPIData {
  label: string
  value: number | string
  unit?: string
  trend?: {
    value: number
    direction: "up" | "down" | "stable"
  }
  status?: AQILevel | "normal" | "warning" | "critical"
}

// /types/index.ts
export interface Alert {
  id: string
  title: string
  message: string
  description?: string
  type: "air_quality" | "earthquake" | "volcano" | "system" | "wildfire"
  severity: "info" | "watch" | "warning" | "severe" | "high"
  status: "sent" | "active" | "resolved" | "unread"
  location?: string
  latitude?: number
  longitude?: number
  timestamp: string
  delivered?: boolean
  read?: boolean
  test?: boolean
  recommendations?: string[]
  details?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}
