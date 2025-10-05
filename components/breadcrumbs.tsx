"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Fragment } from "react"

const pathNameMap: Record<string, string> = {
  dashboard: "Panel",
  air: "Aire",
  overview: "Resumen",
  explorer: "Explorador",
  prediction: "Predicción",
  reports: "Reportes",
  risk: "Riesgos",
  earthquakes: "Sismos",
  volcanoes: "Volcanes",
  wildfires: "Incendios",
  alerts: "Alertas",
  community: "Comunidad",
  admin: "Admin",
  "data-sources": "Fuentes de Datos",
  users: "Usuarios",
  settings: "Configuración",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground">
        Inicio
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const isLast = index === segments.length - 1
        const label = pathNameMap[segment] || segment

        return (
          <Fragment key={href}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
