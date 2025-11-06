-- Migration: create mcqs table for Supabase/Postgres
-- Run this in your Supabase SQL editor or psql against the 'public' schema.

create table public.mcqs (
  id uuid not null default gen_random_uuid(),
  exam text null,
  subject text null,
  topic text null,
  q text not null,
  options jsonb not null,
  answer text not null,
  explanation text null,
  year integer null,
  created_at timestamp with time zone null default now(),
  constraint mcqs_pkey primary key (id)
) TABLESPACE pg_default;

-- Example JSON structure for `options` column:
-- { "A": "option text A", "B": "option text B", "C": "option text C", "D": "option text D" }
