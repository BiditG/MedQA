-- CEE Rankbreaker. Apply this migration in Supabase before enabling the feature.
create extension if not exists pgcrypto;

create table if not exists public.cee_rankbreaker_editions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  marks_correct numeric(4,2) not null default 1 check (marks_correct = 1),
  marks_incorrect numeric(4,2) not null default 0.25 check (marks_incorrect = 0.25),
  seconds_per_question integer not null default 60 check (seconds_per_question = 60),
  review_released boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cee_rankbreaker_questions (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.cee_rankbreaker_editions(id) on delete cascade,
  external_id text not null,
  subject text not null check (subject in ('Physics', 'Chemistry', 'Zoology', 'Botany', 'Mental Agility Test')),
  chapter text not null,
  topic text not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  answer char(1) not null check (answer in ('A', 'B', 'C', 'D')),
  explanation text not null default '',
  position integer not null check (position between 1 and 200),
  created_at timestamptz not null default now(),
  unique (edition_id, external_id),
  unique (edition_id, position)
);

create table if not exists public.cee_rankbreaker_access_codes (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.cee_rankbreaker_editions(id) on delete cascade,
  code_digest text not null unique,
  code_value text not null,
  label text,
  active boolean not null default true,
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0),
  created_at timestamptz not null default now()
);
alter table public.cee_rankbreaker_access_codes add column if not exists code_value text;

create table if not exists public.cee_rankbreaker_attempts (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.cee_rankbreaker_editions(id) on delete restrict,
  access_code_id uuid references public.cee_rankbreaker_access_codes(id) on delete set null,
  account_id uuid references auth.users(id) on delete set null,
  participant_name text not null,
  whatsapp_normalized text not null,
  rules_accepted_at timestamptz not null,
  status text not null default 'registered' check (status in ('registered', 'started', 'finalized', 'reset')),
  ever_started boolean not null default false,
  current_position integer not null default 1 check (current_position between 1 and 200),
  current_question_id uuid references public.cee_rankbreaker_questions(id) on delete restrict,
  question_started_at timestamptz,
  question_deadline_at timestamptz,
  started_at timestamptz,
  submitted_at timestamptz,
  completion_seconds integer,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  unanswered_count integer not null default 200,
  net_marks numeric(7,2) not null default 0,
  accuracy numeric(7,2) not null default 0,
  subject_performance jsonb not null default '{}'::jsonb,
  reset_at timestamptz,
  created_at timestamptz not null default now(),
  unique (edition_id, whatsapp_normalized)
);
create unique index if not exists cee_rankbreaker_attempt_account_once
  on public.cee_rankbreaker_attempts (edition_id, account_id) where account_id is not null;
create index if not exists cee_rankbreaker_attempt_rank_idx on public.cee_rankbreaker_attempts
  (edition_id, status, net_marks desc, accuracy desc, completion_seconds asc, submitted_at asc);

create table if not exists public.cee_rankbreaker_answers (
  attempt_id uuid not null references public.cee_rankbreaker_attempts(id) on delete cascade,
  question_id uuid not null references public.cee_rankbreaker_questions(id) on delete restrict,
  selected_answer char(1) check (selected_answer is null or selected_answer in ('A', 'B', 'C', 'D')),
  saved_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create table if not exists public.cee_rankbreaker_actions (
  attempt_id uuid not null references public.cee_rankbreaker_attempts(id) on delete cascade,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (attempt_id, request_id)
);

-- Questions and scoring cannot be changed once anyone has started the edition.
create or replace function public.cee_rankbreaker_freeze_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from cee_rankbreaker_attempts where edition_id = case when tg_op = 'DELETE' then old.edition_id else new.edition_id end and ever_started) then
    raise exception 'This edition is frozen because attempts have started';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
drop trigger if exists cee_rankbreaker_question_freeze on public.cee_rankbreaker_questions;
create trigger cee_rankbreaker_question_freeze before update or delete on public.cee_rankbreaker_questions
for each row execute function public.cee_rankbreaker_freeze_guard();
drop trigger if exists cee_rankbreaker_edition_freeze on public.cee_rankbreaker_editions;
create trigger cee_rankbreaker_edition_freeze before update on public.cee_rankbreaker_editions
for each row when (old.status <> 'draft') execute function public.cee_rankbreaker_freeze_guard();

