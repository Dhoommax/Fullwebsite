-- 001_create_profiles.sql

create table if not exists profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add index on role for admin queries
create index if not exists idx_profiles_role on profiles(role);
