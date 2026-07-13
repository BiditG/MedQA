import { NextResponse } from 'next/server'
import {
  communityCategories,
  postTypes,
  slugifyCommunity,
  splitTags,
  subjects,
} from '@/lib/community'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function GET(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ posts: data || [] })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load community posts' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const payload = await normalizeAdminCommunityPost(body, admin.authUser.id)

    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 },
      )
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('community_posts')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ post: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to create community post' },
      { status: 500 },
    )
  }
}

export async function normalizeAdminCommunityPost(body: any, authorId: string) {
  const supabase = getServiceClient()
  const requestedCategorySlug = normalizeCategorySlug(
    body.category_slug || body.categorySlug,
  )
  const postType = normalizePostType(
    body.post_type || body.postType,
    requestedCategorySlug,
  )
  const isAnnouncement = postType === 'Announcement'
  const categorySlug = isAnnouncement
    ? 'medqas-announcements'
    : requestedCategorySlug
  const { data: category } = await supabase
    .from('community_categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()

  const title = String(body.title || '').trim()

  return {
    title,
    slug:
      slugifyCommunity(String(body.slug || title)) ||
      `community-post-${Date.now().toString(36)}`,
    body: String(body.body || body.description || '').trim(),
    author_id: body.author_id || authorId,
    author_name: String(body.author_name || 'MEDQAS Team').trim(),
    category_id: category?.id || null,
    category_slug: categorySlug,
    subject: normalizeSubject(body.subject),
    topic: emptyToNull(body.topic),
    tags: splitTags(body.tags),
    post_type: postType,
    status: normalizeStatus(body.status),
    is_pinned: Boolean(body.is_pinned ?? body.isPinned),
    is_featured: Boolean(body.is_featured ?? body.isFeatured),
    is_verified_by_medqas: Boolean(
      body.is_verified_by_medqas ?? body.isVerifiedByMedqas ?? isAnnouncement,
    ),
  }
}

function normalizeSubject(value: unknown) {
  const subject = String(value || 'General')
  return (subjects as readonly string[]).includes(subject) ? subject : 'General'
}

function normalizePostType(value: unknown, categorySlug: string) {
  const requested = String(value || '')
  if ((postTypes as readonly string[]).includes(requested)) return requested
  if (categorySlug === 'medqas-announcements') return 'Announcement'
  return 'Discussion'
}

function normalizeStatus(value: unknown) {
  const status = String(value || 'open')
  return ['open', 'answered', 'closed'].includes(status) ? status : 'open'
}

function normalizeCategorySlug(value: unknown) {
  const slug = String(value || 'ask-a-doubt')
  return communityCategories.some((category) => category.slug === slug)
    ? slug
    : 'ask-a-doubt'
}

function emptyToNull(value: unknown) {
  const text = String(value || '').trim()
  return text ? text : null
}
