-- Accounts (the company / vendor org)
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Ad profiles (Amazon Ads profiles, per marketplace)
create table if not exists ad_profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  marketplace text not null,
  timezone text not null,
  created_at timestamptz not null default now()
);
