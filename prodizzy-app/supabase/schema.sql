-- Run this in your Supabase SQL editor

create table if not exists companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  website    text,
  stage      text,
  slug       text unique not null,
  created_at timestamptz default now()
);

create table if not exists priorities (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  type       text not null,
  details    text default ''
);

create table if not exists inbound (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name       text not null,
  company    text not null,
  linkedin   text default '',
  website    text default '',
  category   text not null,
  why        text not null,
  relevant   text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table companies enable row level security;
alter table priorities enable row level security;
alter table inbound    enable row level security;

-- Public policies (auth deferred — tighten when auth is added)
create policy "public_read_companies"   on companies for select using (true);
create policy "public_insert_companies" on companies for insert with check (true);
create policy "public_read_priorities"  on priorities for select using (true);
create policy "public_insert_priorities" on priorities for insert with check (true);
create policy "public_insert_inbound"   on inbound for insert with check (true);
create policy "public_read_inbound"     on inbound for select using (true);
