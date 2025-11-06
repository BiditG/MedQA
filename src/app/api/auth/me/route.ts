import { NextResponse } from 'next/server'
import { getUserFromRequest, ensureProfile } from '@/utils/supabase-server'

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    // Ensure profile exists and return unified shape
    const profile = await ensureProfile(user.id, user.email)
    const out = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'user',
      created_at: profile?.created_at || user.created_at || null,
      premium: profile?.premium ?? false,
    }
    return NextResponse.json({ user: out })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unauthorized' },
      { status: 401 },
    )
  }
}
