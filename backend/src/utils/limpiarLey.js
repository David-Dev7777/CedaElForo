import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function limpiarTexto(texto) {
  if (!texto || typeof texto !== 'string') return texto
  return texto
    .split('\n')
    .map(linea => {
      if (/^\s*(LEY\s+N[°º][\d.]+|D\.O\.\s+\d|Art\.\s*\d+[°º]?\s*N[°º]?|Art\.\s*\d+[°º]?\s*$)/.test(linea.trim())) return ''
      if (/^\s*$/.test(linea)) return ''
      return linea
        .replace(/LEY\s+N[°º][\d.]+\s*/gi, '')
        .replace(/D\.O\.\s+\d{2}\.\d{2}\.\d{4}\.?\s*/gi, '')
        .replace(/Art\.\s*\d+[°º]?\s*N[°º]?\s*\d+\s*[a-z]?\)?\s*/gi, '')
        .replace(/Art\.\s*\d+[°º]?\s*/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
    })
    .filter(l => l.length > 0)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function limpiarObjeto(obj) {
  if (!obj) return obj
  if (typeof obj === 'string') return limpiarTexto(obj)
  if (Array.isArray(obj)) return obj.map(limpiarObjeto)
  if (typeof obj === 'object') {
    const nuevo = {}
    for (const key of Object.keys(obj)) {
      nuevo[key] = limpiarObjeto(obj[key])
    }
    return nuevo
  }
  return obj
}

const leyRaw = JSON.parse(readFileSync(join(__dirname, '../data/ley18290.json'), 'utf-8'))
const leyLimpia = limpiarObjeto(leyRaw)
writeFileSync(join(__dirname, '../data/ley18290_limpia.json'), JSON.stringify(leyLimpia, null, 2))
console.log('✅ Ley limpiada y guardada en ley18290_limpia.json')