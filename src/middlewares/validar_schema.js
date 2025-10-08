import Joi from 'joi'

export const validarCuerpo = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    })

    if (error) {
      return res.status(400).json({
        mensaje: 'Error de validación',
        errores: error.details.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message
        }))
      })
    }

    req.body = value // datos ya sanitizados
    next()
  }
}

export const validarParametros = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      convert: true
    })

    if (error) {
      return res.status(400).json({
        mensaje: 'Parámetros inválidos',
        errores: error.details.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message
        }))
      })
    }

    req.params = value
    next()
  }

  
}