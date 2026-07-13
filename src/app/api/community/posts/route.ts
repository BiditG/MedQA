import { NextResponse } from 'next/server'
import {
  communityCategories,
  isModeratorRole,
  postTypes,
  slugifyCommunity,
  splitTags,
  subjects,
} from '@/lib/community'
import {
  ensureProfile,
  getServiceClient,
  getUserFromRequest,
} from '@/utils/supabase-server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const supabase = getServiceClient()
    let query = supabase.from('community_posts').select('*')

    const category = searchParams.get('category')
    const authorId = searchParams.get('authorId')
    if (category) query = query.eq('category_slug', category)
    if (authorId) query = query.eq('author_id', authorId)

    const { data, error } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Number(searchParams.get('limit') || 30))

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
    const { user } = await getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const profile = await ensureProfile(user.id, user.email)
    const body = await req.json().catch(() => ({}))
    const categorySlug = normalizeCategorySlug(body.categorySlug)
    const categoryMeta = communityCategories.find(
      (category) => category.slug === categorySlug,
    )
    const postType = normalizePostType(body.postType, categorySlug)
    const isModerator = isModeratorRole(profile?.role)

    if (postType === 'Announcement' && !isModerator) {
      return NextResponse.json(
        { error: 'Only MEDQAS moderators can create announcements' },
        { status: 403 },
      )
    }

    const title = String(body.title || '').trim()
    const text = String(body.body || body.description || '').trim()
    if (!title || !text) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 },
      )
    }

    const supabase = getServiceClient()
    const { data: category } = await supabase
      .from('community_categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle()

    const payload = {
      title,
      slug: `${slugifyCommunity(title)}-${Date.now().toString(36)}`,
      body: text,
      author_id: user.id,
      author_name:
        profile?.name ||
        user.user_metadata?.full_name ||
        user.email ||
        'Student',
      category_id: category?.id || null,
      category_slug: categorySlug,
      subject: normalizeSubject(body.subject),
      topic: emptyToNull(body.topic || body.chapter),
      tags: splitTags(body.tags),
      post_type: postType,
      status: 'open',
      is_pinned: isModerator && Boolean(body.isPinned),
      is_featured: isModerator && Boolean(body.isFeatured),
      is_verified_by_medqas:
        isModerator && categoryMeta?.slug === 'medqas-announcements',
    }

    const { data, error } = await supabase
      .from('community_posts')
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

function normalizeSubject(value: unknown) {
  const subject = String(value || 'General')
  return (subjects as readonly string[]).includes(subject) ? subject : 'General'
}

function normalizeCategorySlug(value: unknown) {
  const slug = String(value || 'ask-a-doubt')
  return communityCategories.some((category) => category.slug === slug)
    ? slug
    : 'ask-a-doubt'
}

function normalizePostType(value: unknown, categorySlug: string) {
  const requested = String(value || '')
  if ((postTypes as readonly string[]).includes(requested)) return requested
  if (categorySlug === 'daily-cee-question') return 'Daily Question'
  if (categorySlug === 'study-progress-wall') return 'Study Progress'
  if (categorySlug === 'medqas-announcements') return 'Announcement'
  if (categorySlug === 'success-stories-motivation')
    return 'Success Story / Motivation'
  return 'Doubt'
}

function emptyToNull(value: unknown) {
  const text = String(value || '').trim()
  return text ? text : null
}
