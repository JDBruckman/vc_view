import { CampaignSelect } from "@/components/CampaignSelect";


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
  tacos: string | null;
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; from?: string; to?: string }>;
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
const selectedId = sp.id ?? campaigns[0].id;
const selected = campaigns.find((c) => c.id === selectedId) ?? campaigns[0];
const ids = [selected.id];


  const params = new URLSearchParams({
    ids: ids.join(","),
    from,
    to,
  });

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

      <CampaignSelect
        campaigns={campaigns}
        selectedId={selected.id}
        from={from}
        to={to}
      />

      <p style={{ color: "#6b7280", marginTop: 8 }}>Showing: {selected.name}</p>

      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Range: {from} → {to}
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 16,
          border: "1px solid #e5e7eb",
        }}
      >
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            <Th>Campaign</Th>
            <Th>Spend</Th>
            <Th>Attributed Sales</Th>
            <Th>Total Sales</Th>
            <Th>ACoS</Th>
            <Th>ROAS</Th>
            <Th>TACoS</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const spend = Number(r.spend ?? 0);
            const sales = Number(r.attributed_sales ?? 0);
            const totalSales = Number(r.total_sales ?? 0);
            const acos = r.acos === null ? null : Number(r.acos);
            const roas = r.roas === null ? null : Number(r.roas);
            const tacos = r.tacos === null ? null : Number(r.tacos);

            return (
              <tr key={r.campaign_id}>
                <Td>{r.campaign_name}</Td>
                <Td>${spend.toFixed(2)}</Td>
                <Td>${sales.toFixed(2)}</Td>
                <Td>${totalSales.toFixed(2)}</Td>
                <Td>{acos === null ? "—" : `${(acos * 100).toFixed(2)}%`}</Td>
                <Td>{roas === null ? "—" : roas.toFixed(2)}</Td>
                <Td>{tacos === null ? "—" : `${(tacos * 100).toFixed(2)}%`}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #e5e7eb" }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
      {children}
    </td>
  );
}