create or replace function public.cee_rankbreaker_finalize(p_attempt_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_started timestamptz; v_submitted timestamptz := clock_timestamp();
begin
  select started_at into v_started from cee_rankbreaker_attempts where id = p_attempt_id for update;
  if v_started is null then return; end if;
  update cee_rankbreaker_attempts a set
    status = 'finalized', submitted_at = v_submitted,
    completion_seconds = greatest(0, floor(extract(epoch from (v_submitted - v_started)))::integer),
    correct_count = s.correct_count,
    incorrect_count = s.incorrect_count,
    unanswered_count = s.unanswered_count,
    net_marks = s.correct_count - (s.incorrect_count * .25),
    accuracy = case when s.correct_count + s.incorrect_count = 0 then 0 else round((s.correct_count::numeric * 100) / (s.correct_count + s.incorrect_count), 2) end,
    subject_performance = s.subject_performance
  from (
    with subject_scores as (
      select q.subject,
        count(*) filter (where an.selected_answer = q.answer)::integer as correct_count,
        count(*) filter (where an.selected_answer is not null and an.selected_answer <> q.answer)::integer as incorrect_count,
        count(*) filter (where an.selected_answer is null)::integer as unanswered_count
      from cee_rankbreaker_questions q
      left join cee_rankbreaker_answers an on an.question_id = q.id and an.attempt_id = p_attempt_id
      where q.edition_id = (select edition_id from cee_rankbreaker_attempts where id = p_attempt_id)
      group by q.subject
    ), totals as (
      select coalesce(sum(correct_count), 0)::integer as correct_count,
        coalesce(sum(incorrect_count), 0)::integer as incorrect_count,
        coalesce(sum(unanswered_count), 0)::integer as unanswered_count
      from subject_scores
    )
    select totals.correct_count, totals.incorrect_count, totals.unanswered_count,
      coalesce((select jsonb_object_agg(subject, jsonb_build_object('correct', correct_count, 'incorrect', incorrect_count, 'unanswered', unanswered_count, 'marks', correct_count - (incorrect_count * .25))) from subject_scores), '{}'::jsonb) as subject_performance
    from totals
  ) s where a.id = p_attempt_id and a.status = 'started';
end $$;

-- One transaction for replacement imports: a failed insert rolls back the preceding delete.
create or replace function public.cee_rankbreaker_replace_questions(p_edition_id uuid, p_questions jsonb) returns integer
language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if (select status from cee_rankbreaker_editions where id = p_edition_id for update) <> 'draft' then
    raise exception 'Only draft editions can be imported';
  end if;
  delete from cee_rankbreaker_questions where edition_id = p_edition_id;
  insert into cee_rankbreaker_questions (edition_id, external_id, subject, chapter, topic, question, option_a, option_b, option_c, option_d, answer, explanation, position)
  select p_edition_id, r.external_id, r.subject, r.chapter, r.topic, r.question, r.option_a, r.option_b, r.option_c, r.option_d, r.answer, r.explanation, r.position
  from jsonb_to_recordset(p_questions) as r(external_id text, subject text, chapter text, topic text, question text, option_a text, option_b text, option_c text, option_d text, answer char(1), explanation text, position integer);
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- Locks the access-code row so use limits and duplicate registrations are enforced atomically.
create or replace function public.cee_rankbreaker_register(p_code_digest text, p_name text, p_phone text, p_account_id uuid default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare c cee_rankbreaker_access_codes%rowtype; v_attempt uuid; v_existing_status text;
begin
  select ac.* into c from cee_rankbreaker_access_codes ac
    join cee_rankbreaker_editions e on e.id = ac.edition_id
    where ac.code_digest = p_code_digest and e.status = 'published'
    for update of ac;
  if not found then
    raise exception 'Invalid, expired, disabled, or unavailable access code';
  end if;
  if not c.active or (c.expires_at is not null and c.expires_at <= clock_timestamp()) or (c.max_uses is not null and c.use_count >= c.max_uses) then
    raise exception 'Invalid, expired, disabled, or unavailable access code';
  end if;
  select id, status into v_attempt, v_existing_status
  from cee_rankbreaker_attempts
  where edition_id = c.edition_id
    and (whatsapp_normalized = p_phone or (p_account_id is not null and account_id = p_account_id))
  limit 1;
  if v_attempt is not null and v_existing_status = 'registered' then
    return v_attempt;
  end if;
  if v_attempt is not null then
    raise exception 'Only one ranked attempt is allowed for this exam edition';
  end if;
  insert into cee_rankbreaker_attempts(edition_id,access_code_id,account_id,participant_name,whatsapp_normalized,rules_accepted_at)
    values(c.edition_id,c.id,p_account_id,p_name,p_phone,clock_timestamp()) returning id into v_attempt;
  update cee_rankbreaker_access_codes set use_count=use_count+1 where id=c.id;
  return v_attempt;
end $$;

create or replace function public.cee_rankbreaker_reconcile_attempt(p_attempt_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a cee_rankbreaker_attempts%rowtype; qid uuid;
begin
  select * into a from cee_rankbreaker_attempts where id = p_attempt_id for update;
  if not found then raise exception 'Attempt not found'; end if;
  while a.status = 'started' and a.question_deadline_at <= clock_timestamp() loop
    if a.current_position >= 200 then
      perform cee_rankbreaker_finalize(a.id); select * into a from cee_rankbreaker_attempts where id=a.id; exit;
    end if;
    select id into qid from cee_rankbreaker_questions where edition_id=a.edition_id and position=a.current_position + 1;
    update cee_rankbreaker_attempts set current_position=current_position+1, current_question_id=qid,
      question_started_at=clock_timestamp(), question_deadline_at=clock_timestamp()+interval '60 seconds' where id=a.id;
    select * into a from cee_rankbreaker_attempts where id=a.id for update;
  end loop;
  return jsonb_build_object('status', a.status, 'position', a.current_position, 'questionId', a.current_question_id,
    'deadlineAt', a.question_deadline_at, 'startedAt', a.started_at);
end $$;

create or replace function public.cee_rankbreaker_start_attempt(p_attempt_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a cee_rankbreaker_attempts%rowtype; qid uuid;
begin
  select * into a from cee_rankbreaker_attempts where id=p_attempt_id for update;
  if not found then raise exception 'Attempt not found'; end if;
  if a.status = 'registered' then
    select id into qid from cee_rankbreaker_questions where edition_id=a.edition_id and position=1;
    if qid is null then raise exception 'Published edition has no questions'; end if;
    update cee_rankbreaker_attempts set status='started', ever_started=true, started_at=clock_timestamp(), current_question_id=qid,
      question_started_at=clock_timestamp(), question_deadline_at=clock_timestamp()+interval '60 seconds' where id=a.id;
  end if;
  return cee_rankbreaker_reconcile_attempt(p_attempt_id);
end $$;

create or replace function public.cee_rankbreaker_save_answer(p_attempt_id uuid, p_question_id uuid, p_answer char(1)) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a cee_rankbreaker_attempts%rowtype;
begin
  perform cee_rankbreaker_reconcile_attempt(p_attempt_id);
  select * into a from cee_rankbreaker_attempts where id=p_attempt_id for update;
  if a.status <> 'started' then return cee_rankbreaker_reconcile_attempt(p_attempt_id); end if;
  if a.current_question_id <> p_question_id then raise exception 'Question is locked or no longer active'; end if;
  if a.question_deadline_at <= clock_timestamp() then raise exception 'Question deadline has passed'; end if;
  if p_answer is null then delete from cee_rankbreaker_answers where attempt_id=a.id and question_id=p_question_id;
  else insert into cee_rankbreaker_answers(attempt_id, question_id, selected_answer, saved_at) values(a.id,p_question_id,p_answer,clock_timestamp())
    on conflict(attempt_id,question_id) do update set selected_answer=excluded.selected_answer, saved_at=excluded.saved_at;
  end if;
  return cee_rankbreaker_reconcile_attempt(p_attempt_id);
end $$;

create or replace function public.cee_rankbreaker_advance_attempt(p_attempt_id uuid, p_expected_position integer, p_request_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a cee_rankbreaker_attempts%rowtype; qid uuid;
begin
  if not exists (select 1 from cee_rankbreaker_actions where attempt_id=p_attempt_id and request_id=p_request_id) then
    insert into cee_rankbreaker_actions(attempt_id,request_id) values(p_attempt_id,p_request_id) on conflict do nothing;
  else return cee_rankbreaker_reconcile_attempt(p_attempt_id); end if;
  perform cee_rankbreaker_reconcile_attempt(p_attempt_id);
  select * into a from cee_rankbreaker_attempts where id=p_attempt_id for update;
  if a.status <> 'started' then return cee_rankbreaker_reconcile_attempt(p_attempt_id); end if;
  if a.current_position <> p_expected_position then raise exception 'Stale question advance'; end if;
  if a.current_position = 200 then perform cee_rankbreaker_finalize(a.id); return cee_rankbreaker_reconcile_attempt(p_attempt_id); end if;
  select id into qid from cee_rankbreaker_questions where edition_id=a.edition_id and position=a.current_position+1;
  update cee_rankbreaker_attempts set current_position=current_position+1,current_question_id=qid,
    question_started_at=clock_timestamp(),question_deadline_at=clock_timestamp()+interval '60 seconds' where id=a.id;
  return cee_rankbreaker_reconcile_attempt(p_attempt_id);
end $$;

-- Tables are only read through Next.js service routes. This keeps numbers, answer keys, and codes private.
alter table public.cee_rankbreaker_editions enable row level security;
alter table public.cee_rankbreaker_questions enable row level security;
alter table public.cee_rankbreaker_access_codes enable row level security;
alter table public.cee_rankbreaker_attempts enable row level security;
alter table public.cee_rankbreaker_answers enable row level security;
alter table public.cee_rankbreaker_actions enable row level security;
revoke all on table public.cee_rankbreaker_editions, public.cee_rankbreaker_questions, public.cee_rankbreaker_access_codes, public.cee_rankbreaker_attempts, public.cee_rankbreaker_answers, public.cee_rankbreaker_actions from anon, authenticated;
revoke all on function public.cee_rankbreaker_finalize(uuid), public.cee_rankbreaker_reconcile_attempt(uuid), public.cee_rankbreaker_start_attempt(uuid), public.cee_rankbreaker_save_answer(uuid,uuid,char), public.cee_rankbreaker_advance_attempt(uuid,integer,uuid) from public;
revoke all on function public.cee_rankbreaker_replace_questions(uuid,jsonb) from public;
revoke all on function public.cee_rankbreaker_register(text,text,text,uuid) from public;
