import { NextApiRequest, NextApiResponse } from "next"
import OpenAI from "openai"

const client = new OpenAI({
    apiKey: "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",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" })

  const { weather, air_quality }: { weather: any; air_quality: { city: string }[] } = req.body

  const summaryPrompt = `
  Genera un reporte meteorológico y de calidad del aire con base en los siguientes datos:
  - Temperatura: ${weather.temperature}°C
  - Humedad: ${weather.humidity}%
  - Viento: ${weather.wind_speed} km/h
  - Presión: ${weather.pressure} hPa
  - Precipitación: ${weather.precipitation} mm
  - Índice UV: ${weather.uv_index}
  - Principales ciudades: ${air_quality?.slice(0, 3).map((a) => a.city).join(", ")}

  El reporte debe:
  - Ser en tono informativo y claro.
  - Indicar riesgos para la salud si la calidad del aire es mala.
  - Incluir una pequeña recomendación práctica.
  - Escribirlo en español, en párrafos cortos.
  `

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: summaryPrompt }],
  })

  const text = completion.choices[0].message.content
  return res.status(200).json({ text })
}
