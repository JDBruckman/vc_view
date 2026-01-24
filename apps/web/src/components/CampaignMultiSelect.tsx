"use client";

import { useRouter } from "next/navigation";

type Campaign = {
  id: string;
  name: string;
  ad_type: string;
  status: string;
};

export function CampaignMultiSelect({
  campaigns,
  selectedIds,
  from,
  to,
}: {
  campaigns: Campaign[];
  selectedIds: string[];
  from: string;
  to: string;
}) {
  const router = useRouter();

  function toggle(id: string) {
    const set = new Set(selectedIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);

    const nextIds = Array.from(set);

    const params = new URLSearchParams();
    params.set("ids", nextIds.join(","));
    params.set("from", from);
    params.set("to", to);

    router.push(`/compare?${params.toString()}`);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        Campaigns (select 1+)
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {campaigns.map((c) => {
          const checked = selectedIds.includes(c.id);
          return (
            <label
              key={c.id}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: 10,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(c.id)}
              />
              <span>
                {c.name} ({c.ad_type})
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
