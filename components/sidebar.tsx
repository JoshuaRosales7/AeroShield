"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Flame,
  Home,
  Map,
  Menu,
  Mountain,
  Settings,
  Users,
  Wind,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useState, useEffect } from "react"

// 🔹 Estructura de navegación
interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navItems: NavItem[] = [
  { title: "Panel", href: "/dashboard", icon: Home },
  {
    title: "Aire",
    href: "/air",
    icon: Wind,
    children: [
      { title: "Resumen", href: "/air/overview", icon: Wind },
      { title: "Explorador", href: "/air/explorer", icon: Map },
      { title: "Predicción", href: "/air/prediction", icon: BarChart3 },
      { title: "Reportes", href: "/air/reports", icon: FileText },
    ],
  },
  {
    title: "Riesgos",
    href: "/risk",
    icon: AlertTriangle,
    children: [
      { title: "Sismos", href: "/risk/earthquakes", icon: Activity },
      { title: "Volcanes", href: "/risk/volcanoes", icon: Mountain },
    ],
  },
  { title: "Alertas", href: "/alerts", icon: AlertTriangle },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
    children: [
      
      { title: "Usuarios", href: "/admin/users", icon: Users },
      { title: "Configuración", href: "/admin/settings", icon: Settings },
    ],
  },
]

// 🔸 Subcomponentes
function NavItems({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>([])

  const toggleExpand = (href: string) => {
    setExpanded((prev) => (prev.includes(href) ? prev.filter((x) => x !== href) : [...prev, href]))
  }

  return (
    <div className="space-y-1 py-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        const isExpanded = expanded.includes(item.href)
        const Icon = item.icon

        return (
          <div key={item.href}>
            {item.children ? (
              <>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full flex items-center transition justify-start hover:bg-accent/50",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={() => toggleExpand(item.href)}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", !collapsed && "mr-2")} />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>{item.title}</span>
                      <ChevronRight
                        className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")}
                      />
                    </div>
                  )}
                </Button>

                {!collapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border/40 pl-3">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      const isChildActive = pathname === child.href
                      return (
                        <Link key={child.href} href={child.href} onClick={onNavigate}>
                          <Button
                            variant={isChildActive ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start hover:bg-accent/40"
                          >
                            <ChildIcon className="mr-2 h-4 w-4" />
                            {child.title}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <Link href={item.href} onClick={onNavigate}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full flex items-center justify-start transition hover:bg-accent/50",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", !collapsed && "mr-2")} />
                  {!collapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()
  const [open, setOpen] = useState(false)
  const [systemActive, setSystemActive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  // 🕒 Simula actualizaciones del sistema
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleString("es-GT", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setLastUpdate(formatted)
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* 📱 Botón móvil */}
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-md bg-background/80 backdrop-blur-sm shadow">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:w-72 p-0 bg-card border-r border-border overflow-hidden">
            <div className="flex h-full flex-col">
              {/* Estado del sistema */}
              <div className="flex h-14 items-center border-b border-border px-4 justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full",
                      systemActive ? "bg-green-500" : "bg-red-500 animate-pulse"
                    )}
                  />
                  <span className="text-sm font-medium">
                    {systemActive ? "Sistema Activo" : "Fuera de línea"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Última act: {lastUpdate}</span>
              </div>
              <ScrollArea className="flex-1 px-3 pb-4">
                <NavItems onNavigate={() => setOpen(false)} />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* 💻 Sidebar escritorio */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Indicador de estado */}
        <div className="flex items-center justify-between h-14 border-b border-border px-4">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    systemActive ? "bg-green-500" : "bg-red-500 animate-pulse"
                  )}
                />
                <span className="text-sm font-medium">
                  {systemActive ? "Sistema Activo" : "Fuera de línea"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {lastUpdate && `Última: ${lastUpdate}`}
              </span>
            </>
          ) : (
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                systemActive ? "bg-green-500" : "bg-red-500 animate-pulse"
              )}
              title={systemActive ? "Sistema Activo" : "Fuera de línea"}
            />
          )}
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          <NavItems collapsed={sidebarCollapsed} />
        </ScrollArea>

        {/* Botón de colapsar */}
        <div className="border-t border-border p-3 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="transition hover:bg-accent/40"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </>
  )
}
