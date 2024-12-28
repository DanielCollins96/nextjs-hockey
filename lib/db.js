import { Pool } from "pg";

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_URL,
    port: process.env.DB_PORT, // Changed from PORT which might conflict with Next.js
    database: process.env.DB_NAME,
    // Add some connection management settings
    max: 20, // maximum number of clients in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Add error handling
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});

// Export the pool directly
export default pool;