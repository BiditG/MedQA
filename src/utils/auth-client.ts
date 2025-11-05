import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

const supabase = createBrowserSupabaseClient()

export async function signInAndPersist(email: string, password: string) {
  // sign in on client
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  } as any)

  if (error) throw error
  const session = (data as any)?.session

  // post session tokens to server route to set HttpOnly cookies
  await fetch('/api/auth/set-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
      expires_at: session?.expires_at,
    }),
  })

  return data
}

export default signInAndPersist
