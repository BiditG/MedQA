create table if not exists public.weekly_exam_results (
  id uuid primary key default gen_random_uuid(),
  exam_code_id uuid references public.exam_codes(id) on delete set null,
  exam_code text not null,
  participant_name text not null,
  anonymous boolean not null default false,
  total_score numeric(7, 2) not null default 0,
  biology_score numeric(7, 2) not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  unanswered_count integer not null default 0,
  answered_count integer not null default 0,
  total_questions integer not null default 0,
  subject_scores jsonb not null default '{}'::jsonb,
  is_reset boolean not null default false,
  reset_at timestamptz,
  submitted_at timestamptz not null default now()
);

create index if not exists weekly_exam_results_rank_idx
  on public.weekly_exam_results (
    is_reset,
    total_score desc,
    biology_score desc,
    submitted_at asc
  );

create index if not exists weekly_exam_results_submitted_idx
  on public.weekly_exam_results (submitted_at desc);

create index if not exists weekly_exam_results_code_idx
  on public.weekly_exam_results (exam_code_id, submitted_at desc);

alter table public.weekly_exam_results enable row level security;

drop policy if exists "Weekly leaderboard is publicly readable" on public.weekly_exam_results;
create policy "Weekly leaderboard is publicly readable"
on public.weekly_exam_results
for select
using (is_reset = false);

-- Inserts and resets are performed by server routes using SUPABASE_SERVICE_ROLE_KEY.
