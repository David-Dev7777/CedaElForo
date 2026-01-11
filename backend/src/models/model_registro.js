export const modelRegistro = Joi.object({
nombre: Joi.string().trim().replace(/\s+/g, ' ') .min(2).max(50).required(),
apellido: Joi.string().trim().replace(/\s+/g, ' ').min(2).max(50).required(),
email: Joi.string().email({ tlds: { allow: false } }) .lowercase().trim().required(),
password_hash: Joi.string().trim().min(8).max(100).required(),
})