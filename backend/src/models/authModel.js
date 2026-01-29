import{pool} from '../config.js';
import bcrypt from 'bcryptjs';
import logger from '../controllers/controlador_logs.js';

// Límite de intentos fallidos antes de bloquear (configurado a 3 según requerimiento)
const MAX_FAILED_ATTEMPTS = 3;

// Comprueba si una columna existe en la tabla usuarios
const hasColumn = async (column) => {
  try {
    const res = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = $1`,
      [column]
    );
    return res.rows.length > 0;
  } catch (err) {
    console.error('Error verificando columnas en usuarios:', err);
    return false;
  }
};


export const authenticateUser = async (email, password) => {
  try {
    logger.info({ 
      action: 'authenticate_start',
      identifier: email 
    }, 'Iniciando autenticación');

    // Comprobar si existen las columnas de control de intentos/bloqueo
    const hasFailedAttempts = await hasColumn('failed_attempts');

    // Construir SELECT dinámico según columnas disponibles
    const baseFields = ['id', 'email', 'password_hash', 'nombre', 'apellido', 'tipo_usuario', 'activo'];
    if (hasFailedAttempts) baseFields.push('failed_attempts');

    // Buscar por email o por nombre de usuario (aceptamos login por email o por nombre)
    const query = `SELECT ${baseFields.join(', ')} FROM usuarios WHERE email = $1 OR nombre = $1`;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      logger.warn({ 
        action: 'authenticate_user_not_found',
        identifier: email 
      }, 'Usuario no encontrado');
      return null;
    }

    const user = result.rows[0];
    
    logger.debug({ 
      action: 'authenticate_user_found',
      userId: user.id,
      email: user.email,
      activo: user.activo 
    }, 'Usuario encontrado en base de datos');

    // Si el usuario ya está desactivado (activo = false) => considerarlo bloqueado
    if (user.activo === false) {
      logger.warn({ 
        action: 'authenticate_user_inactive',
        userId: user.id,
        email: user.email 
      }, 'Usuario inactivo/bloqueado');
      return { blocked: true, userId: user.id };
    }

    // Comparación usando bcrypt
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (match) {
      logger.info({ 
        action: 'authenticate_password_match',
        userId: user.id,
        email: user.email 
      }, 'Contraseña correcta');

      // Si existe columna failed_attempts, resetear contador a 0
      if (hasFailedAttempts && user.failed_attempts > 0) {
        try {
          await pool.query('UPDATE usuarios SET failed_attempts = 0 WHERE id = $1', [user.id]);
          
          logger.info({ 
            action: 'authenticate_reset_attempts',
            userId: user.id,
            email: user.email,
            previousAttempts: user.failed_attempts 
          }, 'Contador de intentos reseteado');
        } catch (err) {
          logger.error({ 
            action: 'authenticate_reset_attempts_error',
            userId: user.id,
            email: user.email,
            err: {
              message: err.message,
              name: err.name
            }
          }, 'Error reseteando failed_attempts');
        }
      }

      return user;
    } else {
      logger.warn({ 
        action: 'authenticate_password_mismatch',
        userId: user.id,
        email: user.email,
        currentAttempts: user.failed_attempts || 0 
      }, 'Contraseña incorrecta');

      // Si existe columna failed_attempts, incrementarla y bloquear si excede límite
      if (hasFailedAttempts) {
        try {
          const current = Number(user.failed_attempts || 0) + 1;
          
          if (current >= MAX_FAILED_ATTEMPTS) {
            // Al alcanzar el máximo, marcar inactivo (activo = false) siempre.
            try {
              await pool.query(
                'UPDATE usuarios SET failed_attempts = $1, activo = false WHERE id = $2', 
                [current, user.id]
              );
              
              logger.warn({ 
                action: 'authenticate_user_blocked',
                userId: user.id,
                email: user.email,
                failedAttempts: current,
                maxAttempts: MAX_FAILED_ATTEMPTS 
              }, 'Usuario bloqueado por exceder intentos fallidos');
              
            } catch (err) {
              logger.error({ 
                action: 'authenticate_block_error',
                userId: user.id,
                email: user.email,
                err: {
                  message: err.message,
                  name: err.name
                }
              }, 'Error aplicando bloqueo al usuario');
            }
          } else {
            await pool.query(
              'UPDATE usuarios SET failed_attempts = $1 WHERE id = $2', 
              [current, user.id]
            );
            
            logger.warn({ 
              action: 'authenticate_increment_attempts',
              userId: user.id,
              email: user.email,
              failedAttempts: current,
              remainingAttempts: MAX_FAILED_ATTEMPTS - current 
            }, `Intento fallido registrado (${current}/${MAX_FAILED_ATTEMPTS})`);
          }
        } catch (err) {
          logger.error({ 
            action: 'authenticate_update_attempts_error',
            userId: user.id,
            email: user.email,
            err: {
              message: err.message,
              name: err.name
            }
          }, 'Error actualizando failed_attempts');
        }
      }

      return null;
    }

  } catch (error) {
    logger.error({ 
      action: 'authenticate_fatal_error',
      identifier: email,
      err: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    }, 'Error fatal en proceso de autenticación');
    throw error;
  }
};


// Utilidad: generar hash (útil para scripts de creación/actualización de usuarios)
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Función para actualizar último login
export const updateLastLogin = async (userId) => {
  try {
    const query = `
      UPDATE usuarios 
      SET ultimo_login = CURRENT_TIMESTAMP 
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
    console.log(' Último login actualizado para usuario ID:', userId);
  } catch (error) {
    console.error('Error actualizando último login:', error);
  }
};