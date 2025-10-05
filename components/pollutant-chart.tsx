"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface TimePoint {
  timestamp: string
  value: number
}

interface PollutantData {
  pollutant: string
  data: TimePoint[]
}

interface PollutantChartProps {
  data?: PollutantData[]
  description?: string
  compact?: boolean
}

export function PollutantChart({ data = [], description = "Datos satelitales NASA TEMPO", compact = false }: PollutantChartProps) {
  const [isDark, setIsDark] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  // Detectar tema oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Procesar datos cuando cambien las props
  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([])
      return
    }

    // Encontrar todos los timestamps únicos
    const allTimestamps = new Set<string>()
    data.forEach(pollutant => {
      pollutant.data.forEach(point => {
        allTimestamps.add(point.timestamp)
      })
    })

    const sortedTimestamps = Array.from(allTimestamps).sort()

    // Crear estructura de datos para el gráfico
    const formattedData = sortedTimestamps.map(timestamp => {
      const point: any = {
        label: new Date(timestamp).toLocaleTimeString('es-GT', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }

      // Añadir valores para cada contaminante
      data.forEach(pollutant => {
        const valuePoint = pollutant.data.find(p => p.timestamp === timestamp)
        point[pollutant.pollutant] = valuePoint?.value ?? 0
      })

      return point
    })

    setChartData(formattedData)
  }, [data])

  // Colores que funcionan bien en ambos temas
  const colors = {
    NO2: "#3b82f6",    // Azul
    O3: "#10b981",     // Verde
    PM25: "#f59e0b",   // Amarillo
    HCHO: "#ef4444",   // Rojo
    CO: "#8b5cf6",     // Violeta
    SO2: "#06b6d4",    // Cian
  }

  // Configuración de estilos para tema oscuro/claro
  const textColor = isDark ? "#e2e8f0" : "#374151"
  const gridColor = isDark ? "#4b5563" : "#d1d5db"
  const tooltipBg = isDark ? "#1f2937" : "#ffffff"
  const tooltipBorder = isDark ? "#4b5563" : "#e5e7eb"
  const tooltipText = isDark ? "#f3f4f6" : "#111827"

  const hasData = chartData.length > 0 && data.length > 0

  return (
    <Card>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle className={compact ? "text-sm" : "text-base"}>
          📊 Tendencia de Contaminantes
        </CardTitle>
        <CardDescription className={compact ? "text-xs" : ""}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className={`flex flex-col items-center justify-center ${compact ? 'h-[150px]' : 'h-[200px]'} gap-3 bg-muted/20 rounded-lg`}>
            <div className="text-center text-muted-foreground">
              <div className="text-lg mb-2">📈</div>
              <p className={compact ? "text-xs" : "text-sm"}>
                {data.length === 0 ? "No hay datos disponibles" : "Procesando datos..."}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={compact ? 200 : 300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={gridColor}
                opacity={0.5}
              />
              <XAxis 
                dataKey="label" 
                stroke={textColor}
                fontSize={compact ? 10 : 12}
                tick={{ fill: textColor }}
              />
              <YAxis 
                stroke={textColor}
                fontSize={compact ? 10 : 12}
                tick={{ fill: textColor }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '8px',
                  color: tooltipText,
                  fontSize: compact ? '12px' : '14px',
                }}
                labelStyle={{
                  color: tooltipText,
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: compact ? '10px' : '12px',
                  color: textColor,
                  paddingTop: '10px',
                }}
              />
              {data.map((pollutant, index) => {
                const colorKey = pollutant.pollutant as keyof typeof colors
                const color = colors[colorKey] || `hsl(${index * 60}, 70%, 50%)`
                
                return (
                  <Line
                    key={pollutant.pollutant}
                    type="monotone"
                    dataKey={pollutant.pollutant}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    name={pollutant.pollutant}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}