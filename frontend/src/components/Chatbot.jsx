/*import { useEffect, useRef } from 'react'

export default function Chatbot() {
  const mountedRef = useRef(false)
  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  const WEBHOOK = `${API}/chat-proxy`

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    // Cargar CSS local
    const styleHref = '/n8n-chat.css'
    if (!document.querySelector(`link[href="${styleHref}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = styleHref
      document.head.appendChild(link)
    }

    // Cargar JS local via script tag
    const script = document.createElement('script')
script.type = 'module'
script.textContent = `
  import { createChat } from '/n8n-chat.js'
  createChat({
    webhookUrl: '${WEBHOOK}',
    chatTitle: 'Asistente Legal de Tránsito',
    chatSubtitle: 'Leyes de Tránsito Chilenas',
    inputPlaceholder: 'Escribe tu consulta sobre multas, infracciones o normativa…',
    initialMessages: [
      '👋 Hola, soy el asistente legal de Ceda el Foro.',
      'Puedo ayudarte con dudas sobre la Ley de Tránsito chilena, multas, licencias y procedimientos.'
    ]
  })
`
document.head.appendChild(script)

  }, [])

  return null
}*/

export default function Chatbot() {
  return null
}