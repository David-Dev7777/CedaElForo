import{pool} from '../db.js'
import bcrypt from 'bcryptjs';

// Límite de intentos fallidos antes de bloquear
const MAX_FAILED_ATTEMPTS = 5;

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
    console.log('🔐 Intentando autenticar:', email);

    // Comprobar si existen las columnas de control de intentos/bloqueo
    const hasFailedAttempts = await hasColumn('failed_attempts');
    //const hasBloqueado = await hasColumn('bloqueado');

    // Construir SELECT dinámico según columnas disponibles
    const baseFields = ['id', 'email', 'password_hash', 'nombre', 'apellido', 'tipo_usuario', 'activo'];
    if (hasFailedAttempts) baseFields.push('failed_attempts');
    //if (hasBloqueado) baseFields.push('bloqueado');

  // Buscar por email o por nombre de usuario (aceptamos login por email o por nombre)
  const query = `SELECT ${baseFields.join(', ')} FROM usuarios WHERE email = $1 OR nombre = $1`;
  const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      console.log(' Usuario no encontrado o inactivo:', email);
      return null; // Usuario no encontrado
    }

    const user = result.rows[0];
    console.log(' Usuario encontrado:', user.email);

    // Si el usuario ya está desactivado (activo = false) => considerarlo bloqueado
    if (user.activo === false) {
      console.log('🔒 Usuario inactivo/bloqueado (activo=false):', user.email || user.nombre);
      return { blocked: true, userId: user.id };
    }

    // Comparación usando bcrypt
    const match = await bcrypt.compare(password, user.password_hash);
    if (match) {
      console.log('\u2705 Contrase\u00f1a correcta para:', user.email);

      // Si existe columna failed_attempts, resetear contador a 0
      if (hasFailedAttempts && user.failed_attempts > 0) {
        try {
          await pool.query('UPDATE usuarios SET failed_attempts = 0 WHERE id = $1', [user.id]);
          console.log('🔁 Contador de intentos reseteado para:', user.email);
        } catch (err) {
          console.error('Error reseteando failed_attempts:', err);
        }
      }

      return user;
    } else {
      console.log('\u274c Contrase\u00f1a incorrecta para:', user.email);

      // Si existe columna failed_attempts, incrementarla y bloquear si excede límite
      if (hasFailedAttempts) {
        try {
          const current = Number(user.failed_attempts || 0) + 1;
          if (current >= MAX_FAILED_ATTEMPTS) {
            // Al alcanzar el máximo, marcar inactivo (activo = false) siempre.
            try {
              await pool.query('UPDATE usuarios SET failed_attempts = $1, activo = false WHERE id = $2', [current, user.id]);
              console.log('🔒 Usuario desactivado por intentos fallidos (activo=false):', user.email);
            } catch (err) {
              console.error('Error aplicando bloqueo al usuario (activo=false):', err);
            }
          } else {
            await pool.query('UPDATE usuarios SET failed_attempts = $1 WHERE id = $2', [current, user.id]);
            console.log(`⚠️ Intentos fallidos (${current}) para:`, user.email);
          }
        } catch (err) {
          console.error('Error actualizando failed_attempts:', err);
        }
      }

      return null; // Contraseña incorrecta
    }

  } catch (error) {
    console.error(' Error en autenticación:', error);
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