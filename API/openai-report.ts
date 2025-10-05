import { NextApiRequest, NextApiResponse } from "next"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" })

  const { weather, air_quality } = req.body

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

  const completion = await client.responses.create({
    model: "gpt-4o-mini",
    input: summaryPrompt,
  })

  const text = completion.output[0].content[0].text
  return res.status(200).json({ text })
}
