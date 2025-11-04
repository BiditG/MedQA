-- Weekly Exam Codes table (run this in Supabase SQL editor)
-- Enable pgcrypto for gen_random_uuid (usually enabled by default in Supabase)
create extension if not exists pgcrypto;

create table if not exists public.weekly_codes (
  id uuid not null default gen_random_uuid(),
  code text not null,
  active boolean null default true,
  expires_at timestamp with time zone null,
  created_by text null,
  created_at timestamp with time zone null default now(),
  constraint weekly_codes_pkey primary key (id),
  constraint weekly_codes_code_key unique (code)
) tablespace pg_default;

-- Optional: enable Row Level Security (RLS) and keep no public policies; use service role key from server to manage.
alter table public.weekly_codes enable row level security;

-- Example policy if you ever want read-only access for authenticated users (not required for our current server-only usage):
-- create policy "weekly_codes_read" on public.weekly_codes
--   for select to authenticated using (true);

-- Indexes (unique on code already exists); consider adding expiration queries index
create index if not exists idx_weekly_codes_active_expires on public.weekly_codes (active, expires_at);
