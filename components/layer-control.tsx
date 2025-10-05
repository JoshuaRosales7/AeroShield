"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Activity, Cloud, MapPin, Mountain, Wind } from "lucide-react"

interface Layer {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  visible: boolean
  opacity: number
}

interface LayerControlProps {
  layers: Layer[]
  onLayerToggle: (id: string) => void
  onOpacityChange: (id: string, opacity: number) => void
}

// Mapeo de iconos por ID de capa
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  air: Cloud,
  stations: MapPin,
  wind: Wind,
  volcanoes: Mountain,
  earthquakes: Activity,
}

export function LayerControl({ layers, onLayerToggle, onOpacityChange }: LayerControlProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Capas del Mapa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {layers.map((layer) => {
          const Icon = iconMap[layer.id] || Cloud
          return (
            <div key={layer.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={layer.id} className="cursor-pointer">
                    {layer.name}
                  </Label>
                </div>
                <Switch 
                  id={layer.id} 
                  checked={layer.visible} 
                  onCheckedChange={() => onLayerToggle(layer.id)} 
                />
              </div>
              {layer.visible && (
                <div className="ml-6 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Opacidad</span>
                    <span>{Math.round(layer.opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[layer.opacity * 100]}
                    onValueChange={([value]) => onOpacityChange(layer.id, value / 100)}
                    min={0}
                    max={100}
                    step={10}
                  />
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// Capas por defecto - Ajustadas para coincidir con el MapContainer
export const defaultLayers: Layer[] = [
  { 
    id: "air", 
    name: "Calidad del Aire", 
    icon: Cloud, 
    visible: true, 
    opacity: 0.7 
  },
  { 
    id: "wind", 
    name: "Viento", 
    icon: Wind, 
    visible: false, 
    opacity: 0.8 
  },

  { 
    id: "volcanoes", 
    name: "Volcanes", 
    icon: Mountain, 
    visible: true, 
    opacity: 0.8 
  },
  { 
    id: "earthquakes", 
    name: "Sismos", 
    icon: Activity, 
    visible: true, 
    opacity: 0.8 
  },
]