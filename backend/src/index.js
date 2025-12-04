import express from 'express'
import cors from 'cors'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import{dirname, join} from 'path'
import { fileURLToPath } from 'url'
import indexRoutes from './routes/index_routes.js'
import{PORT} from './config.js'// variable del puerto configurada desde config.js
import morgan from 'morgan'


const app = express()

const __dirname = dirname(fileURLToPath(import.meta.url))


app.set('view engine','ejs')
app.set('views',join(__dirname,'views'))

app.use(cors({
    origin: 'http://localhost:5173',
  credentials: true,

})) // nuestro servidor utiliza cors
app.use(morgan('dev'))
app.use(express.json()) //modulo de express para el servido entienda los formatos json
// Parser de cookies (necesario para leer JWT desde cookies)
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())
app.use(session({ 
  secret: 'mi-clave-secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
    app.use(express.urlencoded({ extended: true }))
    app.use('/api',indexRoutes) // nuestro servidor utiliza el archivo "indexViews" para las rutas



app.use(express.static(join(__dirname,'public')))



app.listen(PORT)
console.log('servidor escuchando en el puerto', PORT)