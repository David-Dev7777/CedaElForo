import pino from 'pino';
import { pool } from '../config.js';

// Función para sanitizar datos sensibles
const sanitizeSensitiveData = (entry) => {
  const sanitized = { ...entry };
  
  // Ocultar email parcialmente
  if (sanitized.email) {
    const [username, domain] = sanitized.email.split('@');
    sanitized.email = `${username.substring(0, 2)}***@${domain}`;
  }
  
  // Ocultar IP parcialmente
  if (sanitized.ip) {
    const ipParts = sanitized.ip.split(':');
    sanitized.ip = ipParts.length > 1 ? '***:***' : sanitized.ip.split('.').map((part, i) => i < 2 ? part : '***').join('.');
  }
  
  // Nunca loguear passwords
  delete sanitized.password;
  
  return sanitized;
};

// Determinar si un log es importante para guardar en BD
const esLogImportante = (entry) => {
  // Niveles importantes: WARN (40), ERROR (50), FATAL (60)
  if (entry.level >= 40) {
    return true;
  }

  // Acciones específicas importantes a nivel INFO
  const accionesImportantes = [
    'login_success',           // Login exitoso
    'login_failed',            // Login fallido
    'login_blocked',           // Usuario bloqueado
    'authenticate_user_blocked', // Usuario bloqueado por intentos
    'authenticate_password_mismatch', // Contraseña incorrecta
    'logout',                  // Cierre de sesión
    'password_change',         // Cambio de contraseña
    'user_created',            // Usuario creado
    'user_deleted',            // Usuario eliminado
    'permission_denied',       // Permiso denegado
    'data_export',             // Exportación de datos
    'config_change'            // Cambio de configuración
  ];

  return accionesImportantes.includes(entry.action);
};

const guardarLogs = {
  write: (log) => {
    try {
      const entry = JSON.parse(log);

      // Mapeo de niveles numéricos a texto
      const levelMap = {
        10: 'TRACE',
        20: 'DEBUG',
        30: 'INFO',
        40: 'WARN',
        50: 'ERROR',
        60: 'FATAL'
      };

      // Sanitizar datos sensibles SOLO para consola
      const sanitizedEntry = sanitizeSensitiveData(entry);

      // Formatear para consola
      const levelText = levelMap[sanitizedEntry.level] || 'INFO';
      const timestamp = new Date(sanitizedEntry.time).toISOString();
      const message = sanitizedEntry.msg || sanitizedEntry.message || '';
      
      // MOSTRAR ERROR COMPLETO EN CONSOLA SI ES ERROR
      if (sanitizedEntry.level >= 50 && sanitizedEntry.err) {
        console.error(`[${timestamp}] ${levelText}: ${message}`);
        console.error('Error details:', {
          message: sanitizedEntry.err.message,
          name: sanitizedEntry.err.name,
          code: sanitizedEntry.err.code
        });
        if (process.env.NODE_ENV !== 'production') {
          console.error('Stack:', sanitizedEntry.err.stack);
        }
      } else {
        console.log(`[${timestamp}] ${levelText}: ${message}`, 
          sanitizedEntry.userId ? `| UserID: ${sanitizedEntry.userId}` : '',
          sanitizedEntry.email ? `| Email: ${sanitizedEntry.email}` : '',
          sanitizedEntry.action ? `| Action: ${sanitizedEntry.action}` : ''
        );
      }

      // GUARDAR EN BD SOLO LOGS IMPORTANTES
      if (esLogImportante(entry)) {
        const query = `
          INSERT INTO logs (level, message, context, timestamp)
          VALUES ($1, $2, $3, $4)
        `;

        const values = [
          entry.level,
          entry.msg || entry.message,
          JSON.stringify(entry), // Guardar datos completos en BD
          new Date(entry.time)
        ];

        pool.query(query, values).catch(err => {
          console.error('Error guardando log en BD:', err);
        });
      }

    } catch (error) {
      console.error('Error parseando log:', error);
    }
  }
};

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label, number) => {
      return { level: number };
    }
  },
  // Redactar campos sensibles automáticamente
  redact: {
    paths: ['password', 'token', 'Authorization', 'cookie'],
    censor: '[REDACTED]'
  }
}, guardarLogs);

export default logger;