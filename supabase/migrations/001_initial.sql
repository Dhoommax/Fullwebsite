-- supabase/migrations/001_initial.sql

-- Initial schema for Codex AI Studio

create extension if not exists "pgcrypto";

-- profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  email text,
  avatar_url text,
  bio text,
  role text not null default 'user',
  plan_id uuid,
  credits bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_user_id on profiles(user_id);

-- projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  type text,
  status text default 'active',
  thumbnail text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_user on projects(user_id);

-- project_files
create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  path text not null,
  name text not null,
  size bigint,
  mime text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_project_files_project on project_files(project_id);

-- conversations & messages
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null,
  content text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_conversation on messages(conversation_id);

-- generations & usage_logs
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid references projects(id),
  generation_type text not null,
  provider text,
  provider_job_id text,
  credits_used bigint default 0,
  status text default 'pending',
  result_url text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid,
  generation_id uuid references generations(id),
  action text,
  provider text,
  credits bigint default 0,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- credit accounts & transactions
create table if not exists credit_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  balance bigint not null default 0,
  currency text default 'credits',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists idx_credit_accounts_user on credit_accounts(user_id);

create table if not exists credit_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references credit_accounts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  amount bigint not null,
  balance_after bigint not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_credit_transactions_account on credit_transactions(account_id);

-- plans & subscriptions
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  credits bigint default 0,
  price_cents bigint default 0,
  features jsonb default '{}',
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid references plans(id),
  status text,
  current_period_end timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  body text,
  level text default 'info',
  read boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id);

-- admin_logs
create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  action text,
  target_user uuid,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- RLS: ensure only owners can access their records

-- Enable RLS on relevant tables
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_files enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table generations enable row level security;
alter table usage_logs enable row level security;
alter table credit_accounts enable row level security;
alter table credit_transactions enable row level security;
alter table notifications enable row level security;

-- Profiles policies
create policy "profiles_self" on profiles
  for all
  using (auth.role() = 'service_role' or user_id = auth.uid())
  with check (auth.role() = 'service_role' or user_id = auth.uid());

-- Projects
create policy "projects_owner" on projects
  for all
  using (exists (select 1 from profiles p where p.id = projects.user_id and (p.user_id = auth.uid() or auth.role() = 'service_role')))
  with check (exists (select 1 from profiles p where p.id = projects.user_id and (p.user_id = auth.uid() or auth.role() = 'service_role')));

-- Project files
create policy "project_files_owner" on project_files
  for all
  using (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')
  with check (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role');

-- Conversations & messages
create policy "conversations_owner" on conversations
  for all
  using (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')
  with check (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role');

create policy "messages_owner" on messages
  for all
  using (exists (select 1 from conversations c where c.id = messages.conversation_id and (c.user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')))
  with check (exists (select 1 from conversations c where c.id = messages.conversation_id and (c.user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')));

-- Generations & usage_logs
create policy "generations_owner" on generations
  for all
  using (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')
  with check (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role');

create policy "usage_logs_owner" on usage_logs
  for all
  using (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')
  with check (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role');

-- Credit accounts & transactions
create policy "credit_accounts_owner" on credit_accounts
  for all
  using (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')
  with check (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role');

create policy "credit_transactions_owner" on credit_transactions
  for all
  using (exists (select 1 from credit_accounts ca where ca.id = credit_transactions.account_id and (ca.user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')))
  with check (exists (select 1 from credit_accounts ca where ca.id = credit_transactions.account_id and (ca.user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')));

-- Notifications
create policy "notifications_owner" on notifications
  for all
  using (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role')
  with check (user_id = (select id from profiles where user_id = auth.uid()) or auth.role() = 'service_role');

-- RPC functions for credits

-- deduct_credits(user_profile_id uuid, amount bigint, generation_id uuid)
create or replace function deduct_credits(p_user_id uuid, p_amount bigint, p_generation_id uuid default null)
returns jsonb as $$
declare
  acct_id uuid;
  current_balance bigint;
  new_balance bigint;
  tx_id uuid;
begin
  if p_amount < 0 then
    raise exception 'invalid amount';
  end if;
  select id into acct_id from credit_accounts where user_id = p_user_id for update;
  if acct_id is null then
    -- create account
    insert into credit_accounts(user_id, balance) values (p_user_id, 0) returning id into acct_id;
    current_balance := 0;
  else
    select balance into current_balance from credit_accounts where id = acct_id for update;
  end if;
  if current_balance < p_amount then
    raise exception 'insufficient_credits';
  end if;
  new_balance := current_balance - p_amount;
  update credit_accounts set balance = new_balance, updated_at = now() where id = acct_id;
  insert into credit_transactions(account_id, user_id, action, amount, balance_after, created_at) values (acct_id, p_user_id, 'deduct', -p_amount, new_balance, now()) returning id into tx_id;
  if p_generation_id is not null then
    update generations set credits_used = p_amount, status = 'completed', updated_at = now() where id = p_generation_id;
    insert into usage_logs(user_id, generation_id, action, provider, credits, created_at) values (p_user_id, p_generation_id, 'deduct_credits', null, p_amount, now());
  end if;
  return jsonb_build_object('ok', true, 'balance', new_balance, 'tx', tx_id);
end;
$$ language plpgsql stable;

create or replace function add_credits(p_user_id uuid, p_amount bigint)
returns jsonb as $$
declare
  acct_id uuid;
  current_balance bigint;
  new_balance bigint;
  tx_id uuid;
begin
  if p_amount < 0 then
    raise exception 'invalid amount';
  end if;
  select id into acct_id from credit_accounts where user_id = p_user_id for update;
  if acct_id is null then
    insert into credit_accounts(user_id, balance) values (p_user_id, p_amount) returning id into acct_id;
    new_balance := p_amount;
  else
    select balance into current_balance from credit_accounts where id = acct_id for update;
    new_balance := current_balance + p_amount;
    update credit_accounts set balance = new_balance, updated_at = now() where id = acct_id;
  end if;
  insert into credit_transactions(account_id, user_id, action, amount, balance_after, created_at) values (acct_id, p_user_id, 'add', p_amount, new_balance, now()) returning id into tx_id;
  return jsonb_build_object('ok', true, 'balance', new_balance, 'tx', tx_id);
end;
$$ language plpgsql stable;

create or replace function get_credit_balance(p_user_id uuid)
returns bigint as $$
declare
  acct_balance bigint;
begin
  select balance into acct_balance from credit_accounts where user_id = p_user_id;
  if acct_balance is null then
    return 0;
  end if;
  return acct_balance;
end;
$$ language plpgsql stable;

-- trigger to maintain updated_at
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_touch before update on projects for each row execute procedure touch_updated_at();
create trigger profiles_touch before update on profiles for each row execute procedure touch_updated_at();
create trigger generations_touch before update on generations for each row execute procedure touch_updated_at();

-- storage policies will be created separately

