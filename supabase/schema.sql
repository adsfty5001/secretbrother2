-- Secretclass minimal schema (Supabase Postgres)
-- Run in Supabase SQL editor.

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists usernames (
  username text primary key,
  user_id uuid not null references auth.users(id) on delete cascade
);

create table if not exists members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pay_status text not null default 'none',
  role text not null default 'user',
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  merchant_uid text primary key,
  amount numeric not null,
  name text not null,
  status text not null default 'ready',
  created_at timestamptz not null default now()
);

create table if not exists purchases (
  merchant_uid text primary key references orders(merchant_uid) on delete cascade,
  imp_uid text,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  status text not null,
  raw jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
alter table usernames enable row level security;
alter table members enable row level security;
alter table orders enable row level security;
alter table purchases enable row level security;

-- profiles: owner can read, server writes via service role
create policy "profiles_read_own" on profiles for select
  using (auth.uid() = user_id);

-- usernames: public can select username->user_id (아이디 존재 확인 용도)
create policy "usernames_select_all" on usernames for select
  using (true);

-- members: owner can read own
create policy "members_read_own" on members for select
  using (auth.uid() = user_id);

-- orders: deny client (server only)
create policy "orders_deny_all" on orders for all
  using (false) with check (false);

-- purchases: owner can read own
create policy "purchases_read_own" on purchases for select
  using (auth.uid() = user_id);

-- Optionally: allow authenticated users to insert their own profiles/usernames/members if you prefer client-side setup.
-- In this starter, we use server (service role) after signup.
