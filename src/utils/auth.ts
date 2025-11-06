import { cookies } from 'next/headers'
import { getAnonClient, getServiceClient } from '@/utils/supabase-server'

export type Profile = {
  id: string
  email?: string | null
  role: 'admin' | 'user'
  created_at?: string
}

export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const cookieStore = cookies()
    const access = cookieStore.get('sb-access-token')?.value
    if (!access) return null
    const anon = getAnonClient()
    const { data } = await anon.auth.getUser(access)
    if (!data?.user) return null
    const svc = getServiceClient()
    const { data: prof } = await svc
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()
    return {
      id: data.user.id,
      email: data.user.email,
      role: (prof?.role as any) || 'user',
      created_at: prof?.created_at,
    }
  } catch {
    return null
  }
}

export async function getOrCreateProfile() {
  return await getCurrentUser()
}

export async function requireAdmin(): Promise<Profile | null> {
  const u = await getCurrentUser()
  if (u?.role !== 'admin') return null
  return u
}
