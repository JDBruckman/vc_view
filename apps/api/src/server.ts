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
        (d.cost / nullif(s.total_sales, 0)) as tacos_account
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


app.get("/metrics/overview", async (req, res) => {
  try {
    const from = String(req.query.from ?? "2026-01-01");
    const to = String(req.query.to ?? "2026-01-31");

    const result = await pool.query(
      `
      with daily_ads as (
        select
          a.id as account_id,
          d.date,
          sum(d.cost) as spend,
          sum(d.attributed_sales) as attributed_sales
        from daily_ad_stats d
        join campaigns c on c.id = d.campaign_id
        join ad_profiles p on p.id = c.ad_profile_id
        join accounts a on a.id = p.account_id
        where d.date >= $1::date and d.date <= $2::date
        group by a.id, d.date
      )
      select
        da.date,
        da.spend,
        da.attributed_sales,
        s.total_sales,
        (da.spend / nullif(da.attributed_sales, 0)) as acos,
        (da.attributed_sales / nullif(da.spend, 0)) as roas,
        (da.spend / nullif(s.total_sales, 0)) as tacos
      from daily_ads da
      join daily_sales s
        on s.account_id = da.account_id
        and s.date = da.date
      order by da.date asc;
      `,
      [from, to]
    );

    res.json({ from, to, rows: result.rows });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


app.get("/metrics/campaigns", async (req, res) => {
  try {
    const ids = String(req.query.ids ?? "").split(",").filter(Boolean);
    const from = String(req.query.from);
    const to = String(req.query.to);

    if (!ids.length || !from || !to) {
      return res.status(400).json({ error: "ids, from, and to are required" });
    }

    const result = await pool.query(
      `
      with sales_by_account as (
        select
          account_id,
          sum(total_sales) as total_sales
        from daily_sales
        where date >= $2::date
          and date <= $3::date
        group by account_id
      )
      select
        c.id as campaign_id,
        c.name as campaign_name,
        sum(d.cost) as spend,
        sum(d.attributed_sales) as attributed_sales,
        sba.total_sales as total_sales,
        (sum(d.cost) / nullif(sum(d.attributed_sales), 0)) as acos,
        (sum(d.attributed_sales) / nullif(sum(d.cost), 0)) as roas,
        (sum(d.cost) / nullif(sba.total_sales, 0)) as tacos_account
      from daily_ad_stats d
      join campaigns c on c.id = d.campaign_id
      join ad_profiles p on p.id = c.ad_profile_id
      join sales_by_account sba on sba.account_id = p.account_id
      where c.id = any($1::uuid[])
        and d.date >= $2::date
        and d.date <= $3::date
      group by c.id, c.name, sba.total_sales
      order by spend desc;
      `,
      [ids, from, to]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


app.get("/campaigns", async (_req, res) => {
  try {
    const result = await pool.query(
      `
      select
        id,
        amazon_campaign_id,
        name,
        ad_type,
        status
      from campaigns
      order by created_at desc
      limit 200;
      `
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/metrics/campaigns/daily", async (req, res) => {
  try {
    const ids = String(req.query.ids ?? "").split(",").filter(Boolean);
    const from = String(req.query.from);
    const to = String(req.query.to);

    if (!ids.length || !from || !to) {
      return res.status(400).json({ error: "ids, from, and to are required" });
    }

    const result = await pool.query(
      `
      select
        c.id as campaign_id,
        c.name as campaign_name,
        d.date,
        sum(d.cost) as spend
      from daily_ad_stats d
      join campaigns c on c.id = d.campaign_id
      where c.id = any($1::uuid[])
        and d.date >= $2::date
        and d.date <= $3::date
      group by c.id, c.name, d.date
      order by d.date asc;
      `,
      [ids, from, to]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/metrics/account", async (req, res) => {
  try {
    const from = String(req.query.from);
    const to = String(req.query.to);

    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required" });
    }

    const result = await pool.query(
      `
      with daily_ads as (
        select
          a.id as account_id,
          d.date,
          sum(d.cost) as spend,
          sum(d.attributed_sales) as attributed_sales
        from daily_ad_stats d
        join campaigns c on c.id = d.campaign_id
        join ad_profiles p on p.id = c.ad_profile_id
        join accounts a on a.id = p.account_id
        where d.date >= $1::date and d.date <= $2::date
        group by a.id, d.date
      ),
      totals as (
        select
          account_id,
          sum(spend) as spend,
          sum(attributed_sales) as attributed_sales
        from daily_ads
        group by account_id
      ),
      sales as (
        select
          account_id,
          sum(total_sales) as total_sales
        from daily_sales
        where date >= $1::date and date <= $2::date
        group by account_id
      )
      select
        t.account_id,
        t.spend,
        t.attributed_sales,
        s.total_sales,
        (t.spend / nullif(t.attributed_sales, 0)) as acos,
        (t.attributed_sales / nullif(t.spend, 0)) as roas,
        (t.spend / nullif(s.total_sales, 0)) as tacos_account
      from totals t
      join sales s on s.account_id = t.account_id
      limit 1;
      `,
      [from, to]
    );

    res.json(result.rows[0] ?? null);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
