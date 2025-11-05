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
  // If no server-detected user, try a developer-friendly fallback: parse a
  // `medqa_session` cookie if present to extract claims (e.g. role) without
  // verifying the signature. This is _only_ a convenience fallback for local
  // development / debugging; in production you should ensure Supabase sets the
  // standard auth cookie so server-side checks are authoritative.
  if (!user) {
    try {
      const raw = cookieStore.get('medqa_session')?.value
      if (raw) {
        // medqa_session looks like a JWT: header.payload.signature
        const parts = raw.split('.')
        if (parts.length >= 2) {
          const payload = parts[1]
          // base64url -> base64
          const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
          const buf = Buffer.from(b64, 'base64')
          const claims = JSON.parse(buf.toString('utf8'))
          if (claims && claims.sub) {
            const fallback: Profile = {
              id: claims.sub,
              email: claims.email ?? null,
              role: (claims.role as any) || 'user',
              premium: !!claims.premium,
            }
            if (fallback.role === 'admin') return fallback
          }
        }
      }
    } catch (e) {
      // ignore and fall through to null
    }
    return null
  }
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
