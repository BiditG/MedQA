// Server-side Supabase helpers for auth and data access
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export function getAnonClient() {
  if (!URL || !ANON_KEY) throw new Error('Supabase anon not configured')
  return createClient(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  })
}

export function getServiceClient() {
  if (!URL || !SERVICE_KEY) throw new Error('Supabase service not configured')
  return createClient(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  })
}

export function parseCookies(h: Headers) {
  const cookie = h.get('cookie') || ''
  const out: Record<string, string> = {}
  cookie.split(/;\s*/).forEach((p) => {
    const idx = p.indexOf('=')
    if (idx > 0)
      out[decodeURIComponent(p.slice(0, idx))] = decodeURIComponent(
        p.slice(idx + 1),
      )
  })
  return out
}

export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization') || ''
  let accessToken = ''
  if (authHeader.startsWith('Bearer ')) accessToken = authHeader.split(' ')[1]
  if (!accessToken) {
    const cookies = parseCookies(req.headers)
    accessToken = cookies['sb-access-token'] || ''
  }
  if (!accessToken) return { user: null, accessToken: null }
  const anon = getAnonClient()
  const { data, error } = await anon.auth.getUser(accessToken)
  if (error || !data?.user) return { user: null, accessToken: null }
  return { user: data.user, accessToken }
}

export async function getProfileById(id: string) {
  const svc = getServiceClient()
  const { data, error } = await svc
    .from('profiles')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data || null
}

export async function ensureProfile(id: string, email?: string | null) {
  const svc = getServiceClient()
  const { data, error } = await svc
    .from('profiles')
    .upsert({ id, email: email || null }, { onConflict: 'id' })
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data
}

export async function requireAdminFromRequest(req: Request) {
  const { user } = await getUserFromRequest(req)
  if (!user) return null
  const profile = await getProfileById(user.id)
  if (profile?.role !== 'admin') return null
  return { authUser: user, profile }
}
// Supabase server helpers have been disabled. The project now uses a JWT-backed
// authentication system with a local DB abstraction (src/lib/db). If you need a
// server-side client to access a third-party DB, implement it here (e.g. Turso)
// or call your server APIs directly.

export const createServerClient = (_cookieStore: any) => {
  throw new Error(
    'Supabase server client disabled. Use src/lib/db or server APIs instead.',
  )
}

export const createRouteHandlerServerClient = (_response: any) => {
  throw new Error(
    'Supabase server client disabled. Use src/lib/db or server APIs instead.',
  )
}

export const createMiddlewareClient = (_request: any) => {
  throw new Error(
    'Supabase server client disabled. Use src/lib/db or server APIs instead.',
  )
}
