import { Router } from 'express'
import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import he from 'he'; 

import {registro} from '../controllers/controlador_registro.js'
import{getCategoriasForo, getCategoriasForo_id, crearCategoriasForo, eliminarCategoriasForo, actualizarCategoriasForo} from '../controllers/controlador_categoriasForo.js'  
import{getUsuario_id, getUsuarios, crearUsuario, eliminarUsuario, actualizarUsuario} from '../controllers/controlador_usuarios.js'
import{getComentarios, getComentarios_id, crearComentarios, actualizarComentarios, eliminarComentarios} from '../controllers/controlador_comentarios.js'
import{getReacciones, getReacciones_id, crearReacciones, actualizarReacciones, eliminarReacciones} from '../controllers/controlador_reacciones.js'
import{getPublicacionesForo, getPublicacionesForos_id, crearPublicacionesForo, actualizarPublicacionesForo, eliminarPublicacionesForo} from '../controllers/controlador_publicacionesForo.js'
import{validarCuerpo} from '../middlewares/validar_schema.js'
import { modelo_usuario } from '../models/schema_usuario.js'


import{authenticateUser, updateLastLogin} from '../models/authModel.js'
//import{requireAuth} from '../middlewares/Aut_jwt.js'
import jwt from 'jsonwebtoken';
import { JWT_SECRET, pool } from '../config.js';
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import session from 'express-session';


const router = Router()

// Middleware para autorizar solo administradores
export const adminOnly = (req, res, next) => {
  try {
    const user = req.user || req.session?.user
    if (user && user.tipo_usuario === 'administrador') return next()
    return res.status(403).json({ error: 'Acceso restringido: se requieren privilegios de administrador' })
  } catch (err) {
    console.error('Error en adminOnly:', err)
    return res.status(500).json({ error: 'Error del servidor' })
  }
}



// Middleware para verificar autenticación
// Prioriza token JWT en cookie; si no existe, usa req.session.user
export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload; // ← Asegura que req.user esté disponible
      req.session.user = req.session.user || {};
      req.session.user.id = payload.id;
      req.session.user.email = payload.email;
      req.session.user.nombre = payload.nombre;
      req.session.user.apellido = payload.apellido;
      req.session.user.tipo_usuario = payload.tipo_usuario;
      return next();
    }
  } catch (err) {
    console.log('Token JWT inválido o expirado:', err.message);
  }

  if (req.session.user) {
    req.user = req.session.user; // ← También aquí
    return next();
  }

  res.redirect('/login');
};

// Ruta raíz - redirige al login
router.get('/', (req, res) => {
  res.redirect('/login');
});

const sanitize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};

// Ruta de login - CON PROTECCIÓN
router.get('/login', (req, res) => {
  // Verificar si req.session existe antes de acceder a sus propiedades
  if (req.session && req.session.user) {
    return res.redirect('/home');
  }
  res.render('login', { error: null });
});

// Procesar login CON BASE DE DATOS
router.post('/login', async (req, res) => {
     const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

  try {
    console.log('Intento de login:', email);
    
    // Validar credenciales en la base de datos
    const user = await authenticateUser(email, password);

    if (user && user.blocked) {
      console.log('Acceso denegado: usuario bloqueado', email);
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos, excediste el maximo permitido' });
    }

    if (user) {
      // Actualizar último login
      await updateLastLogin(user.id);

      // Guardar información del usuario en sesión
      req.session.user = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario
      };

      // Generar JWT con datos esenciales
      const token = jwt.sign({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario
      }, JWT_SECRET, { expiresIn: '8h' });

      // Enviar JWT en cookie httpOnly
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // cambiar a true en producción con HTTPS
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000 // 8 horas
      });

      console.log('Login exitoso para:', user.email);
      //return res.redirect('/principal');
      // Devolver datos del usuario (sin password) para que el frontend pueda almacenarlos si lo requiere
      return res.status(200).json({ message: 'Login exitoso', user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        tipo_usuario: user.tipo_usuario
      } })
    }
    
  // Credenciales incorrectas
  console.log('Login fallido para:', email);
 return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.render('login', { error: 'Error del sistema. Intente más tarde.' });
  }
});


// Ruta principal después del login



