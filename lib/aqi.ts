import type { AQILevel, Pollutant } from "@/types"

// Calculate AQI from pollutant concentration
export function calculateAQI(pollutant: Pollutant, concentration: number): number {
  // Simplified AQI calculation (US EPA standard)
  // In production, use proper breakpoints for each pollutant

  const breakpoints: Record<Pollutant, Array<[number, number, number, number]>> = {
    NO2: [
      [0, 53, 0, 50],
      [54, 100, 51, 100],
      [101, 360, 101, 150],
      [361, 649, 151, 200],
      [650, 1249, 201, 300],
      [1250, 2049, 301, 500],
    ],
    O3: [
      [0, 54, 0, 50],
      [55, 70, 51, 100],
      [71, 85, 101, 150],
      [86, 105, 151, 200],
      [106, 200, 201, 300],
    ],
    PM25: [
      [0, 12, 0, 50],
      [12.1, 35.4, 51, 100],
      [35.5, 55.4, 101, 150],
      [55.5, 150.4, 151, 200],
      [150.5, 250.4, 201, 300],
      [250.5, 500, 301, 500],
    ],
    PM10: [
      [0, 54, 0, 50],
      [55, 154, 51, 100],
      [155, 254, 101, 150],
      [255, 354, 151, 200],
      [355, 424, 201, 300],
      [425, 604, 301, 500],
    ],
    HCHO: [[0, 100, 0, 100]],
    SO2: [[0, 100, 0, 100]],
    Aerosols: [[0, 1, 0, 100]],
  }

  const ranges = breakpoints[pollutant] || [[0, 100, 0, 100]]

  for (const [cLow, cHigh, iLow, iHigh] of ranges) {
    if (concentration >= cLow && concentration <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (concentration - cLow) + iLow)
    }
  }

  return 500 // Max AQI
}

// Get AQI level from AQI value
export function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return "good"
  if (aqi <= 100) return "moderate"
  if (aqi <= 150) return "unhealthy-sensitive"
  if (aqi <= 200) return "unhealthy"
  if (aqi <= 300) return "very-unhealthy"
  return "hazardous"
}

// Get AQI color
export function getAQIColor(level: AQILevel): string {
  const colors: Record<AQILevel, string> = {
    good: "text-green-500",
    moderate: "text-yellow-500",
    "unhealthy-sensitive": "text-orange-500",
    unhealthy: "text-red-500",
    "very-unhealthy": "text-purple-500",
    hazardous: "text-rose-900",
  }
  return colors[level]
}

// Get AQI background color
export function getAQIBgColor(level: AQILevel): string {
  const colors: Record<AQILevel, string> = {
    good: "bg-green-500/10",
    moderate: "bg-yellow-500/10",
    "unhealthy-sensitive": "bg-orange-500/10",
    unhealthy: "bg-red-500/10",
    "very-unhealthy": "bg-purple-500/10",
    hazardous: "bg-rose-900/10",
  }
  return colors[level]
}
