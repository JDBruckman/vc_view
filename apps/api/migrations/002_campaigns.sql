-- Campaigns (SP / SB / SD)
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  ad_profile_id uuid not null references ad_profiles(id) on delete cascade,

  amazon_campaign_id text not null,
  name text not null,
  ad_type text not null check (ad_type in ('SP', 'SB', 'SD')),
  status text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (ad_profile_id, amazon_campaign_id)
);

create index if not exists idx_campaigns_profile
  on campaigns(ad_profile_id);
