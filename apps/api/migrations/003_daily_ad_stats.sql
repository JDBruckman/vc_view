-- Daily ad performance at (campaign, date)
create table if not exists daily_ad_stats (
  id uuid primary key default gen_random_uuid(),

  campaign_id uuid not null references campaigns(id) on delete cascade,
  date date not null,

  impressions bigint not null default 0,
  clicks bigint not null default 0,
  cost numeric(12,2) not null default 0, -- ad spend

  attributed_sales numeric(14,2) not null default 0,
  attributed_orders bigint not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (campaign_id, date)
);

create index if not exists idx_daily_ad_stats_campaign_date
  on daily_ad_stats(campaign_id, date);

create index if not exists idx_daily_ad_stats_date
  on daily_ad_stats(date);
