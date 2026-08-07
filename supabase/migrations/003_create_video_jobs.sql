-- 003_create_video_jobs.sql

create table if not exists video_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  file_url text not null,
  status text not null default 'queued',
  progress int default 0,
  output_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_video_jobs_user on video_jobs(user_id);
create index if not exists idx_video_jobs_status on video_jobs(status);
