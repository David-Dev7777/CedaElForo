import Joi from 'joi'

// Esquema completo para crear o actualizar
export const schema_leyes = Joi.object({
  id: Joi.number().integer().positive().required(),
  id_externo: Joi.string().max(500).required(),
  titulo: Joi.string().max(100).required(),
  contenido: Joi.string().max(255).required(),
  categoria_id: Joi.string().max(100).required(),
  numero_ley: Joi.string().max(100).required(),
  fecha_publicacion: Joi.date().iso().required(),
  url_oficial: Joi.string().max(500).required(),
  activa: Joi.boolean().required()
})

// Esquema para actualizar (sin ID en el body)export const update_leyes = schema_leyes.fork(['id'], (field) => field.forbidden())


// Validación de ID en params
export const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
})

// Saneamiento básico
export const sanitizarLeyes = (input = {}) => ({
  id: input.id?.trim() || '',
  id_externo: input.id_externo?.trim() || '',
  titulo: input.titulo?.trim() || '',
  contenido: input.contenido?.trim() || '',
   categoria_id: input.categoria_id?.trim() || '',
   numero_ley: input.numero_ley?.trim() || '',
   fecha_publicacion: input.fecha_publicacion ? new Date(input.fecha_publicacion) : new Date(),
   url_oficial: input.url_oficial?.trim() || '',
  activa: Boolean(input.editable)
})

