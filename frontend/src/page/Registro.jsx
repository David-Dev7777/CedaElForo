
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'




function Registro() {
  const [form, setForm] = useState({
    userName: '',
    apellido: '',
    email: '',
    password: '',
    password2: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  const validar = () => {
    if (!form.userName || !form.apellido || !form.email || !form.password || !form.password2) {
      setError('Completa todos los campos')
      return false
    }


    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!pwdRegex.test(form.password)) {
      setError(
        'La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial'
      )
      return false
    }


    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden')
      return false
    }


    return true
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!validar()) return


    setLoading(true)
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const res = await fetch(`${API}/api/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: form.userName,
          apellido: form.apellido,
          email: form.email,
          password: form.password
        })
      })


      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.message || 'Error al registrar')
        return
      }


      navigate('/login')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }


  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'


  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-10">


        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Crear cuenta
        </h1>


        {error && (
          <div
            className="mb-4 rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-2 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">


          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre
            </label>
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Apellido
            </label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              className={inputClass}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirmar contraseña
            </label>
            <input
              name="password2"
              type="password"
              autoComplete="new-password"
              value={form.password2}
              onChange={handleChange}
              className={inputClass}
            />
          </div>


          <Button
            text={loading ? 'Registrando...' : 'Registrarme'}
            className="w-full mt-2"
          />
        </form>
      </div>

   

        {/* Pie del formulario: link a login y ayuda */}
        <div className="w-full max-w-2xl mt-4 text-center text-sm text-gray-600">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión aquí</Link>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial.
          </p>
        </div>
      </div>
  )
}


export default Registro