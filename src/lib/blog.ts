import { notFound } from 'next/navigation'
import { getDataClient } from '@/utils/supabase-data'

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  meta_title: string | null
  meta_description: string | null
  keywords: string[] | null
  status: 'draft' | 'published'
  cta_label: string | null
  cta_href: string | null
  author_name: string | null
  published_at: string | null
  updated_at: string | null
  created_at: string | null
}

const BLOG_SELECT =
  'id,title,slug,excerpt,content,meta_title,meta_description,keywords,status,cta_label,cta_href,author_name,published_at,updated_at,created_at'

export async function getPublishedBlogPosts() {
  const supabase = getDataClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data || []) as BlogPost[]
}

export async function getPublishedBlogPost(slug: string) {
  const supabase = getDataClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(BLOG_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!data) notFound()
  return data as BlogPost
}

export async function getBlogSlugs() {
  const supabase = getDataClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')

  if (error) return []
  return (data || []).map((post) => post.slug as string)
}
