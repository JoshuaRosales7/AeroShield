"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Flame,
  Home,
  Map,
  Mountain,
  Settings,
  Users,
  Wind,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar páginas, datos, comandos..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Navegación">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Panel de Control</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/air/overview"))}>
            <Wind className="mr-2 h-4 w-4" />
            <span>Calidad del Aire</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/air/explorer"))}>
            <Map className="mr-2 h-4 w-4" />
            <span>Explorador</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/air/prediction"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Predicción IA</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/air/reports"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reportes</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Riesgos">
          <CommandItem onSelect={() => runCommand(() => router.push("/risk/earthquakes"))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Sismos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/risk/volcanoes"))}>
            <Mountain className="mr-2 h-4 w-4" />
            <span>Volcanes</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/risk/wildfires"))}>
            <Flame className="mr-2 h-4 w-4" />
            <span>Incendios</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Otros">
          <CommandItem onSelect={() => runCommand(() => router.push("/alerts"))}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Alertas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/community"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Comunidad</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/admin/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
