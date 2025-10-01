import express from 'express'
import{dirname, join} from 'path'
import { fileURLToPath } from 'url'
import indexRoutes from './routes/index_routes.js'
import{PORT} from './config.js'// variable del puerto configurada desde config.js


const app = express()

const __dirname = dirname(fileURLToPath(import.meta.url))


app.set('view engine','ejs')
app.set('views',join(__dirname,'views'))
app.use(express.json())//modulo de express para el servido entienda los formatos json
app.use(indexRoutes)// nuestro servidor utiliza el archivo "indexViews" para las rutas


app.use(express.static(join(__dirname,'public')))



app.listen(PORT)
console.log('servidor escuchando en el puerto', PORT)