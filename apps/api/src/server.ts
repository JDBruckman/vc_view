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

app.get("/metrics/demo", async (_req, res) => {
  try {
    const result = await pool.query(`
      select
        c.name as campaign_name,
        d.date,
        d.cost,
        d.attributed_sales,
        s.total_sales,
        (d.cost / nullif(d.attributed_sales, 0)) as acos,
        (d.attributed_sales / nullif(d.cost, 0)) as roas,
        (d.cost / nullif(s.total_sales, 0)) as tacos
      from daily_ad_stats d
      join campaigns c on c.id = d.campaign_id
      join ad_profiles p on p.id = c.ad_profile_id
      join accounts a on a.id = p.account_id
      join daily_sales s
        on s.account_id = a.id
        and s.date = d.date
      order by d.date desc
      limit 1;
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
