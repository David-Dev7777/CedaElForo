import { pool } from '../config.js'
import bcrypt from 'bcryptjs'

export const registro = async (req, res) => {
  try {
    console.log('Datos recibidos (registro):', req.body);
    const { userName, apellido, email, password } = req.body;

    if (!userName || !apellido || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    // Verificar si el email ya está registrado
    const exists = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase().trim()])
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' })
    }

    // Hashear la contraseña
    const hashed = await bcrypt.hash(password, 12)

    // Insertar en la tabla usuarios
    const { rows } = await pool.query(
      'INSERT INTO usuarios (email, password_hash, nombre, apellido, tipo_usuario, activo) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, nombre, apellido, tipo_usuario, activo',
      [email.toLowerCase().trim(), hashed, userName.trim(), apellido.trim(), 'ciudadano', true]
    )

    const created = rows[0]

    return res.status(201).json({ message: 'Usuario registrado', user: created })
  } catch (err) {
    console.error('Error en registro:', err)
    return res.status(500).json({ error: 'Error interno al registrar usuario' })
  }
}
