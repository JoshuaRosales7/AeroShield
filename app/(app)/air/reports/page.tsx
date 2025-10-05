"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

export default function AirReportsPage() {
  const [reportConfig, setReportConfig] = useState({
    title: "Reporte de Calidad del Aire",
    dateStart: "",
    dateEnd: "",
    pollutants: ["NO2", "O3", "PM25"],
    includeMap: true,
    includeCharts: true,
    includeRecommendations: true,
    format: "pdf",
  })

  const handleGenerate = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    
    // Configuración de fuentes y colores
    const primaryColor = [0, 51, 102]
    const secondaryColor = [0, 102, 204]
    const textColor = [40, 40, 40]
    const lightGray = [240, 240, 240]

    doc.setFont("helvetica", "normal")

    // 🎨 ENCABEZADO PRINCIPAL
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 25, 'F')
    
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text(reportConfig.title, 105, 15, { align: "center" })
    
    doc.setFontSize(9)
    doc.setTextColor(200, 220, 255)
    const now = format(new Date(), "dd/MM/yyyy 'a las' HH:mm")
    doc.text(`Generado: ${now}`, 105, 22, { align: "center" })

    // 📊 INFORMACIÓN GENERAL
    let currentY = 35
    doc.setFontSize(10)
    doc.setTextColor(...textColor)
    
    // Período del reporte
    if (reportConfig.dateStart && reportConfig.dateEnd) {
      const startDate = format(new Date(reportConfig.dateStart), "dd/MM/yyyy")
      const endDate = format(new Date(reportConfig.dateEnd), "dd/MM/yyyy")
      doc.text(`Periodo analizado: ${startDate} - ${endDate}`, 14, currentY)
    } else {
      doc.text("Periodo: No especificado", 14, currentY)
    }
    currentY += 5
    
    doc.text(`Formato: ${reportConfig.format.toUpperCase()}`, 14, currentY)
    currentY += 5
    doc.text(`Contaminantes: ${reportConfig.pollutants.length} seleccionados`, 14, currentY)
    currentY += 10

    // 🧪 CONTAMINANTES SELECCIONADOS
    const addSectionTitle = (title: string, y: number) => {
      doc.setFontSize(12)
      doc.setTextColor(...primaryColor)
      doc.setFont("helvetica", "bold")
      doc.text(title, 14, y)
      doc.setDrawColor(...secondaryColor)
      doc.setLineWidth(0.3)
      doc.line(14, y + 1, 50, y + 1)
      doc.setFont("helvetica", "normal")
      return y + 6
    }

    currentY = addSectionTitle("CONTAMINANTES MONITOREADOS", currentY)

    const pollutantsData = reportConfig.pollutants.map((p) => [
      p,
      {
        NO2: "Dioxido de Nitrogeno",
        O3: "Ozono Troposferico",
        PM25: "Material Particulado 2.5µm",
        PM10: "Material Particulado 10µm",
        HCHO: "Formaldehido",
        Aerosols: "Aerosoles Atmosfericos",
      }[p] || "Desconocido"
    ])

    autoTable(doc, {
      startY: currentY,
      head: [["SIMBOLO", "DESCRIPCION"]],
      body: pollutantsData,
      theme: "grid",
      headStyles: { 
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: "bold",
        lineWidth: 0.1,
        fontSize: 9
      },
      bodyStyles: { 
        textColor: textColor,
        fontSize: 9
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        font: "helvetica"
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: "bold" },
        1: { cellWidth: "auto" }
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto'
    })

    // ⚙️ CONFIGURACIÓN DEL CONTENIDO
    let nextY = (doc as any).lastAutoTable.finalY + 10
    nextY = addSectionTitle("CONFIGURACION DEL REPORTE", nextY)

    autoTable(doc, {
      startY: nextY,
      head: [["ELEMENTO", "ESTADO"]],
      body: [
        ["Mapas de calidad del aire", reportConfig.includeMap ? "INCLUIDO" : "NO INCLUIDO"],
        ["Graficas y tendencias", reportConfig.includeCharts ? "INCLUIDO" : "NO INCLUIDO"],
        ["Recomendaciones", reportConfig.includeRecommendations ? "INCLUIDO" : "NO INCLUIDO"],
      ],
      theme: "plain",
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        font: "helvetica"
      },
      headStyles: { 
        fillColor: lightGray,
        textColor: primaryColor,
        fontStyle: "bold",
        lineWidth: 0.1,
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: "auto", fontStyle: "bold" },
        1: { cellWidth: 30, halign: "center" }
      },
      margin: { left: 14, right: 14 },
      pageBreak: 'auto'
    })

    // 🧠 RECOMENDACIONES (si están incluidas)
    if (reportConfig.includeRecommendations) {
      let recY = (doc as any).lastAutoTable.finalY + 12
      
      // Verificar si hay espacio suficiente para las recomendaciones
      const pageHeight = doc.internal.pageSize.height
      const spaceNeeded = 60 // Espacio estimado necesario
      
      if (recY + spaceNeeded > pageHeight - 20) {
        doc.addPage()
        recY = 20
      }

      recY = addSectionTitle("ANALISIS Y RECOMENDACIONES", recY)

      // Fondo para recomendaciones
      doc.setFillColor(...lightGray)
      doc.roundedRect(14, recY, 182, 45, 2, 2, 'F')
      
      doc.setFontSize(9)
      doc.setTextColor(...textColor)
      
      const recommendations = [
        "• Mantener monitoreo constante de NO2 y PM2.5 en zonas urbanas de alta densidad vehicular.",
        "• Cuando los niveles de O3 superen los 100 µg/m³, limitar actividades al aire libre.",
        "• Implementar campañas educativas sobre efectos de la contaminacion atmosferica.",
        "• Reforzar controles de emisiones vehiculares y regular quemas agricolas.",
        "• Considerar sistemas de alerta temprana para grupos sensibles."
      ]

      let textY = recY + 6
      const lineHeight = 4.5
      const maxWidth = 175

      recommendations.forEach((rec) => {
        const lines = doc.splitTextToSize(rec, maxWidth)
        
        // Verificar si necesitamos nueva página
        if (textY + (lines.length * lineHeight) > pageHeight - 15) {
          doc.addPage()
          textY = 20
          // Redibujar el fondo en la nueva página
          doc.setFillColor(...lightGray)
          doc.roundedRect(14, textY - 6, 182, 45, 2, 2, 'F')
        }
        
        doc.text(lines, 18, textY)
        textY += (lines.length * lineHeight) + 2
      })
    }

    // 📄 PIE DE PÁGINA PARA TODAS LAS PÁGINAS
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.height
      
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text(
        "Sistema de Monitoreo de Calidad del Aire - Reporte generado automaticamente", 
        105, 
        pageHeight - 10, 
        { align: "center" }
      )
      
      doc.text(
        `Pagina ${i} de ${totalPages}`, 
        195, 
        pageHeight - 10, 
        { align: "right" }
      )
    }

    // 💾 GUARDAR PDF
    const fileName = `Reporte_Calidad_Aire_${format(new Date(), "ddMMyyyy_HHmm")}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="space-y-6">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generador de Reportes</h1>
          <p className="text-muted-foreground">Crea reportes personalizados de calidad del aire</p>
        </div>
      </div>

      {/* 🔸 Layout principal */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ⚙️ Configuración del reporte */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Reporte</CardTitle>
            <CardDescription>Define los parámetros del documento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título del Reporte</Label>
              <Input
                id="title"
                value={reportConfig.title}
                onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
              />
            </div>

            {/* Fechas */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateStart">Fecha Inicio</Label>
                <Input
                  id="dateStart"
                  type="date"
                  value={reportConfig.dateStart}
                  onChange={(e) => setReportConfig({ ...reportConfig, dateStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEnd">Fecha Fin</Label>
                <Input
                  id="dateEnd"
                  type="date"
                  value={reportConfig.dateEnd}
                  onChange={(e) => setReportConfig({ ...reportConfig, dateEnd: e.target.value })}
                />
              </div>
            </div>

            {/* Contaminantes */}
            <div className="space-y-2">
              <Label>Contaminantes</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {["NO2", "O3", "PM25", "PM10", "HCHO", "Aerosols"].map((pollutant) => (
                  <div key={pollutant} className="flex items-center space-x-2">
                    <Checkbox
                      id={pollutant}
                      checked={reportConfig.pollutants.includes(pollutant)}
                      onCheckedChange={(checked) => {
                        const pollutants = checked
                          ? [...reportConfig.pollutants, pollutant]
                          : reportConfig.pollutants.filter((p) => p !== pollutant)
                        setReportConfig({ ...reportConfig, pollutants })
                      }}
                    />
                    <Label htmlFor={pollutant} className="cursor-pointer">{pollutant}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <Label>Contenido del Reporte</Label>
              {[
                { id: "includeMap", label: "Incluir mapas" },
                { id: "includeCharts", label: "Incluir gráficas" },
                { id: "includeRecommendations", label: "Incluir recomendaciones" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <Checkbox
                    id={id}
                    checked={(reportConfig as any)[id]}
                    onCheckedChange={(checked) => setReportConfig({ ...reportConfig, [id]: checked })}
                  />
                  <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>

            {/* Formato */}
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value) => setReportConfig({ ...reportConfig, format: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón principal */}
            <Button onClick={handleGenerate} className="w-full">
              <FileText className="mr-2 h-4 w-4" /> Generar Reporte
            </Button>
          </CardContent>
        </Card>

        {/* 📂 Reportes recientes y plantillas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
              <CardDescription>Historial de reportes generados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Reporte Mensual Enero", date: "2025-01-31", format: "PDF" },
                { title: "Análisis Semanal", date: "2025-01-24", format: "PDF" },
                { title: "Datos Exportados", date: "2025-01-20", format: "CSV" },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{report.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {report.date}
                      <Badge variant="outline" className="ml-2">{report.format}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Plantillas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">Reporte Estándar</Button>
              <Button variant="outline" className="w-full justify-start">Reporte para Autoridades</Button>
              <Button variant="outline" className="w-full justify-start">Reporte Educativo</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}