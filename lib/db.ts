import mysql from 'mysql2/promise';

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 10
});
console.log('DBG: DB_HOST=', process.env.DB_HOST, 'DB_USER=', process.env.DB_USER, 'DB_DATABASE=', process.env.DB_DATABASE);
export async function query(sql :string , parms:any[]= []){




    const [rows,fields] = await pool.execute(sql,parms);
    return rows;
}
