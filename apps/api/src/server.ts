import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./lib/db.js";


const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const result = await pool.query("select now() as now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: (err as Error).message,
    });
  }
});


const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
