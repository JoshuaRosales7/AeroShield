import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = body?.data

    // Si no hay datos válidos, devuelve un aviso (evita error 400)
    if (!data) {
      return NextResponse.json({
        report: "⚠️ No se recibieron datos del clima. Asegúrate de enviar un objeto 'data' con información meteorológica.",
      })
    }

    const prompt = `
Eres un asistente ambiental especializado en análisis climático y calidad del aire.
Con base en los datos recibidos, genera un reporte profesional, claro y estructurado.

Incluye:
- Estado actual del clima (temperatura, humedad, presión, viento, lluvia, UV, etc.)
- Análisis de la calidad del aire (niveles e interpretación)
- Posible evolución en las próximas 48 horas
- Recomendaciones breves para la población

Datos recibidos:
${JSON.stringify(data, null, 2)}
`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un experto en meteorología y calidad del aire." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const json = await response.json()

    if (!response.ok || json.error) {
      console.error("❌ Error OpenAI:", json.error)
      return NextResponse.json({ error: "Error al generar reporte", details: json.error }, { status: 500 })
    }

    const report = json.choices?.[0]?.message?.content || "No se pudo generar el reporte."
    return NextResponse.json({ report })
  } catch (error: any) {
    console.error("❌ Error interno en /api/openai-report:", error)
    return NextResponse.json({ error: "Error interno", details: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "✅ Endpoint /api/openai-report activo. Usa POST para generar reportes.",
  })
}
