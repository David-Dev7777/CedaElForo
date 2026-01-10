import PG from "pg";
import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000
export const JWT_SECRET = process.env.JWT_SECRET || 'mi-clave-secreta'

export const pool = new PG.Pool({
    user:"postgres",
    host:"localhost",
    password:"postgres",
    database:"BD_cedaelforo_jesus",
    port:"5432"
});
