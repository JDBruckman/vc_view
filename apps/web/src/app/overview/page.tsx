import { SpendChart } from "@/components/SpendChart";

type Row = {
  date: string;
  spend: string; // pg numeric comes back as string
  attributed_sales: string;
  total_sales: string;
  acos: string | null;
  roas: string | null;
  tacos: string | null;
};

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {

  const sp = await searchParams;

  const from = sp.from ?? "2026-01-01";
  const to = sp.to ?? "2026-01-31";
  const params = new URLSearchParams({ from, to });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${baseUrl}/metrics/overview?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Overview</h1>
        <p>Failed to fetch: {res.status}</p>
      </main>
    );
  }

  const data: { from: string; to: string; rows: Row[] } = await res.json();

  const totals = data.rows.reduce(
    (acc, r) => {
      acc.spend += Number(r.spend ?? 0);
      acc.attributedSales += Number(r.attributed_sales ?? 0);
      acc.totalSales += Number(r.total_sales ?? 0);
      return acc;
    },
    { spend: 0, attributedSales: 0, totalSales: 0 }
  );

  const chartData = data.rows.map((r) => ({
    date: r.date,
    spend: Number(r.spend ?? 0),
  }));

  const acos =
    totals.attributedSales === 0 ? null : totals.spend / totals.attributedSales;
  const roas = totals.spend === 0 ? null : totals.attributedSales / totals.spend;
  const tacos = totals.totalSales === 0 ? null : totals.spend / totals.totalSales;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Overview</h1>

      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        <Kpi label="Spend" value={`$${totals.spend.toFixed(2)}`} />
        <Kpi label="Attributed Sales" value={`$${totals.attributedSales.toFixed(2)}`} />
        <Kpi label="Total Sales" value={`$${totals.totalSales.toFixed(2)}`} />
        <Kpi label="ACoS" value={acos === null ? "—" : `${(acos * 100).toFixed(2)}%`} />
        <Kpi label="ROAS" value={roas === null ? "—" : roas.toFixed(2)} />
        <Kpi label="TACoS" value={tacos === null ? "—" : `${(tacos * 100).toFixed(2)}%`} />
      </div>

      <h2 style={{ marginTop: 24, fontSize: 16 }}>Spend (daily)</h2>
      <SpendChart data={chartData} />
      <h2 style={{ marginTop: 24, fontSize: 16 }}>Raw rows</h2>
      <pre style={{ marginTop: 8 }}>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}
