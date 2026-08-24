import {Pool} from "pg";

const connectionString = process.env.DATABASE_URL;
const host = process.env.DB_HOST || process.env.DB_URL;
const isLocalHost = host === "localhost" || host === "127.0.0.1";

if (!connectionString && (!host || !process.env.DB_USER || !process.env.DB_NAME)) {
  throw new Error(
    "PostgreSQL config is incomplete. Set DATABASE_URL or DB_HOST/DB_URL, DB_USER, DB_PASS, DB_PORT, and DB_NAME."
  );
}

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        max: process.env.NODE_ENV === "production" ? 10 : 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: connectionString.includes("localhost")
          ? false
          : {rejectUnauthorized: false},
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host,
        port: process.env.DB_PORT, // Changed from PORT which might conflict with Next.js
        database: process.env.DB_NAME,
        max: process.env.NODE_ENV === "production" ? 10 : 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: isLocalHost ? false : {rejectUnauthorized: false},
      }
);

if (process.env.NODE_ENV !== "production") {
  pool.on("connect", () => {
    console.log("🔍 DB TRACE: New client connected to Local/Supabase");
  });

  pool.on("acquire", () => {
    console.log(
      "🔍 DB TRACE: Client acquired from pool (Active: " +
        pool.totalCount +
        ", Idle: " +
        pool.idleCount +
        ", Waiting: " +
        pool.waitingCount +
        ")"
    );
  });

  pool.on("remove", () => {
    console.log("🔍 DB TRACE: Client removed from pool");
  });
}

// Add error handling
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Export the pool directly
export default pool;
