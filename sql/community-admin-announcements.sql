-- Run sql/create-community.sql first.
-- This file adds announcement-specific helpers for the MEDQAS community system.

create index if not exists community_posts_announcements_created_idx
  on public.community_posts (post_type, created_at desc)
  where post_type = 'Announcement';

create index if not exists community_posts_announcements_pinned_idx
  on public.community_posts (post_type, is_pinned, created_at desc)
  where post_type = 'Announcement';

insert into public.community_categories (
  name,
  slug,
  description,
  icon,
  color,
  sort_order
) values (
  'MEDQAS Announcements',
  'medqas-announcements',
  'Official MEDQAS updates, notes, mock tests, CEE updates, and notices.',
  'Megaphone',
  '#dc2626',
  100
) on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    icon = excluded.icon,
    color = excluded.color,
    sort_order = excluded.sort_order;

-- Optional example insert. Replace author_id with an admin user's auth.users.id
-- before running if you want to seed a first announcement.
--
-- insert into public.community_posts (
--   title,
--   slug,
--   body,
--   author_id,
--   author_name,
--   category_slug,
--   subject,
--   post_type,
--   status,
--   is_pinned,
--   is_verified_by_medqas
-- ) values (
--   'New MEDQAS CEE resources are available',
--   'new-medqas-cee-resources',
--   'We have added new CEE preparation resources. Check the relevant sections and continue practicing daily.',
--   '00000000-0000-0000-0000-000000000000',
--   'MEDQAS Team',
--   'medqas-announcements',
--   'General',
--   'Announcement',
--   'open',
--   true,
--   true
-- );
