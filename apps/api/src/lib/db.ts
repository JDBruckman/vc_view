import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString,
  // Supabase requires SSL for remote connections.
  // In most cases this is enough for Node + pg.
  ssl: { rejectUnauthorized: false },
  max: 10, // plenty for your scale
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Optional: surface pool errors (helps debugging)
pool.on("error", (err) => {
  console.error("Unexpected PG pool error", err);
});