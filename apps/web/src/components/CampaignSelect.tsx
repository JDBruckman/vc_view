"use client";

type Campaign = {
  id: string;
  name: string;
  ad_type: string;
  status: string;
};

export function CampaignSelect({
  campaigns,
  selectedId,
  from,
  to,
}: {
  campaigns: Campaign[];
  selectedId: string;
  from: string;
  to: string;
}) {
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set("id", nextId);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    window.location.href = url.toString();
  }

  return (
    <label style={{ display: "block", marginTop: 16 }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
        Campaign
      </div>
      <select
        value={selectedId}
        onChange={onChange}
        style={{
          padding: 10,
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          minWidth: 320,
        }}
      >
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.ad_type})
          </option>
        ))}
      </select>
    </label>
  );
}
