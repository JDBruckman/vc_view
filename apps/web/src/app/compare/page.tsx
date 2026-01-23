type CampaignRow = {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  attributed_sales: string;
  acos: string | null;
  roas: string | null;
};

export default async function ComparePage() {

  const ids = ["b71d78cc-277c-49af-9cf0-455457a236e2"];
  const from = "2026-01-20";
  const to = "2026-01-22";

  const params = new URLSearchParams({
    ids: ids.join(","),
    from,
    to,
  });

  const res = await fetch(`http://localhost:4000/metrics/campaigns?${params}`, {
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
            <Th>ACoS</Th>
            <Th>ROAS</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const spend = Number(r.spend ?? 0);
            const sales = Number(r.attributed_sales ?? 0);
            const acos = r.acos === null ? null : Number(r.acos);
            const roas = r.roas === null ? null : Number(r.roas);

            return (
              <tr key={r.campaign_id}>
                <Td>{r.campaign_name}</Td>
                <Td>${spend.toFixed(2)}</Td>
                <Td>${sales.toFixed(2)}</Td>
                <Td>{acos === null ? "—" : `${(acos * 100).toFixed(2)}%`}</Td>
                <Td>{roas === null ? "—" : roas.toFixed(2)}</Td>
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