// Cerrar sesión
router.get('/logout', (req, res) => {
  // Limpiar cookie JWT además de destruir la sesión
  res.clearCookie('token');
  req.session.destroy((err) => {
    if (err) {
      console.log('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
});

// POST logout para llamadas fetch desde frontend (devuelve JSON y no redirige)
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('token');
    req.session.destroy((err) => {
      if (err) {
        console.log('Error al destruir sesión en POST /logout:', err);
      }
      return res.json({ ok: true });
    });
  } catch (err) {
    console.error('Error en POST /logout:', err);
    return res.status(500).json({ error: 'Error cerrando sesión' });
  }
});
// Rutas de gestión de usuarios: solo accesibles por administradores
router.get('/usuarios', requireAuth, adminOnly, getUsuarios )
router.get('/usuarios/:id', requireAuth, adminOnly, getUsuario_id)
router.delete('/usuarios/:id', requireAuth, adminOnly, eliminarUsuario)
router.post('/usuarios', requireAuth, adminOnly, validarCuerpo(modelo_usuario), crearUsuario)
// Para actualizar permitimos campos parciales desde el frontend; validación completa se aplica en creación.
router.put('/usuarios/:id', requireAuth, adminOnly, actualizarUsuario)

// Ruta para que un admin desbloquee un usuario (resetea failed_attempts y pone activo=true)
router.post('/usuarios/:id/unlock', requireAuth, adminOnly, async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      'UPDATE usuarios SET failed_attempts = 0, activo = true WHERE id = $1 RETURNING *',
      [id]
    )
    const usuarios = rows[0]
    if (usuarios) {
      return res.json({ ok: true, usuario: rows[0] })
    }
  } catch (err) {
    // Manejar específicamente el error de columna inexistente
    if (err.code === '42703') { // PostgreSQL: undefined_column
      await pool.query('UPDATE usuarios SET activo = true WHERE id = $1', [id])
      const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id])
      return res.json({ ok: true, usuario: rows[0] })
    }
    // Otros errores se propagan al catch externo
    throw err
  }

  return res.status(404).json({ error: 'Usuario no encontrado' })
})
// Endpoint: solicitar token de reseteo de contraseña
router.post('/forgot-password', async (req, res) => {
  const email = sanitize(req.body.email)
  if (!email) return res.status(400).json({ error: 'Email requerido' })
  try {
    // Asegurarse de que las columnas existen (seguro y idempotente)
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token TEXT`)
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP`)

    // Buscar usuario ignorando mayúsculas/minúsculas
    const { rows } = await pool.query('SELECT id, email FROM usuarios WHERE LOWER(email) = LOWER($1)', [email])
    console.log('forgot-password: buscado email=', email, ' rows=', rows?.length)
    if (!rows || !rows[0]) {
      // Si no existe, devolver error para que el frontend lo muestre
      return res.status(400).json({ error: 'Correo no registrado' })
    }

    const user = rows[0]
    const token = crypto.randomBytes(20).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await pool.query('UPDATE usuarios SET reset_token = $1, reset_expires = $2 WHERE id = $3', [token, expires, user.id])

  // En producción: enviar token por correo. No devolver el token en la respuesta por seguridad.
  // Aquí devolvemos ok y el email para que el frontend pueda avanzar al formulario de nueva contraseña.
  return res.json({ ok: true, message: 'Procede a ingresar la nueva contraseña.', email: user.email })
  } catch (err) {
    console.error('Error en forgot-password:', err)
    return res.status(500).json({ error: 'Error al generar token' })
  }
})

// Endpoint: aplicar nuevo password usando token temporal
router.post('/reset-password', async (req, res) => {
  const token = sanitize(req.body.token)
  const email = sanitize(req.body.email)
  const password = sanitize(req.body.password)
  if ((!token && !email) || !password) return res.status(400).json({ error: 'Token/email y nueva contraseña son requeridos' })
  try {
    // Asegurar columnas
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token TEXT`)
    await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP`)

    let user
    if (token) {
      const { rows } = await pool.query('SELECT id, reset_expires FROM usuarios WHERE reset_token = $1', [token])
      if (!rows || !rows[0]) return res.status(400).json({ error: 'Token inválido o expirado' })
      user = rows[0]
      if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
        return res.status(400).json({ error: 'Token inválido o expirado' })
      }
    } else {
      // Se permite resetear por email si previamente se solicitó restablecer y existe reset_token válido
      const { rows } = await pool.query('SELECT id, reset_expires, reset_token FROM usuarios WHERE LOWER(email) = LOWER($1)', [email])
      if (!rows || !rows[0] || !rows[0].reset_token) return res.status(400).json({ error: 'Solicitud de restablecimiento no encontrada para este correo' })
      user = rows[0]
      if (!user.reset_expires || new Date(user.reset_expires) < new Date()) {
        return res.status(400).json({ error: 'Token inválido o expirado' })
      }
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE usuarios SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2', [hash, user.id])

    return res.json({ ok: true, message: 'Contraseña actualizada' })
  } catch (err) {
    console.error('Error en reset-password:', err)
    return res.status(500).json({ error: 'Error al actualizar contraseña' })
  }
})



