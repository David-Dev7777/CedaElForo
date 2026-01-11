import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        const res = await fetch(`${API}/api/me`, { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data.user && data.user.tipo_usuario === 'administrador') {
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(false)
        }
      } catch (err) {
        if (!mounted) return
        setIsAdmin(false)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) return <div>Comprobando permisos de administrador...</div>
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
