# Clonar el repositorio
git clone https://github.com/David-Dev7777/CedaElForo

#1 Instalar dependencias
pnpm install

#2 En la carpeta raiz del proyecto ejecutar
pnpm run dev

#3 Moverse al frontend del proyecto 
cd frontende

#4 Instalar dependencias del frontend
pnpm install

#5 En la carpeta frontend del proyecto ejecutar
pnpm run dev

#6 crear el archivo .env y agregar las siguientes configuriaciones:
# Puerto en el que corre tu servidor 4000 por defecto
PORT=4000

# Clave secreta para firmar JWT y cookie
JWT_SECRET=tu-clave-secreta-aqui
JWT_COOKIE=tu-clave-secreta-para-cookies-aqui

# Configuración de la base de datos PostgreSQL
PGUSER=tu usuario postgres
PGHOST=tu localhost
PGPASSWORD=tu password postgres
PGDATABASE=tu base de datos postgres
PGPORT=5432

- tambien hay .env.example con la configuraciones que tienes que hacer
  





