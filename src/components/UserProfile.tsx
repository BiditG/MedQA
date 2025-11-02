'use client'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

export default function UserProfile() {
  const { user, loading } = useSupabaseUser()

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <a href="/login">Sign in</a>
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      {user.user_metadata?.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt="Avatar"
          className="h-10 w-10 rounded-full"
        />
      )}
      {user.user_metadata?.full_name && <p>{user.user_metadata.full_name}</p>}
    </div>
  )
}
