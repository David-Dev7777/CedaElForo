import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
        await axios.get(`${API}/me`, { withCredentials: true })
        if (!mounted) return
        setAuthenticated(true)
      } catch (err) {
        if (mounted) setAuthenticated(false)
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