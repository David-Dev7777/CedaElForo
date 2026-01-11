import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form nuevo usuario
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', tipo_usuario: 'ciudadano', activo: true })
  const [editId, setEditId] = useState(null)

  const fetchUsuarios = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/usuarios`, { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setUsuarios(data)
    } catch (err) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsuarios() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const crear = async (e) => {
    e.preventDefault()
    setError(null)
    // Validaciones cliente: similar a Registro
    const emailRegex = /^\S+@\S+\.\S+$/
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (!form.nombre || !form.apellido || !form.email || (!editId && !form.password)) {
      setError('Completa todos los campos requeridos')
      return
    }
    if (!emailRegex.test(form.email)) {
      setError('El correo ingresado no tiene formato válido')
      return
    }
    if (!editId) {
      // Crear usuario: validar contraseña obligatoria
      if (!pwdRegex.test(form.password)) {
        setError('La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial')
        return
      }
    } else {
      // Editar: si envía contraseña, validar su formato
      if (form.password && !pwdRegex.test(form.password)) {
        setError('La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial')
        return
      }
    }
    try {
      if (editId) {
        // Actualizar
        const payload = {
          email: form.email,
          password: form.password || undefined, // si está vacío, backend mantendrá la contraseña
          nombre: form.nombre,
          apellido: form.apellido,
          tipo_usuario: form.tipo_usuario,
          activo: form.activo === true || form.activo === 'true'
        }
        const res = await fetch(`${API}/api/usuarios/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || `HTTP ${res.status}`)
        }
        await fetchUsuarios()
        setEditId(null)
        setForm({ nombre: '', apellido: '', email: '', password: '', tipo_usuario: 'ciudadano', activo: true })
        return
      }

      // Crear nuevo
      const payload = {
        email: form.email,
        password_hash: form.password, // crearUsuario espera password_hash y lo va a hashear internamente
        nombre: form.nombre,
        apellido: form.apellido,
        tipo_usuario: form.tipo_usuario,
        activo: form.activo === true || form.activo === 'true'
      }
      const res = await fetch(`${API}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      await fetchUsuarios()
      setForm({ nombre: '', apellido: '', email: '', password: '', tipo_usuario: 'ciudadano', activo: true })
    } catch (err) {
      setError(err.message || 'Error creando usuario')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar usuario?')) return
    try {
      const res = await fetch(`${API}/api/usuarios/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await fetchUsuarios()
    } catch (err) {
      setError(err.message || 'Error eliminando')
    }
  }

  const desbloquear = async (id) => {
    if (!confirm('¿Desbloquear usuario?')) return
    try {
      const res = await fetch(`${API}/api/usuarios/${id}/unlock`, { method: 'POST', credentials: 'include' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      await fetchUsuarios()
    } catch (err) {
      setError(err.message || 'Error desbloqueando')
    }
  }

  const editar = (u) => {
    setEditId(u.id)
    setForm({ nombre: u.nombre || '', apellido: u.apellido || '', email: u.email || '', password: '', tipo_usuario: u.tipo_usuario || 'ciudadano', activo: !!u.activo })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administración de Usuarios</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="mb-6">
        <form onSubmit={crear} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="p-2 border" />
          <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} className="p-2 border" />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="p-2 border" />
          <input name="password" type="password" placeholder="Nueva contraseña (dejar vacío para mantener)" value={form.password} onChange={handleChange} className="p-2 border" />
          <select name="tipo_usuario" value={form.tipo_usuario} onChange={handleChange} className="p-2 border">
            <option value="ciudadano">Ciudadano</option>
            <option value="administrador">Administrador</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="text-sm">Activo</label>
            <input type="checkbox" checked={form.activo} onChange={(e)=> setForm({...form, activo: e.target.checked})} />
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">{editId ? 'Guardar cambios' : 'Crear usuario'}</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Usuarios</h2>
        {loading ? (
          <div>Cargando...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Tipo</th>
                <th className="border p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="border p-2">{u.id}</td>
                  <td className="border p-2">{u.nombre} {u.apellido}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.tipo_usuario}</td>
                  <td className="border p-2">{u.activo === false ? (<span className="text-red-600">Bloqueado</span>) : (<span className="text-green-600">Activo</span>)}</td>
                  <td className="border p-2">
                    <button className="mr-2 text-sm text-blue-600" onClick={()=> editar(u)}>Editar</button>
                    <button className="mr-2 text-sm text-red-600" onClick={()=> eliminar(u.id)}>Eliminar</button>
                    {!u.activo && (
                      <button className="ml-2 text-sm text-green-600" onClick={()=> desbloquear(u.id)}>Desbloquear</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
