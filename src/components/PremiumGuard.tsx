'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/utils/supabase-browser'

export function PremiumGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const run = async () => {
      const supabase = createBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        setAllowed(false)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('premium')
        .eq('id', session.user.id)
        .maybeSingle()
      setAllowed(!!data?.premium)
    }
    run()
  }, [])

  if (allowed === null)
    return <div className="p-6 text-sm">Checking access…</div>
  if (!allowed)
    return (
      <div className="p-6 text-sm">
        This feature is for premium users.{' '}
        <Link href="/upgrade" className="underline">
          Upgrade
        </Link>
      </div>
    )
  return <>{children}</>
}
