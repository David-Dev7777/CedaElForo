import PG from "pg";

export const pool = new PG.Pool({
    user:"postgres",
    host:"localhost",
    password:"postgres",
    database:"BD_cedaelforo_jesus",
    port:"5432"
});

