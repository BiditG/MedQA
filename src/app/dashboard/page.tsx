import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <h1 className="heading-gradient text-3xl font-bold">Dashboard</h1>
      <p className="mt-2">Email: {user.email}</p>
    </div>
  )
}
