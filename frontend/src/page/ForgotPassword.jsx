import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
  if (!email) return setError('Ingresa tu correo electrónico')

    try {
      const res = await axios.post('http://localhost:4000/api/forgot-password', { email })
      if (res.data && res.data.ok) {
        // avanzar al formulario de nueva contraseña
        navigate(`/reset-password?email=${encodeURIComponent(email)}`)
      } else {
        setMessage(res.data?.message || 'Si el correo existe, recibirás instrucciones para restablecer la contraseña.')
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.error || 'Error al solicitar restablecimiento')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Restablecer contraseña</h2>
        <p className="text-sm text-gray-600 mb-4">Ingresa el correo asociado a tu cuenta. </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input id='correo' type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="tu@ejemplo.com" required />
          </div>

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Solicitar</button>
            <Link to="/login" className="px-4 py-2 border rounded text-sm">Volver</Link>
          </div>
        </form>

        {/* No mostramos el token en UI; en producción el token se envía por correo */}

      </div>
    </div>
  )
}
