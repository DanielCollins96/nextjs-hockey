// Prefer Aurora Data API automatically when its required env vars are present.
const hasAuroraDataApiConfig = Boolean(
  process.env.AURORA_CLUSTER_ARN && process.env.AURORA_SECRET_ARN
);
const useAurora =
  process.env.USE_AURORA === "true" ||
  (process.env.USE_AURORA !== "false" && hasAuroraDataApiConfig);

const pool = useAurora
  ? (await import("./db-aurora.js")).default
  : (await import("./db.js")).default;

if (useAurora) {
  console.log(
    hasAuroraDataApiConfig && process.env.USE_AURORA !== "true"
      ? "🔵 Using Aurora Serverless Data API (auto-detected from env)"
      : "🔵 Using Aurora Serverless Data API"
  );
} else {
  console.log("🟢 Using PostgreSQL over TCP");
}

export async function closeDbPool() {
  if (typeof pool.end === "function") {
    await pool.end();
  }
}

export default pool;
