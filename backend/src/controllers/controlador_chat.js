import Groq from 'groq-sdk'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { decodeJsonStrings } from '../utils/decodeJsonStrings.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function extraerTexto(obj, texto = []) {
  if (!obj) return texto
  if (typeof obj === 'string') {
    if (obj.trim()) texto.push(obj.trim())
    return texto
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (['Texto', 'TituloParte', 'NombreParte', 'TituloNorma'].includes(key)) {
        const val = obj[key]
        if (typeof val === 'string') texto.push(val.trim())
        else if (val?.['#text']) texto.push(String(val['#text']).trim())
      }
      extraerTexto(obj[key], texto)
    }
  }
  return texto
}

// Cargar la ley desde archivo local una sola vez
const leyJson = JSON.parse(readFileSync(join(__dirname, '../data/ley18290.json'), 'utf-8'))
const leyTexto = extraerTexto(leyJson).join('\n')

export const chatProxy = async (req, res) => {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages es requerido y debe ser un array' })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente legal especializado en la Ley de Tránsito chilena N°18.290.
Responde SOLO en base al siguiente texto de la ley. Si la respuesta no está en la ley, dilo claramente.
Responde siempre en español. No inventes información.

TEXTO DE LA LEY:
${leyTexto.substring(0, 6000)}`
        },
        ...messages
      ],
      max_tokens: 1024,
      temperature: 0.3
    })

    res.json({ reply: completion.choices[0].message.content })
  } catch (err) {
    console.error('Error chat-proxy:', err.message)
    res.status(500).json({ error: 'Error al procesar la consulta' })
  }
}