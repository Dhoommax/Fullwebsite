-- 002_create_app_settings.sql

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  type text default 'string',
  updated_at timestamptz default now()
);
