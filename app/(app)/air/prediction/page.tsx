"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Brain, Download, CloudSun, Wind, Droplets, Thermometer } from "lucide-react"
import { format } from "date-fns"
import { useEnvironmentFull, useAirPredictionReport } from "@/lib/queries"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function AirPredictionPage() {
  const [pollutant, setPollutant] = useState("NO2")
  const [horizon, setHorizon] = useState("48")

  const { data: environment, isLoading } = useEnvironmentFull()
  const { data: report, refetch: refetchReport, isFetching } = useAirPredictionReport(environment)

  const weather = environment?.weather || {}
  const city = environment?.center?.name || "Guatemala"

  // 🔹 Datos simulados
  const predictionData = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const timestamp = new Date(Date.now() + i * 3600000)
      const observed = i < 24 ? 40 + Math.random() * 15 : null
      const predicted = i >= 20 ? 42 + Math.random() * 10 : null
      return {
        timestamp: format(timestamp, "HH:mm"),
        observed,
        predicted,
      }
    })
  }, [])

  // 🧾 Generar PDF profesional
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    doc.setFont("courier", "normal")

    // 🌍 Encabezado
    doc.setFontSize(20)
    doc.setTextColor(0, 51, 102)
    doc.text(`Reporte Climático Inteligente - ${city}`, 14, 22)
    doc.setDrawColor(0, 102, 204)
    doc.setLineWidth(0.8)
    doc.line(14, 25, 195, 25)

    // 📅 Datos principales
    const now = format(new Date(), "dd/MM/yyyy HH:mm")
    let y = 35
    doc.setFontSize(12)
    doc.setTextColor(40, 40, 40)
    doc.text(`📅 Fecha: ${now}`, 14, y)
    y += 8
    doc.text(`🌡️ Temperatura: ${weather.temperature ?? "--"} °C`, 14, y)
    y += 8
    doc.text(`💧 Humedad: ${weather.humidity ?? "--"} %`, 14, y)
    y += 8
    doc.text(`🌬️ Viento: ${weather.wind_speed ?? "--"} km/h (${weather.wind_direction ?? "--"}°)`, 14, y)
    y += 8
    doc.text(`⛅ Presión: ${weather.pressure ?? "--"} hPa`, 14, y)

    // 📊 Tabla de valores
    y += 10
    autoTable(doc, {
      startY: y,
      head: [["Hora", "Observado (µg/m³)", "Predicho (µg/m³)"]],
      body: predictionData.slice(0, 12).map((d) => [
        d.timestamp,
        d.observed?.toFixed(1) ?? "-",
        d.predicted?.toFixed(1) ?? "-",
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        font: "courier",
        fontSize: 10,
        textColor: [33, 33, 33],
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // 🧠 Segunda página: reporte IA
    if (report) {
      doc.addPage()
      doc.setFontSize(18)
      doc.setTextColor(0, 51, 102)
      doc.text("🧠 Reporte Generado por IA", 14, 20)
      doc.setDrawColor(0, 102, 204)
      doc.line(14, 23, 195, 23)

      doc.setFontSize(12)
      doc.setTextColor(30, 30, 30)
      const formatted = report
        .replace(/#+/g, "")
        .replace(/\*\*/g, "")
        .replace(/-/g, "•")
        .replace(/\*/g, "")
        .trim()
      const wrapped = doc.splitTextToSize(formatted, 180)
      doc.text(wrapped, 14, 35, { lineHeightFactor: 1.4 })
    }

    // 💾 Guardar
    doc.save(`Reporte_Climatico_${city}_${format(new Date(), "ddMMyyyy_HHmm")}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* 🧭 Encabezado principal */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pronóstico Ambiental con IA</h1>
          <p className="text-muted-foreground">Predicciones combinadas de calidad del aire y clima ({city})</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetchReport()} disabled={isFetching}>
            <Brain className="mr-2 h-4 w-4" />
            {isFetching ? "Generando..." : "Generar Reporte IA"}
          </Button>
          {report && (
            <Button variant="secondary" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> Descargar PDF
            </Button>
          )}
        </div>
      </div>

      {/* 🌡️ Tarjetas de clima */}
      {weather && (
        <div className="grid gap-4 md:grid-cols-4">
          <InfoCard title="Temperatura" icon={<Thermometer className="h-4 w-4 text-orange-500" />} value={`${weather.temperature ?? "--"}°C`} subtitle="Sensación actual" />
          <InfoCard title="Humedad" icon={<Droplets className="h-4 w-4 text-blue-500" />} value={`${weather.humidity ?? "--"}%`} subtitle="Relativa" />
          <InfoCard title="Viento" icon={<Wind className="h-4 w-4 text-cyan-500" />} value={`${weather.wind_speed ?? "--"} km/h`} subtitle={`Dirección ${weather.wind_direction ?? "--"}°`} />
          <InfoCard title="Presión" icon={<CloudSun className="h-4 w-4 text-yellow-500" />} value={`${weather.pressure ?? "--"} hPa`} subtitle="Última lectura" />
        </div>
      )}

      {/* ⚙️ Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Modelo</CardTitle>
          <CardDescription>Selecciona los parámetros de predicción</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Contaminante</label>
            <Select value={pollutant} onValueChange={setPollutant}>
              <SelectTrigger><SelectValue placeholder="NO₂" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NO2">NO₂</SelectItem>
                <SelectItem value="O3">O₃</SelectItem>
                <SelectItem value="PM25">PM2.5</SelectItem>
                <SelectItem value="HCHO">HCHO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Horizonte</label>
            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger><SelectValue placeholder="48 horas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 horas</SelectItem>
                <SelectItem value="48">48 horas</SelectItem>
                <SelectItem value="72">72 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 📈 Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Predicción de {pollutant}</CardTitle>
          <CardDescription>Conjunto histórico + IA</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="timestamp" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Area type="monotone" dataKey="observed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
              <Area type="monotone" dataKey="predicted" stroke="#f97316" fill="#f97316" fillOpacity={0.3} strokeDasharray="4 4" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🧠 Reporte IA */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte Climático Inteligente</CardTitle>
            <CardDescription>Generado por OpenAI según datos actuales</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-line text-sm leading-relaxed border-l-4 border-primary pl-4 bg-muted/30 p-2 rounded-md">
              {report}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 🌤️ Tarjeta individual
function InfoCard({ title, icon, value, subtitle }: { title: string; icon: any; value: string; subtitle: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
