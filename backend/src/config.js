import PG from "pg";
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || "cambiar esta clave en produccion";
export const JWT_COOKIE = process.env.JWT_COOKIE || "token_cookie";

export const pool = new PG.Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});
