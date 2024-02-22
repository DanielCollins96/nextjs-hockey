import { Pool } from "pg";

let conn;
if (!conn) {
    conn = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_URL,
        port: process.env.PORT,
        database: process.env.DB_NAME
    })
}

export default conn;