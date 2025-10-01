import PG from "pg";

export const pool = new PG.Pool({
    user:"postgres",
    host:"localhost",
    password:"postgres",
    database:"BD_sedaelforo",
    port:"5432"
});

/*pool.query('SELECT NOW()').then(result =>{
    console.log(result)
})*/