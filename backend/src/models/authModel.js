// backend/src/models/authModel.js

import { pool } from '../config.js';
import bcrypt from 'bcryptjs';
import logger from '../controllers/controlador_logs.js';

// Límite de intentos fallidos antes de bloquear
const MAX_FAILED_ATTEMPTS = 3;

// --- Helpers de logging ---
const logInfo = (action, data, msg) => logger.info({ action, ...data }, msg);
const logWarn = (action, data, msg) => logger.warn({ action, ...data }, msg);
const logError = (action, data, msg) => logger.error({ action, ...data }, msg);

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

// --- Manejo de intentos fallidos ---
async function resetFailedAttempts(user) {
  try {
    await pool.query('UPDATE usuarios SET failed_attempts = 0 WHERE id = $1', [user.id]);
    logInfo('authenticate_reset_attempts', { userId: user.id, email: user.email, previousAttempts: user.failed_attempts }, 'Contador de intentos reseteado');
  } catch (err) {
    logError('authenticate_reset_attempts_error', { userId: user.id, email: user.email, err: { message: err.message, name: err.name } }, 'Error reseteando failed_attempts');
  }
}

async function handleFailedAttempt(user) {
  const current = Number(user.failed_attempts || 0) + 1;

  if (current >= MAX_FAILED_ATTEMPTS) {
    try {
      await pool.query('UPDATE usuarios SET failed_attempts = $1, activo = false WHERE id = $2', [current, user.id]);
      logWarn('authenticate_user_blocked', { userId: user.id, email: user.email, failedAttempts: current, maxAttempts: MAX_FAILED_ATTEMPTS }, 'Usuario bloqueado por exceder intentos fallidos');
    } catch (err) {
      logError('authenticate_block_error', { userId: user.id, email: user.email, err: { message: err.message, name: err.name } }, 'Error aplicando bloqueo al usuario');
    }
  } else {
    try {
      await pool.query('UPDATE usuarios SET failed_attempts = $1 WHERE id = $2', [current, user.id]);
      logWarn('authenticate_increment_attempts', { userId: user.id, email: user.email, failedAttempts: current, remainingAttempts: MAX_FAILED_ATTEMPTS - current }, `Intento fallido registrado (${current}/${MAX_FAILED_ATTEMPTS})`);
    } catch (err) {
      logError('authenticate_update_attempts_error', { userId: user.id, email: user.email, err: { message: err.message, name: err.name } }, 'Error actualizando failed_attempts');
    }
  }
}

// --- Función principal de autenticación ---
export const authenticateUser = async (email, password) => {
  try {
    logInfo('authenticate_start', { identifier: email }, 'Iniciando autenticación');

    const hasFailedAttempts = await hasColumn('failed_attempts');
    const baseFields = ['id','email','password_hash','nombre','apellido','tipo_usuario','activo'];
    if (hasFailedAttempts) baseFields.push('failed_attempts');

    const query = `SELECT ${baseFields.join(',')} FROM usuarios WHERE email = $1 OR nombre = $1`;
    const result = await pool.query(query, [email]);

    if (!result.rows.length) {
      logWarn('authenticate_user_not_found', { identifier: email }, 'Usuario no encontrado');
      return null;
    }

    const user = result.rows[0];
    logInfo('authenticate_user_found', { userId: user.id, email: user.email, activo: user.activo }, 'Usuario encontrado en base de datos');

    if (user.activo === false) {
      logWarn('authenticate_user_inactive', { userId: user.id, email: user.email }, 'Usuario inactivo/bloqueado');
      return { blocked: true, userId: user.id };
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      logInfo('authenticate_password_match', { userId: user.id, email: user.email }, 'Contraseña correcta');
      if (hasFailedAttempts && user.failed_attempts > 0) await resetFailedAttempts(user);
      return user;
    } else {
      logWarn('authenticate_password_mismatch', { userId: user.id, email: user.email, currentAttempts: user.failed_attempts || 0 }, 'Contraseña incorrecta');
      if (hasFailedAttempts) await handleFailedAttempt(user);
      return null;
    }

  } catch (error) {
    logError('authenticate_fatal_error', { identifier: email, err: { message: error.message, name: error.name, stack: error.stack } }, 'Error fatal en proceso de autenticación');
    throw error;
  }
};

// --- Utilidad: generar hash ---
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// --- Actualizar último login ---
export const updateLastLogin = async (userId) => {
  try {
    await pool.query('UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
    console.log('Último login actualizado para usuario ID:', userId);
  } catch (error) {
    console.error('Error actualizando último login:', error);
  }
};
