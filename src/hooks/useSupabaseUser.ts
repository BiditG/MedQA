'use client'

import useUser from '@/hooks/useUser'

// Compatibility shim: some components expect a `useSupabaseUser` hook that
// returns a supabase-like `user` object and `loading`. Map our internal user
// shape to that minimal surface so existing UI keeps working.
export function useSupabaseUser() {
  const { user, loading } = useUser()

  const mapped = user
    ? {
        email: user.email,
        user_metadata: {
          full_name: user.name || null,
          picture: null,
          avatar_url: null,
        },
      }
    : null

  return { user: mapped, loading }
}
