import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase-server'

export type Profile = {
  id: string
  email?: string | null
  role: 'admin' | 'user'
  premium: boolean
  created_at?: string
  updated_at?: string
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getOrCreateProfile() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>()

  if (existing) return existing

  const toInsert: Partial<Profile> = {
    id: user.id,
    email: user.email ?? null,
    role: 'user',
    premium: false,
  }
  const { data } = await supabase
    .from('profiles')
    .upsert(toInsert, { onConflict: 'id' })
    .select('*')
    .maybeSingle<Profile>()
  return data ?? null
}

export async function requireAdmin(): Promise<Profile | null> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  // Prefer service role if available to bypass RLS and read the authoritative role
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const svc = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      })
      const { data } = await svc
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle<Profile>()
      if (!data || data.role !== 'admin') return null
      return data
    } catch (e) {
      // fall back to RLS below
      console.error('[requireAdmin] service role check failed', e)
    }
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>()
  if (!data || data.role !== 'admin') return null
  return data
}
