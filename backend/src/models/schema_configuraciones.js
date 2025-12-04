import Joi from 'joi'

// Esquema completo para crear o actualizar
export const configSchema1 = Joi.object({
  clave: Joi.string().max(100).required(),
  valor: Joi.string().max(255).required(),
  tipo: Joi.string().valid('texto', 'numero', 'booleano').required(),
  descripcion: Joi.string().allow('').max(500),
  editable: Joi.boolean().required()
})

// Esquema para actualizar (sin ID en el body)
//export const configUpdateSchema = configSchema1.fork(['id'], (field) => field.forbidden())
//export const configCreateSchema = configSchema1.fork(['id'], (field) => field.forbidden())

// Validación de ID en params
export const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
})

// Saneamiento básico
export const sanitizarConfig = (input = {}) => ({
  clave: input.clave?.trim() || '',
  valor: input.valor?.trim() || '',
  tipo: input.tipo?.toLowerCase() || '',
  descripcion: input.descripcion?.trim() || '',
  editable: Boolean(input.editable)
})