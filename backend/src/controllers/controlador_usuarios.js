import{pool} from '../config.js'
import bcrypt from 'bcryptjs'
import Joi from 'joi'
import { modelo_usuario } from '../models/schema_usuario.js'

export const getUsuarios = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT 
      id,
      email,
      nombre,
      apellido,
      tipo_usuario,
      fecha_registro,
      activo
    FROM usuarios
  `)

  res.json(rows)
}

 export const getUsuario_id = async(req, res) => {
    const { rows } = await pool.query(
    `SELECT 
        id,
        email,
        nombre,
        apellido,
        tipo_usuario,
        fecha_registro,
        activo,
        ultimo_login
    FROM usuarios
    WHERE id = $1`,
    [id]
    )
     if(rows.length === 0){
        return res.status(404).json({message: 'usuario no encontrado '})

    }
    res.json(rows)
}

export const crearUsuario = async(req,res) =>{
    // Validar cuerpo
    const {error, value} = modelo_usuario.validate(req.body, {abortEarly: false});
    if (error) {
        return res.status(400).json({
            message: 'Error de validación',
            details: error.details.map((detail) => detail.message),
        });
    }

    const {email, password_hash, nombre, apellido, tipo_usuario, activo} = value;

    try {
        const password_encriptada = await bcrypt.hash(password_hash, 12);
        const {rows} = await pool.query(
            'INSERT INTO usuarios ( email, password_hash, nombre, apellido, tipo_usuario, activo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
            [email, password_encriptada, nombre, apellido, tipo_usuario, activo]
        );

        return res.status(201).json({
            message: 'usuario creado exitosamente',
            usuario: rows[0]
        });
    } catch (err) {
        // Loguear el error completo para depuración
        console.error('Error en crearUsuario:', err && err.stack ? err.stack : err);

        // Detectar errores comunes de Postgres (por ejemplo, violación de constraint UNIQUE)
        if (err && err.code === '23505') {
            return res.status(409).json({ message: 'El correo ya está registrado.' });
        }

        return res.status(500).json({ message: 'Error interno al crear usuario.' });
    }
}

export const eliminarUsuario = async(req, res) => {
    const {id} = req.params
  const {rowCount} = await pool.query(`DELETE FROM usuarios WHERE id = ${id} RETURNING *`)// returning es una sintaxis de node
                                                                                                // que nos devuelve le objecto eliminado

  if(rowCount.length === 0){
    return res.status(404).json({message:'usuario no encontrado'})
  }

  return res.sendStatus(204)//codigo de operacion exitosa
}

export const actualizarUsuario = async(req,res) =>{
    const{id} = req.params // extreamos el id
    const data = req.body

    try {
        // Validación parcial: si se envían campos deben cumplir formato
        const partialSchema = Joi.object({
            email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim(),
            password: Joi.string().min(8).max(100).pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/),
            nombre: Joi.string().trim().replace(/\s+/g, ' ').min(2).max(50),
            apellido: Joi.string().trim().replace(/\s+/g, ' ').min(2).max(50),
            tipo_usuario: Joi.string().valid('administrador', 'ciudadano'),
            activo: Joi.boolean()
        })
        const { error: partialError } = partialSchema.validate(data, { allowUnknown: true, abortEarly: false })
        if (partialError) {
            return res.status(400).json({ message: 'Error de validación', details: partialError.details.map(d => d.message) })
        }
        // Obtener usuario existente
        const existRes = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id])
        if (existRes.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' })
        const existing = existRes.rows[0]

        // Si el cliente envía `password` (texto plano), hashéalo; si envía `password_hash`, úsalo tal cual.
        let passwordHash = data.password_hash || existing.password_hash
        if (data.password) {
            // Validación de contraseña: mismo patrón que en el frontend (Registro)
            const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
            if (!pwdRegex.test(data.password)) {
                return res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres, incluir letras, números y un carácter especial' })
            }
            passwordHash = await bcrypt.hash(data.password, 12)
        }

        const { rows } = await pool.query(
            'UPDATE usuarios SET email=$2, password_hash=$3, nombre=$4, apellido=$5, tipo_usuario=$6, activo=$7 WHERE id=$1 RETURNING *',
            [id, data.email || existing.email, passwordHash, data.nombre || existing.nombre, data.apellido || existing.apellido, data.tipo_usuario || existing.tipo_usuario, typeof data.activo === 'undefined' ? existing.activo : data.activo]
        )

        return res.json({ message: 'usuario actualizado', usuario: rows[0] })
    } catch (err) {
        console.error('Error en actualizarUsuario:', err)
        return res.status(500).json({ message: 'Error interno al actualizar usuario.' })
    }
    

}