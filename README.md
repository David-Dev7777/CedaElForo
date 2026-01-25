# Clonar el repositorio
git clone https://github.com/David-Dev7777/CedaElForo

#1 Instalar dependencias con 
pnpm install

#2 En la carpeta raiz del proyecto ejecutar
pnpm run dev

#3 Moverse al frontend del proyecto con
cd frontend

#4 Instalar dependencias del frontend con
pnpm install

#5 En la carpeta frontend del proyecto ejecutar
pnpm run dev

#6 crear el archivo .env y agregar las siguientes configuriaciones:
# Puerto en el que corre tu servidor 4000 por defecto
PORT=4000

# Clave secreta para firmar JWT y cookie
JWT_SECRET=tu-clave-secreta-aqui
JWT_COOKIE=tu-clave-secreta-para-cookies-aqui

# dentro de visual studio instalar la extension. para la conexion desde tu base de datos local en postgres 
Name: PostgreSQL
Id: ckolkman.vscode-postgres
Description: PostgreSQL Management Tool
Version: 1.4.3
Publisher: Chris Kolkman
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=ckolkman.vscode-postgres

# Configuración de la base de datos PostgreSQL
PGUSER=tu usuario postgres
PGHOST=tu localhost
PGPASSWORD=tu password postgres
PGDATABASE=tu base de datos postgres
PGPORT=5432

- tambien hay .env.example que muestra las configuraciones necesarias para el proyecto
  





