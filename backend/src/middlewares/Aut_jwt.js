// Middleware para verificar autenticación
// Prioriza token JWT en cookie; si no existe, usa req.session.user
export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET);
      // Rellenar sesión con datos del payload para compatibilidad
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
    // continuar para fallback a session
  }

  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};