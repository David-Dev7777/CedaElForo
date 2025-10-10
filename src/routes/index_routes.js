import { Router } from 'express'

import{getUsuario_id, getUsuarios, crearUsuario, eliminarUsuario, actualizarUsuario} from '../controllers/controlador_usuarios.js'
import{ getLeyes1, getLey, crearLey, actualizarLey, eliminarley } from '../controllers/controlador_leyes.js'
import{getPerfil, getPerfiles, crearPerfil, eliminarPerfil, actualizarPerfil} from '../controllers/controlador_perfiles.js'
import{getConfig, getConfig_id, crearConfig, eliminarConfig, actualizarConfig} from '../controllers/controlador_configuraciones.js'
import{getLeyesFavoritas,getLeyesFavoritas_id,eliminarleyesFavoritas,crearLeyesFavoritas,actualizarLeyesFavoritas} from '../controllers/controlador_leyesFavotitas.js'
import{getCategoriasForo,getCategoriasForo_id,crearCategoriasForo,actualizarCategoriasForo,eliminarCategoriasForo} from '../controllers/controlador_categoriasForo.js'
import{getCategoriasLeyes,getCategoriasLeyes_id,crearCategoriasLeyes,actualizarCategoriasLeyes} from '../controllers/controlador_categoriasLeyes.js'
import{getComentarios, getComentarios_id, crearComentarios, actualizarComentarios, eliminarComentarios} from '../controllers/controlador_comentarios.js'
import{getConsultaHistorial, getConsultaHistorial_id, crearConsultaHistorial, actualizarConsultaHistorial, eliminarConsultaHistorial} from '../controllers/controlador_historialConsultas.js'
import{getReacciones, getReacciones_id, crearReacciones, actualizarReacciones, eliminarReacciones} from '../controllers/controlador_reacciones.js'
import{getModeraciones, getModeraciones_id, crearModeraciones, actualizarModeraciones, eliminarModeraciones} from '../controllers/controlador_moderaciones.js'
import{getPublicacionesForo, getPublicacionesForos_id, crearPublicacionesForo, actualizarPublicacionesForo, eliminarPublicacionesForo} from '../controllers/controlador_publicacionesForo.js'
import{validarCuerpo} from '../middlewares/validar_schema.js'
import { schema_usuario } from '../models/schema_usuario.js'
import{configSchema1} from '../models/schema_configuraciones.js'
import { schema_leyes } from '../models/schema_leyes.js'

import{authenticateUser, updateLastLogin, hashPassword} from '../models/authModel.js'
//import{requireAuth} from '../middlewares/Aut_jwt.js'
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import session from 'express-session'


const router = Router()



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
    return res.redirect('/principal');
  }
  res.render('login', { error: null });
});

// Procesar login CON BASE DE DATOS
router.post('/login', async (req, res) => {
     const username = sanitize(req.body.username);
    const password = sanitize(req.body.password);
  


  try {
    console.log('Intento de login:', username);
    
    // Validar credenciales en la base de datos
    const user = await authenticateUser(username, password);

    if (user && user.blocked) {
      console.log('Acceso denegado: usuario bloqueado', username);
      return res.render('login', { error: 'Cuenta bloqueada por intentos fallidos. Contacte al administrador.' });
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
      return res.redirect('/principal');
    }
    
  // Credenciales incorrectas
  console.log('Login fallido para:', username);
  res.render('login', { error: 'Usuario o contraseña incorrectos' });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.render('login', { error: 'Error del sistema. Intente más tarde.' });
  }
});


// Ruta principal después del login
router.get('/principal', requireAuth, (req, res) => {
  try {
    console.log('=== ACCEDIENDO A /principal ===');
    console.log('req.user:', req.user);
    console.log('req.session.user:', req.session.user);
    
    // Pasar el usuario a la vista - usa el que esté disponible
    const userData = req.user || req.session.user;
    
    if (!userData) {
      console.log('❌ No hay datos de usuario, redirigiendo a login');
      return res.redirect('/login');
    }
    
    console.log('✅ Renderizando principal con usuario:', userData.email);
    res.render('principal', { 
      user: userData  // Pasa el objeto completo del usuario
    });
    
  } catch (error) {
    console.error('Error en ruta /principal:', error);
    res.redirect('/login');
  }
});


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
router.get('/usuarios', getUsuarios )
router.get('/usuarios/:id', getUsuario_id)
router.delete('/usuarios/:id', eliminarUsuario)
router.post('/usuarios',validarCuerpo(schema_usuario),crearUsuario)
router.put('/usuarios/:id',validarCuerpo(schema_usuario),actualizarUsuario)

