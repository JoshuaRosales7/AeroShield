export function formatValue(value: number, decimals = 1): string {
  return value.toFixed(decimals)
}

// Format distance
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${formatValue(km, 1)}km`
}

// Format date/time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

// Format relative time
// Format relative time
export function formatRelativeTime(date: string | Date): string {
  if (!date) return "—" // fallback si viene vacío

  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "Fecha inválida" // prevenir errores

  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Ahora"
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${days}d`
}


// Format percentage
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}
