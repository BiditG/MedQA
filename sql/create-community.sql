create extension if not exists pgcrypto;

alter table if exists public.profiles
  add column if not exists role text not null default 'student';

create table if not exists public.community_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  body text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  category_id uuid references public.community_categories(id) on delete set null,
  category_slug text not null,
  subject text not null default 'General'
    check (subject in ('Physics', 'Chemistry', 'Botany', 'Zoology', 'MAT', 'General')),
  topic text,
  tags text[] not null default '{}',
  post_type text not null default 'Doubt'
    check (post_type in ('Doubt', 'Discussion', 'Daily Question', 'Study Progress', 'Announcement', 'Success Story / Motivation')),
  status text not null default 'open'
    check (status in ('open', 'answered', 'closed')),
  is_pinned boolean not null default false,
  is_featured boolean not null default false,
  is_verified_by_medqas boolean not null default false,
  view_count integer not null default 0,
  reply_count integer not null default 0,
  upvote_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  body text not null,
  upvote_count integer not null default 0,
  is_verified_answer boolean not null default false,
  is_admin_reply boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_post_votes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.community_reply_votes (
  reply_id uuid not null references public.community_replies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reply_id, user_id)
);

create table if not exists public.community_saved_posts (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  post_id uuid references public.community_posts(id) on delete cascade,
  reply_id uuid references public.community_replies(id) on delete cascade,
  reason text not null default 'Needs moderator review',
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  check (
    (post_id is not null and reply_id is null) or
    (post_id is null and reply_id is not null)
  )
);

create index if not exists community_posts_category_created_idx
  on public.community_posts (category_slug, created_at desc);
create index if not exists community_posts_pinned_created_idx
  on public.community_posts (is_pinned, created_at desc);
create index if not exists community_posts_author_idx
  on public.community_posts (author_id, updated_at desc);
create index if not exists community_replies_post_idx
  on public.community_replies (post_id, is_verified_answer desc, upvote_count desc);
create index if not exists community_reports_status_idx
  on public.community_reports (status, created_at desc);

create or replace function public.set_community_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_community_posts_updated_at on public.community_posts;
create trigger set_community_posts_updated_at
before update on public.community_posts
for each row execute function public.set_community_updated_at();

drop trigger if exists set_community_replies_updated_at on public.community_replies;
create trigger set_community_replies_updated_at
before update on public.community_replies
for each row execute function public.set_community_updated_at();

create or replace function public.refresh_community_post_reply_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
      set reply_count = reply_count + 1,
          updated_at = now()
      where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.community_posts
      set reply_count = greatest(reply_count - 1, 0),
          updated_at = now()
      where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists refresh_community_post_reply_count_insert on public.community_replies;
create trigger refresh_community_post_reply_count_insert
after insert on public.community_replies
for each row execute function public.refresh_community_post_reply_count();

drop trigger if exists refresh_community_post_reply_count_delete on public.community_replies;
create trigger refresh_community_post_reply_count_delete
after delete on public.community_replies
for each row execute function public.refresh_community_post_reply_count();

create or replace function public.increment_community_post_view(post_id_input uuid)
returns void
language plpgsql
as $$
begin
  update public.community_posts
    set view_count = view_count + 1
    where id = post_id_input;
end;
$$;

alter table public.community_categories enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;
alter table public.community_post_votes enable row level security;
alter table public.community_reply_votes enable row level security;
alter table public.community_saved_posts enable row level security;
alter table public.community_reports enable row level security;

drop policy if exists "Community categories are public" on public.community_categories;
create policy "Community categories are public"
on public.community_categories for select
using (true);

drop policy if exists "Community posts are public" on public.community_posts;
create policy "Community posts are public"
on public.community_posts for select
using (true);

drop policy if exists "Community replies are public" on public.community_replies;
create policy "Community replies are public"
on public.community_replies for select
using (true);

-- The Next.js API uses SUPABASE_SERVICE_ROLE_KEY for writes and moderation.
-- Keep direct browser writes disabled by omission; this keeps moderation rules centralized.

insert into public.community_categories (name, slug, description, icon, color, sort_order) values
  ('Daily CEE Question', 'daily-cee-question', 'Admin-posted daily practice questions with answer discussion.', 'CalendarCheck', '#2563eb', 10),
  ('Ask a Doubt', 'ask-a-doubt', 'Focused academic doubts from CEE preparation.', 'HelpCircle', '#16a34a', 20),
  ('Physics', 'physics', 'Physics concepts, numericals, formulas, and MCQ reasoning.', 'Atom', '#7c3aed', 30),
  ('Chemistry', 'chemistry', 'Physical, organic, and inorganic chemistry discussions.', 'FlaskConical', '#0891b2', 40),
  ('Botany', 'botany', 'Plant biology, genetics, ecology, and high-yield Botany.', 'Sprout', '#15803d', 50),
  ('Zoology', 'zoology', 'Human physiology, animal diversity, and Zoology doubts.', 'Dna', '#be123c', 60),
  ('MAT', 'mat', 'Mental agility, reasoning, and MAT practice discussions.', 'Brain', '#ca8a04', 70),
  ('Mock Score Discussion', 'mock-score-discussion', 'Discuss mock results, weak areas, and improvement plans.', 'LineChart', '#0f766e', 80),
  ('Study Progress Wall', 'study-progress-wall', 'Share daily progress, consistency wins, and revision logs.', 'ClipboardCheck', '#4f46e5', 90),
  ('MEDQAS Announcements', 'medqas-announcements', 'Official MEDQAS updates, notes, mock tests, and CEE notices.', 'Megaphone', '#dc2626', 100),
  ('Success Stories / Motivation', 'success-stories-motivation', 'CEE motivation, recovery stories, and student milestones.', 'Trophy', '#ea580c', 110)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    icon = excluded.icon,
    color = excluded.color,
    sort_order = excluded.sort_order;
