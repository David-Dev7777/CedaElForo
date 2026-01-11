import PG from "pg";

export const pool = new PG.Pool({
    user:"postgres",
    host:"localhost",
    password:"Jesus230168",
    database:"SedaElForo",
    port:"5432"
});

