import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) return redirect('/login')

  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      }/api/auth/me`,
      {
        headers: { Cookie: `sb-access-token=${accessToken}` },
      },
    )
    if (!res.ok) return redirect('/login')
    const user = await res.json()

    return (
      <div>
        <h1 className="heading-gradient text-3xl font-bold">Dashboard</h1>
        <p className="mt-2">Email: {user.email}</p>
      </div>
    )
  } catch (err) {
    return redirect('/login')
  }
}
