-- Run after sql/create-community.sql.
-- Supports automated daily mock exam code announcements.

alter table public.community_posts
  alter column author_id drop not null;

create unique index if not exists community_posts_slug_unique_idx
  on public.community_posts (slug)
  where slug is not null;

create index if not exists exam_codes_auto_label_idx
  on public.exam_codes (label)
  where label like 'Auto mock exam code%';

create index if not exists community_posts_auto_mock_announcements_idx
  on public.community_posts (post_type, created_at desc)
  where post_type = 'Announcement'
    and tags && array['mock-exam', 'exam-code']::text[];
