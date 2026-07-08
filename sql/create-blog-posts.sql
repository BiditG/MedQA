create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  meta_title text,
  meta_description text,
  keywords text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  cta_label text not null default 'Try a free CEE mock quiz on MEDQAS',
  cta_href text not null default '/cee-mcqs',
  author_name text default 'MEDQAS Team',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_slug_idx
  on public.blog_posts (slug);

create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;

create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Published blog posts are public" on public.blog_posts;
create policy "Published blog posts are public"
on public.blog_posts
for select
using (status = 'published');

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  meta_title,
  meta_description,
  keywords,
  status,
  cta_label,
  cta_href,
  author_name,
  published_at
) values
(
  'CEE Syllabus 2026: Complete CEE Nepal Syllabus for MBBS, BDS and Health Science Entrance',
  'cee-syllabus-2026',
  'A focused guide to the CEE syllabus 2026 for Nepal medical entrance aspirants, including Physics, Chemistry, Botany, Zoology, marks focus and study planning.',
  '# CEE Syllabus 2026: Complete CEE Nepal Syllabus for MBBS, BDS and Health Science Entrance

If you are searching for **CEE syllabus 2026**, this guide gives you the main subject areas CEE aspirants in Nepal should prepare before starting mock tests.

## CEE Syllabus 2026 Overview

The CEE Nepal entrance exam usually tests core concepts from Physics, Chemistry, Botany and Zoology. Your first goal should be to finish the high-yield chapters, then revise through MCQs and previous-style questions.

## Physics Topics for CEE Nepal

Focus on mechanics, heat and thermodynamics, waves, optics, electricity, magnetism, modern physics and basic electronics. Physics preparation improves fastest when you solve numerical MCQs every day.

## Chemistry Topics for CEE Nepal

Read physical chemistry formulas, inorganic trends and organic reaction logic. For CEE 2026, keep a separate notebook for named reactions, exceptions and repeated question patterns.

## Biology Topics for CEE Nepal

Biology carries heavy scoring potential. Cover cell biology, genetics, plant physiology, human physiology, ecology, evolution, diversity and biotechnology with diagram-based revision.

## How to Use the CEE Syllabus 2026

Do not only read the syllabus. Convert each chapter into three tasks: revise notes, solve MCQs, and review mistakes. MEDQAS can help you practice CEE-style questions by subject and topic.',
  'CEE Syllabus 2026: Complete CEE Nepal Syllabus | MEDQAS',
  'Read the CEE syllabus 2026 for Nepal medical entrance preparation, including Physics, Chemistry, Botany, Zoology and study strategy for CEE aspirants.',
  array['CEE syllabus 2026', 'CEE Nepal syllabus', 'medical entrance Nepal', 'CEE MBBS syllabus'],
  'published',
  'Try a free CEE mock quiz on MEDQAS',
  '/cee-mcqs',
  'MEDQAS Team',
  now()
),
(
  'Best Books for CEE Nepal 2026: Physics, Chemistry and Biology Book List',
  'best-books-for-cee-nepal',
  'A practical guide to the best books for CEE Nepal aspirants, with subject-wise advice for Physics, Chemistry and Biology preparation.',
  '# Best Books for CEE Nepal 2026: Physics, Chemistry and Biology Book List

Students often search for **best books for CEE Nepal** because the right resources save time. The best book is not always the biggest book; it is the one you can revise repeatedly and pair with MCQ practice.

## Best Physics Books for CEE Nepal

Use a clear theory book for concepts and a separate MCQ source for speed. For Physics, prioritize solved examples, formula summaries and entrance-level numerical questions.

## Best Chemistry Books for CEE Nepal

Choose books that separate physical, organic and inorganic chemistry. Physical chemistry needs formula practice, organic chemistry needs reaction maps, and inorganic chemistry needs repeated revision.

## Best Biology Books for CEE Nepal

Biology preparation should start with standard textbook concepts, then move into high-yield notes and MCQs. Diagrams, tables and one-line facts are especially useful for final revision.

## How MEDQAS Fits With CEE Books

Books build your foundation, but MCQs test whether you can recall and apply that knowledge under pressure. After each chapter, practice CEE questions on MEDQAS and track weak topics.',
  'Best Books for CEE Nepal 2026: Subject-wise Guide | MEDQAS',
  'Find the best books for CEE Nepal 2026 preparation with subject-wise advice for Physics, Chemistry and Biology plus MCQ practice strategy.',
  array['best books for CEE Nepal', 'CEE Nepal books', 'CEE preparation books', 'medical entrance books Nepal'],
  'published',
  'Try a free CEE mock quiz on MEDQAS',
  '/cee-mcqs',
  'MEDQAS Team',
  now()
)
on conflict (slug) do nothing;
