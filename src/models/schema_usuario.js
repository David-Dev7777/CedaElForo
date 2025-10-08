import Joi from 'joi'

// Esquema completo para crear o actualizar
export const schema_usuario = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }) .lowercase().trim().required(),
  password_hash: Joi.string().trim().min(8).max(100).required(),
  nombre: Joi.string().trim().replace(/\s+/g, ' ') .min(2).max(50).required(),
  apellido: Joi.string().trim().replace(/\s+/g, ' ').min(2).max(50).required(),
  tipo_usuario: Joi.string().valid('administrador', 'ciudadano').required(),
  fecha_registro: Joi.date().iso().required(),
  activo: Joi.boolean().required()
})








