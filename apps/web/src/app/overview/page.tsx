import { SpendChart } from "@/components/SpendChart";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangePicker";


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
      <main className="space-y-6">
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
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Range: {from} → {to}
        </p>
        <div className="mt-3">
          <DateRangePicker from={from} to={to} basePath="/overview" />
        </div>

      </div>
      <div className="flex flex-wrap gap-4">
        <Kpi label="Spend" value={`$${spend.toFixed(2)}`} />
        <Kpi label="Attributed Sales" value={`$${attributedSales.toFixed(2)}`} />
        <Kpi label="Total Sales" value={`$${totalSales.toFixed(2)}`} />
        <Kpi label="ACoS" value={acos === null ? "—" : `${(acos * 100).toFixed(2)}%`} />
        <Kpi label="ROAS" value={roas === null ? "—" : roas.toFixed(2)} />
        <Kpi label="TACoS" value={tacos === null ? "—" : `${(tacos * 100).toFixed(2)}%`} />
      </div>

      <h2 className="text-base font-semibold">Spend (daily)</h2>
      <SpendChart data={chartData} />

    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="min-w-45">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-2 text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

