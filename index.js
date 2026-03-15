// index.js
import pkg from 'pg';
import dotenv from "dotenv";
dotenv.config();

const { Client } = pkg;

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Conexión exitosa a RDS PostgreSQL");

    const res = await client.query('SELECT NOW()');
    console.log("Hora del servidor:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  } finally {
    await client.end();
  }
}

testConnection();