import express from 'express'
import cors from 'cors'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import indexRoutes from './routes/index_routes.js'
import { PORT, JWT_COOKIE } from './config.js'
import morgan from 'morgan'

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

/* --------------- Hardening --------------- */

// Ocultar X-Powered-By
app.disable('x-powered-by')

// Manejo seguro de errores JSON (evita stacktraces)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Error interno del servidor' })
})

/* --------------- View engine --------------- */
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views'))

/* --------------- Headers de seguridad --------------- */
app.use((req, res, next) => {

  // CSP
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self'; " +
    "connect-src 'self' http://localhost:5173; " +
    "frame-ancestors 'none'; " +
    "form-action 'self';"
  )

  // Anti-clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // HSTS
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  next()
})

/* --------------- Base middlewares --------------- */

// CORS restringido
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
  secret: JWT_COOKIE,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true en producción HTTPS
    sameSite: 'lax'
  }
}))

/* --------------- Rutas --------------- */
app.use('/api', indexRoutes)

/* --------------- Archivos estáticos --------------- */
app.use(express.static(join(__dirname, 'public')))

app.listen(PORT)
console.log('Servidor escuchando en el puerto', PORT)
