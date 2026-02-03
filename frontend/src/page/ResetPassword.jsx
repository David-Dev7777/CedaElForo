import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword(){
  const [searchParams] = useSearchParams()
  const emailFromQuery = searchParams.get('email') || ''
  const [email, setEmail] = useState(emailFromQuery)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery)
  }, [emailFromQuery])

  const validarPassword = (pwd) => {
    // Mismo regex que en Registro: mínimo 8, letras, números y carácter especial
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    return pwdRegex.test(pwd)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email) return setError('Falta el correo para identificar la cuenta')
    if (!password || !validarPassword(password)) return setError('La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial')
    if (password !== password2) return setError('Las contraseñas no coinciden')

    try {
      const res = await axios.post('http://localhost:4000/api/reset-password', { email, password })
      if (res.data && res.data.ok) {
        setMessage('Contraseña actualizada correctamente. Redirigiendo a iniciar sesión...')
        setTimeout(() => navigate('/login', { state: { resetSuccess: true } }), 1200)
      } else {
        setMessage(res.data?.message || 'Respuesta recibida.')
      }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.error || 'Error al actualizar contraseña')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Restablecer contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input id='correo' value={email} readOnly className="w-full px-3 py-2 border rounded bg-gray-100" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input id='password' type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Nueva contraseña" />
          </div>

          <div>
            <label htmlFor="conformarcontrasena" className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input id='conformarcontrasena' type="password" autoComplete="new-password" value={password2} onChange={e => setPassword2(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Repite la contraseña" />
          </div>

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Actualizar</button>
            <Link to="/login" className="px-4 py-2 border rounded text-sm">Volver</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
