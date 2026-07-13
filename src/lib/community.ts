import { getDataClient } from '@/utils/supabase-data'

export const communityCategories = [
  {
    name: 'Daily CEE Question',
    slug: 'daily-cee-question',
    description:
      'Admin-posted daily practice questions with answer discussion.',
    icon: 'CalendarCheck',
    color: '#2563eb',
  },
  {
    name: 'Ask a Doubt',
    slug: 'ask-a-doubt',
    description: 'Focused academic doubts from CEE preparation.',
    icon: 'HelpCircle',
    color: '#16a34a',
  },
  {
    name: 'Physics',
    slug: 'physics',
    description: 'Physics concepts, numericals, formulas, and MCQ reasoning.',
    icon: 'Atom',
    color: '#7c3aed',
  },
  {
    name: 'Chemistry',
    slug: 'chemistry',
    description: 'Physical, organic, and inorganic chemistry discussions.',
    icon: 'FlaskConical',
    color: '#0891b2',
  },
  {
    name: 'Botany',
    slug: 'botany',
    description: 'Plant biology, genetics, ecology, and high-yield Botany.',
    icon: 'Sprout',
    color: '#15803d',
  },
  {
    name: 'Zoology',
    slug: 'zoology',
    description: 'Human physiology, animal diversity, and Zoology doubts.',
    icon: 'Dna',
    color: '#be123c',
  },
  {
    name: 'MAT',
    slug: 'mat',
    description: 'Mental agility, reasoning, and MAT practice discussions.',
    icon: 'Brain',
    color: '#ca8a04',
  },
  {
    name: 'Mock Score Discussion',
    slug: 'mock-score-discussion',
    description: 'Discuss mock results, weak areas, and improvement plans.',
    icon: 'LineChart',
    color: '#0f766e',
  },
  {
    name: 'Study Progress Wall',
    slug: 'study-progress-wall',
    description: 'Share daily progress, consistency wins, and revision logs.',
    icon: 'ClipboardCheck',
    color: '#4f46e5',
  },
  {
    name: 'MEDQAS Announcements',
    slug: 'medqas-announcements',
    description: 'Official MEDQAS updates, notes, mock tests, and CEE notices.',
    icon: 'Megaphone',
    color: '#dc2626',
  },
  {
    name: 'Success Stories / Motivation',
    slug: 'success-stories-motivation',
    description: 'CEE motivation, recovery stories, and student milestones.',
    icon: 'Trophy',
    color: '#ea580c',
  },
] as const

export const subjects = [
  'Physics',
  'Chemistry',
  'Botany',
  'Zoology',
  'MAT',
  'General',
] as const

export const postTypes = [
  'Doubt',
  'Discussion',
  'Daily Question',
  'Study Progress',
  'Announcement',
  'Success Story / Motivation',
] as const

export type CommunityPost = {
  id: string
  title: string
  slug: string | null
  body: string
  author_id: string
  author_name: string | null
  category_id: string | null
  category_slug: string
  subject: string
  topic: string | null
  tags: string[] | null
  post_type: string
  status: 'open' | 'answered' | 'closed'
  is_pinned: boolean
  is_featured: boolean
  is_verified_by_medqas: boolean
  view_count: number
  reply_count: number
  upvote_count: number
  created_at: string
  updated_at: string
}

export type CommunityReply = {
  id: string
  post_id: string
  author_id: string
  author_name: string | null
  body: string
  upvote_count: number
  is_verified_answer: boolean
  is_admin_reply: boolean
  created_at: string
  updated_at: string
}

export type CommunityCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
}

const postSelect =
  'id,title,slug,body,author_id,author_name,category_id,category_slug,subject,topic,tags,post_type,status,is_pinned,is_featured,is_verified_by_medqas,view_count,reply_count,upvote_count,created_at,updated_at'

const replySelect =
  'id,post_id,author_id,author_name,body,upvote_count,is_verified_answer,is_admin_reply,created_at,updated_at'

export async function getCommunityCategories() {
  const supabase = getDataClient()
  const { data, error } = await supabase
    .from('community_categories')
    .select('id,name,slug,description,icon,color')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []) as CommunityCategory[]
}

export async function getCommunityPosts(options?: {
  categorySlug?: string
  authorId?: string
  limit?: number
  pinnedOnly?: boolean
  dailyQuestionOnly?: boolean
  postType?: string
}) {
  const supabase = getDataClient()
  let query = supabase.from('community_posts').select(postSelect)

  if (options?.categorySlug)
    query = query.eq('category_slug', options.categorySlug)
  if (options?.authorId) query = query.eq('author_id', options.authorId)
  if (options?.pinnedOnly) query = query.eq('is_pinned', true)
  if (options?.dailyQuestionOnly)
    query = query.eq('post_type', 'Daily Question')
  if (options?.postType) query = query.eq('post_type', options.postType)

  const { data, error } = await query
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(options?.limit || 30)

  if (error) throw error
  return (data || []) as CommunityPost[]
}

export async function getCommunityPost(id: string) {
  const supabase = getDataClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select(postSelect)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data || null) as CommunityPost | null
}

export async function getCommunityReplies(postId: string) {
  const supabase = getDataClient()
  const { data, error } = await supabase
    .from('community_replies')
    .select(replySelect)
    .eq('post_id', postId)
    .order('is_verified_answer', { ascending: false })
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as CommunityReply[]
}

export async function getUserCommunityActivity(authorId: string) {
  const supabase = getDataClient()
  const [postsResult, repliesResult, savedResult] = await Promise.all([
    supabase
      .from('community_posts')
      .select(postSelect)
      .eq('author_id', authorId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('community_replies')
      .select(replySelect)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false }),
    supabase
      .from('community_saved_posts')
      .select(`post:community_posts(${postSelect})`)
      .eq('user_id', authorId)
      .order('created_at', { ascending: false }),
  ])

  if (postsResult.error) throw postsResult.error
  if (repliesResult.error) throw repliesResult.error
  if (savedResult.error) throw savedResult.error

  return {
    posts: (postsResult.data || []) as CommunityPost[],
    replies: (repliesResult.data || []) as CommunityReply[],
    savedPosts: (savedResult.data || [])
      .map((row: any) => row.post)
      .filter(Boolean) as CommunityPost[],
  }
}

export function isModeratorRole(role?: string | null) {
  return role === 'admin' || role === 'moderator'
}

export function slugifyCommunity(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function splitTags(value: unknown) {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((tag) => tag.trim())
      .filter(Boolean)
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export const COMMUNITY_INPUT_WARNING =
  'Keep discussions CEE-focused. Avoid spam, abusive language, and misleading answers.'
