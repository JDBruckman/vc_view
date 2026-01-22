-- Total daily sales (for TACoS)
create table if not exists daily_sales (
  id uuid primary key default gen_random_uuid(),

  account_id uuid not null references accounts(id) on delete cascade,
  date date not null,

  total_sales numeric(14,2) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (account_id, date)
);

create index if not exists idx_daily_sales_account_date
  on daily_sales(account_id, date);

create index if not exists idx_daily_sales_date
  on daily_sales(date);
