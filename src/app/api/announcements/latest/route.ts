import { NextResponse } from 'next/server'
import { getCommunityPosts } from '@/lib/community'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const posts = await getCommunityPosts({
      postType: 'Announcement',
      limit: 1,
    })

    return NextResponse.json({ announcement: posts[0] || null })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load announcement' },
      { status: 500 },
    )
  }
}
