import { CampaignMultiSelect } from "@/components/CampaignMultiSelect";
import { CampaignSpendChart } from "@/components/CampaignSpendChart";

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

type CampaignRow = {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  attributed_sales: string;
  total_sales: string;
  acos: string | null;
  roas: string | null;
  tacos_account: string | null;
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

    // 1) Fetch campaigns so we're not hardcoding IDs
  const campaignsRes = await fetch(`${baseUrl}/campaigns`, { cache: "no-store" });
  if (!campaignsRes.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Compare Campaigns</h1>
        <p>Failed to fetch campaigns: {campaignsRes.status}</p>
      </main>
    );
  }

  const campaigns: Campaign[] = await campaignsRes.json();
  const first = campaigns[0];

  if (!first) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Compare Campaigns</h1>
        <p>No campaigns found.</p>
      </main>
    );
  }

  // 2) Compare metrics for the first campaign (add selection UI next)
const from = sp.from ?? "2026-01-20";
const to = sp.to ?? "2026-01-22";
const selectedIds = sp.ids?.split(",").filter(Boolean) ?? [campaigns[0].id];



const params = new URLSearchParams({
  ids: selectedIds.join(","),
  from,
  to,
});

const dailyRes = await fetch(
  `${baseUrl}/metrics/campaigns/daily?${params}`,
  { cache: "no-store" }
);
const dailyRows = dailyRes.ok ? await dailyRes.json() : [];

  const res = await fetch(`${baseUrl}/metrics/campaigns?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Compare Campaigns</h1>
        <p>Failed to fetch: {res.status}</p>
      </main>
    );
  }

  const rows: CampaignRow[] = await res.json();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Compare Campaigns</h1>

      <CampaignMultiSelect 
        campaigns={campaigns}
        selectedIds={selectedIds}
        from={from}
        to={to}
      />

      <p style={{ color: "#6b7280", marginTop: 8 }}>Selected: {selectedIds.length}</p>

      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Range: {from} → {to}
      </p>

      <h2 style={{ marginTop: 24, fontSize: 16 }}>Spend over time</h2>
      <CampaignSpendChart rows={dailyRows} />


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
    {rows.map((r) => {
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


