"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Row = {
  campaign_id: string;
  campaign_name: string;
  date: string;
  spend: number;
};

type ChartPoint = {
  date: string;
  [key: string]: string | number; 
};

export function CampaignSpendChart({ rows }: { rows: Row[] }) {
  // reshape to { date, [campaignName]: spend }
  const byDate: Record<string, ChartPoint> = {};
  const names = new Set<string>();

  rows.forEach((r) => {
    names.add(r.campaign_name);
    byDate[r.date] = byDate[r.date] ?? { date: r.date };
    byDate[r.date][r.campaign_name] = Number(r.spend);
  });

  const data: ChartPoint[] = Object.values(byDate);
  const series = Array.from(names);

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((name) => (
            <Line key={name} type="monotone" dataKey={name} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
