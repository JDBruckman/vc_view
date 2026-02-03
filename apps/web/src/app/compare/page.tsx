import { CampaignMultiSelect } from "@/components/CampaignMultiSelect";
import { CampaignSpendChart } from "@/components/CampaignSpendChart";
import { PeriodSelect } from "@/components/PeriodSelect";
import { DateRangePicker } from "@/components/DateRangePicker";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type Campaign = {
  id: string;
  name: string;
  ad_type: string;
  status: string;
};

type CampaignChartRow = {
  campaign_id: string;
  campaign_name: string;
  date: string;
  spend: string;
  attributed_sales?: string;
};


type CampaignTableRow = {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  attributed_sales: string;
  total_sales: string;
  acos: string | null;
  roas: string | null;
  tacos_account: string | null;
};


function daysBetween(from: string, to: string) {
  const a = new Date(from + "T00:00:00Z").getTime();
  const b = new Date(to + "T00:00:00Z").getTime();
  const ms = Math.abs(b - a);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; from?: string; to?: string; period?: string }>;
}) {
  const sp = await searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

    // 1) Fetch campaigns so we're not hardcoding IDs
  const campaignsRes = await fetch(`${baseUrl}/campaigns`, { cache: "no-store" });
  if (!campaignsRes.ok) {
    return (
      <main className="space-y-6">
        <h1>Compare Campaigns</h1>
        <p>Failed to fetch campaigns: {campaignsRes.status}</p>
      </main>
    );
  }

  const campaigns: Campaign[] = await campaignsRes.json();
  const first = campaigns[0];

  if (!first) {
    return (
      <main className="space-y-6">
        <h1>Compare Campaigns</h1>
        <p>No campaigns found.</p>
      </main>
    );
  }

  // 2) Compare metrics for the first campaign (add selection UI next)
const from = sp.from ?? "2026-01-20";
const to = sp.to ?? "2026-01-22";
const selectedIds = sp.ids?.split(",").filter(Boolean) ?? [campaigns[0].id];

const days = daysBetween(from, to);

const autoPeriod: "daily" | "weekly" | "monthly" =
  days <= 14 ? "daily" : days <= 60 ? "weekly" : "monthly";

const periodParam = sp.period ?? "auto";
const periodChoice =
  periodParam === "daily" || periodParam === "weekly" || periodParam === "monthly"
    ? periodParam
    : "auto";

const period: "daily" | "weekly" | "monthly" =
  periodChoice === "auto" ? autoPeriod : periodChoice;

const params = new URLSearchParams({
  ids: selectedIds.join(","),
  from,
  to,
});

const chartParams = new URLSearchParams({
  ids: selectedIds.join(","),
  from,
  to,
});

const tableRes = await fetch(`${baseUrl}/metrics/campaigns?${params}`, {
  cache: "no-store",
});
const tableRows: CampaignTableRow[] = tableRes.ok ? await tableRes.json() : [];


const chartUrl =
  period === "daily"
    ? `${baseUrl}/metrics/campaigns/daily?${chartParams}`
    : `${baseUrl}/metrics/campaigns/rollup?${new URLSearchParams({
        period,
        ids: selectedIds.join(","),
        from,
        to,
      })}`;

const chartRes = await fetch(chartUrl, { cache: "no-store" });
const chartRows: CampaignChartRow[] =
  chartRes.ok ? await chartRes.json() : [];

const chartSeries = chartRows.map((r) => ({
  campaign_id: r.campaign_id,
  campaign_name: r.campaign_name,
  date: r.date,
  spend: Number(r.spend ?? 0),
}));


  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Compare Campaigns</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Range: {from} → {to} · Selected: {selectedIds.length} campaign(s)
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <DateRangePicker
            from={from}
            to={to}
            basePath="/compare"
            extraParams={{
              ids: selectedIds.join(","),
              period: periodChoice,
            }}
          />
        </div>

        <div className="mt-3">
          <PeriodSelect value={periodChoice} ids={selectedIds} from={from} to={to} />
        </div>

      </div>

      <CampaignMultiSelect 
        campaigns={campaigns}
        selectedIds={selectedIds}
        from={from}
        to={to}
      />
      <div className="space-y-3">
        <h2 className="text-base font-semibold">
          Spend over time <span className="text-sm text-muted-foreground">({period})</span>
        </h2>
        <CampaignSpendChart rows={chartSeries} />
      </div>


<Table className="mt-4 border">
  <TableHeader>
    <TableRow>
      <TableHead>Campaign</TableHead>
      <TableHead>Spend</TableHead>
      <TableHead>Attributed Sales</TableHead>
      <TableHead>Total Sales</TableHead>
      <TableHead>ACoS</TableHead>
      <TableHead>ROAS</TableHead>
      <TableHead>TACoS (account)</TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {tableRows.map((r) => {
      const spend = Number(r.spend ?? 0);
      const sales = Number(r.attributed_sales ?? 0);
      const totalSales = Number(r.total_sales ?? 0);
      const acos = r.acos === null ? null : Number(r.acos);
      const roas = r.roas === null ? null : Number(r.roas);
      const tacos = r.tacos_account === null ? null : Number(r.tacos_account);

      return (
        <TableRow key={r.campaign_id}>
          <TableCell className="font-medium">{r.campaign_name}</TableCell>
          <TableCell>${spend.toFixed(2)}</TableCell>
          <TableCell>${sales.toFixed(2)}</TableCell>
          <TableCell>${totalSales.toFixed(2)}</TableCell>
          <TableCell>{acos === null ? "—" : `${(acos * 100).toFixed(2)}%`}</TableCell>
          <TableCell>{roas === null ? "—" : roas.toFixed(2)}</TableCell>
          <TableCell>{tacos === null ? "—" : `${(tacos * 100).toFixed(2)}%`}</TableCell>
        </TableRow>
      );
    })}
  </TableBody>
</Table>

    </main>
  );
}


