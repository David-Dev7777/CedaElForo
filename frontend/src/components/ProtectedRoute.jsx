import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'


export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)


  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        const res = await fetch(`${API}/api/me`, { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          setAuthenticated(true)
        } else {
          setAuthenticated(false)
        }
      } catch (err) {
        setAuthenticated(false)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])


  if (loading) return <div>Comprobando sesión...</div>
  if (!authenticated) return <Navigate to="/login" replace />
  return children
}
