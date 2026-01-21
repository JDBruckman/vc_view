import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migrations found.");
    return;
  }

  // Simple migrations table to track what's been applied
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  for (const file of files) {
    const already = await pool.query(
      "select 1 from schema_migrations where filename = $1",
      [file]
    );
    if (already.rowCount) continue;

    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");

    console.log("Applying", file);
    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query(
        "insert into schema_migrations(filename) values ($1)",
        [file]
      );
      await pool.query("commit");
    } catch (err) {
      await pool.query("rollback");
      throw err;
    }
  }

  console.log("Migrations complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});