import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function GET(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ posts: data || [] })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load posts' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const payload = normalizeBlogPayload(body)
    if (!payload.title || !payload.slug || !payload.content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 },
      )
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ post: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to create post' },
      { status: 500 },
    )
  }
}

function normalizeBlogPayload(body: any) {
  const status = body.status === 'published' ? 'published' : 'draft'
  const keywords =
    typeof body.keywords === 'string'
      ? body.keywords
          .split(',')
          .map((keyword: string) => keyword.trim())
          .filter(Boolean)
      : Array.isArray(body.keywords)
        ? body.keywords
        : []

  return {
    title: String(body.title || '').trim(),
    slug: slugify(String(body.slug || body.title || '')),
    excerpt: emptyToNull(body.excerpt),
    content: String(body.content || '').trim(),
    meta_title: emptyToNull(body.meta_title),
    meta_description: emptyToNull(body.meta_description),
    keywords,
    status,
    cta_label:
      emptyToNull(body.cta_label) || 'Try a free CEE mock quiz on MEDQAS',
    cta_href: emptyToNull(body.cta_href) || '/cee-mcqs',
    author_name: emptyToNull(body.author_name) || 'MEDQAS Team',
    published_at:
      status === 'published'
        ? body.published_at || new Date().toISOString()
        : emptyToNull(body.published_at),
  }
}

function emptyToNull(value: unknown) {
  const text = String(value || '').trim()
  return text ? text : null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