router.get("/leyesFavoritas",getLeyesFavoritas)
router.get("/leyesFavoritas/:id",getLeyesFavoritas_id)
router.post("/leyesFavoritas",crearLeyesFavoritas)
router.put("/leyesFavoritas/:id",actualizarLeyesFavoritas)
router.delete("/leyesFavoritas/:id",eliminarleyesFavoritas)

router.get('/leyes', getLeyes1)
router.get('/leyes/:id', getLey)
router.post('/leyes',validarCuerpo(schema_leyes) ,crearLey)
router.put('/leyes/:id', validarCuerpo(schema_leyes),actualizarLey)
router.delete('/leyes/:id', eliminarley)

router.get('/perfil_usuario', getPerfiles)
router.get('/perfil_usuario/:id', getPerfil)
router.post('/perfil_usuario', crearPerfil)
router.put('/perfil_usuario/:id', actualizarPerfil)
router.delete('/perfil_usuario/:id', eliminarPerfil)

router.get('/configuraciones', getConfig)
router.get('/configuraciones/:id',getConfig_id)
router.post('/configuraciones',validarCuerpo(configSchema1), crearConfig)
router.put('/configuraciones/:id', validarCuerpo(configSchema1), actualizarConfig) // para actualizar un registro se manda el json sin el id , por que el id viene el body request
router.delete('/configuraciones/:id',eliminarConfig)

router.get('/categoriasForo', getCategoriasForo)
router.get('/categoriasForo/:id', getCategoriasForo_id)
router.post('/categoriasForo', crearCategoriasForo)
router.put('/categoriasForo/:id', actualizarCategoriasForo)
router.delete('/categoriasForo/:id', eliminarCategoriasForo)

router.get('/categoriasleyes', getCategoriasLeyes)
router.get('/categoriasleyes/:id', getCategoriasLeyes_id)
router.post('/categoriasleyes', crearCategoriasLeyes)
router.put('/categoriasleyes/:id', actualizarCategoriasLeyes)
//router.delete('/categoriasleyes/:id', eliminarCategoriasLeyes) no se puede eliminar categorias leyes por que hay leyes que dependen de esta tabla

router.get('/comentarios', getComentarios)
router.get('/comentarios/:id', getComentarios_id)
router.post('/comentarios', crearComentarios)
router.put('/comentarios/:id', actualizarComentarios)
router.delete('/comentarios/:id', eliminarComentarios)

router.get('/historialConsultas', getConsultaHistorial)
router.get('/historialConsultas/:id', getConsultaHistorial_id)
router.post('/historialConsultas', crearConsultaHistorial)
router.put('/historialConsultas/:id', actualizarConsultaHistorial)
router.delete('/historialConsultas/:id', eliminarConsultaHistorial)

router.get('/reacciones', getReacciones)
router.get('/reacciones/:id', getReacciones_id)
router.post('/reacciones', crearReacciones)
router.put('/reacciones/:id', actualizarReacciones)
router.delete('/reacciones/:id', eliminarReacciones)

router.get('/moderaciones', getModeraciones)
router.get('/moderaciones/:id', getModeraciones_id)
router.post('/moderaciones', crearModeraciones)
router.put('/moderaciones/:id', actualizarModeraciones)
router.delete('/moderaciones/:id', eliminarModeraciones)

router.get('/publicacionesForo', getPublicacionesForo)
router.get('/publicacionesForo/:id', getPublicacionesForos_id)
router.post('/publicacionesForo', crearPublicacionesForo)
router.put('/publicacionesForo/:id', actualizarPublicacionesForo)
router.delete('/publicacionesForo/:id', eliminarPublicacionesForo)




export default router