router.get('/comentarios', getComentarios)
router.get('/comentarios/:id', getComentarios_id)
router.post('/comentarios', crearComentarios)
router.put('/comentarios/:id', actualizarComentarios)
router.delete('/comentarios/:id', eliminarComentarios)


router.get('/reacciones', getReacciones)
router.get('/reacciones/:id', getReacciones_id)
router.post('/reacciones', crearReacciones)
router.put('/reacciones/:id', actualizarReacciones)
router.delete('/reacciones/:id', eliminarReacciones)


router.get('/publicacionesForo', getPublicacionesForo)
router.get('/publicacionesForo/:id', getPublicacionesForos_id)
router.post('/publicacionesForo', crearPublicacionesForo)
router.put('/publicacionesForo/:id', actualizarPublicacionesForo)
router.delete('/publicacionesForo/:id', eliminarPublicacionesForo)

router.get('/categoriasForo', getCategoriasForo)
router.get('/categoriasForo/:id', getCategoriasForo_id)
router.post('/categoriasForo', crearCategoriasForo)
router.put('/categoriasForo/:id', actualizarCategoriasForo)
router.delete('/categoriasForo/:id', eliminarCategoriasForo)

router.post('/registro', registro)

// Función de decodificación recursiva
function decodeJsonStrings(obj) {
    if (typeof obj !== 'object' || obj === null) {
        // Si no es un objeto (ni un array) o es null, devuelve el valor.
        // Si es una cadena, la decodifica.
        return typeof obj === 'string' ? he.decode(obj) : obj;
    }

    if (Array.isArray(obj)) {
        // Si es un array, recorre cada elemento.
        return obj.map(item => decodeJsonStrings(item));
    }

    // Si es un objeto, recorre todas sus claves.
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = decodeJsonStrings(obj[key]);
        }
    }
    return newObj;
}


router.get('/ley-transito', async (req, res) => {
    try {
        const url = 'https://www.leychile.cl/Consulta/obtxml?opt=7&idNorma=1007469';
        
        // 1. Consumir la API (XML)
        const response = await axios.get(url);
        const xmlData = response.data;

        // 2. Convertir XML a JSON
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_" 
        });
        const jsonData = parser.parse(xmlData);

        // 3. ✨ NUEVO PASO: Decodificar todas las cadenas de texto en el JSON
        const cleanJsonData = decodeJsonStrings(jsonData.Norma);

        // 4. Responder al frontend con JSON limpio
        res.json(cleanJsonData);

    } catch (error) {
        console.error('Error al obtener la ley:', error);
        res.status(500).json({ error: 'Error al obtener la información de la BCN' });
    }
});


// Proxy para evitar CORS al llamar al webhook de n8n desde el frontend
router.post('/chat-proxy', async (req, res) => {
  try {
    const webhook = process.env.N8N_WEBHOOK_URL || 'https://tattooshop.app.n8n.cloud/webhook/3b600698-67d3-403f-9cd5-4b33b95c73e7/chat'
    const response = await axios.post(webhook, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    })

    // Reenviamos la respuesta del webhook al frontend
    return res.status(response.status).json(response.data)
  } catch (err) {
    console.error('Error proxying chat webhook:', err?.message || err)
    if (err.response) {
      // El webhook respondió con un error
      return res.status(err.response.status).json(err.response.data)
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout contacting webhook' })
    }
    return res.status(502).json({ error: 'Error forwarding request to webhook' })
  }
})


// Ruta para obtener el usuario actual (verifica JWT o sesión)
router.get('/me', (req, res) => {
  try {
    // Prioriza token JWT en cookie
    const token = req.cookies?.token
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET)
        return res.json({ user: payload })
      } catch (e) {
        console.log('JWT inválido en /me:', e.message)
        // Continuar para revisar sesión
      }
    }

    // Si hay sesión, devolverla
    if (req.session?.user) {
      return res.json({ user: req.session.user })
    }

    return res.status(401).json({ error: 'No autenticado' })
  } catch (error) {
    console.error('Error en /me:', error)
    return res.status(500).json({ error: 'Error del servidor' })
  }
})

// Ruta para que el frontend verifique el usuario actual (usa JWT en cookie o fallback a sesión)
router.get('/me', (req, res) => {
 try {
   const token = req.cookies?.token
   if (token) {
     const payload = jwt.verify(token, JWT_SECRET)
     return res.json({ user: payload })
   }


   if (req.session && req.session.user) {
     return res.json({ user: req.session.user })
   }


   return res.status(401).json({ error: 'No autenticado' })
 } catch (err) {
   console.error('Error en /me:', err.message || err)
   return res.status(401).json({ error: 'Token inválido o expirado' })
 }
})


export default router