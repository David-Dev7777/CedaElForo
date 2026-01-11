import { useEffect, useRef } from 'react'


export default function Chatbot() {
  const mountedRef = useRef(false)
  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  const WEBHOOK = `${API}/api/chat-proxy`


  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true


    // Cargar CSS solo una vez
    const styleHref = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css'
    if (!document.querySelector(`link[href="${styleHref}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = styleHref
      document.head.appendChild(link)
    }


    // Cargar chat widget
    ;(async () => {
      const mod = await import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js')
      const createChat = mod.createChat || mod.default?.createChat


      if (typeof createChat === 'function') {
        createChat({
          webhookUrl: WEBHOOK,


          // 🇨🇱 Español + contexto legal
          chatTitle: 'Asistente Legal de Tránsito',
          chatSubtitle: 'Leyes de Tránsito Chilenas',
          inputPlaceholder: 'Escribe tu consulta sobre multas, infracciones o normativa…',


          initialMessages: [
            '👋 Hola, soy el asistente legal de Ceda el Foro.',
            'Puedo ayudarte con dudas sobre la Ley de Tránsito chilena, multas, licencias y procedimientos.'
          ]
        })
      } else {
        console.error('createChat no disponible')
      }
    })()
  }, [])


  return null // 👈 NO renderiza nada visual
}
