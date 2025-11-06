import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AuthButton() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  let user: any = null
  if (accessToken) {
    try {
      // Fetch user from /api/auth/me
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        }/api/auth/me`,
        {
          headers: { Cookie: `sb-access-token=${accessToken}` },
        },
      )
      if (res.ok) {
        user = await res.json()
      }
    } catch (err) {
      // ignore
    }
  }

  const signOut = async () => {
    'use server'
    const cookieStore = cookies()
    // remove Supabase cookies
    try {
      cookieStore.delete('sb-access-token')
      cookieStore.delete('sb-refresh-token')
    } catch (e) {
      // ignore
    }
    return redirect('/login')
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOut}>
        <button className="bg-btn-background hover:bg-btn-background-hover rounded-md px-4 py-2 no-underline">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="bg-btn-background hover:bg-btn-background-hover flex rounded-md px-3 py-2 no-underline"
    >
      Login
    </Link>
  )
}
