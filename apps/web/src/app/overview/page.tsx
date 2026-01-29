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

  const accountRes = await fetch(
  `${baseUrl}/metrics/account?${new URLSearchParams({ from, to })}`,
  { cache: "no-store" }
);

const account = accountRes.ok ? await accountRes.json() : null;

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


  const chartData = data.rows.map((r) => ({
    date: r.date,
    spend: Number(r.spend ?? 0),
  }));

  function n(v: unknown) {
    return v === null || v === undefined ? 0 : Number(v);
  }

const spend = n(account?.spend);
const attributedSales = n(account?.attributed_sales);
const totalSales = n(account?.total_sales);

const acos = account?.acos === null || account?.acos === undefined ? null : Number(account.acos);
const roas = account?.roas === null || account?.roas === undefined ? null : Number(account.roas);
const tacos = account?.tacos_account === null || account?.tacos_account === undefined ? null : Number(account.tacos_account);


  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Overview</h1>

      <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        <Kpi label="Spend" value={`$${spend.toFixed(2)}`} />
        <Kpi label="Attributed Sales" value={`$${attributedSales.toFixed(2)}`} />
        <Kpi label="Total Sales" value={`$${totalSales.toFixed(2)}`} />
        <Kpi label="ACoS" value={acos === null ? "—" : `${(acos * 100).toFixed(2)}%`} />
        <Kpi label="ROAS" value={roas === null ? "—" : roas.toFixed(2)} />
        <Kpi label="TACoS" value={tacos === null ? "—" : `${(tacos * 100).toFixed(2)}%`} />
      </div>

      <h2 style={{ marginTop: 24, fontSize: 16 }}>Spend (daily)</h2>
      <SpendChart data={chartData} />
      {/* <h2 style={{ marginTop: 24, fontSize: 16 }}>Raw rows</h2> */}
      {/* <pre style={{ marginTop: 8 }}>{JSON.stringify(data, null, 2)}</pre> */}

      <form action="/auth/logout" method="post" style={{ marginBottom: 16 }}>
        <button
          type="submit"
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </form>

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
