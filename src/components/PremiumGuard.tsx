'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// PremiumGuard: after removing Supabase-based premium checks, treat any
// authenticated user as allowed. If you later reintroduce premium tiers,
// update this to check `user.premium` or a dedicated endpoint.
export function PremiumGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!mounted) return
        if (!res.ok) {
          setAllowed(false)
          return
        }
        const json = await res.json()
        setAllowed(Boolean(json?.user))
      } catch (e) {
        if (!mounted) return
        setAllowed(false)
      }
    }
    run()
    function onAuth() {
      run()
    }
    window.addEventListener('auth:change', onAuth as EventListener)
    return () => {
      mounted = false
      window.removeEventListener('auth:change', onAuth as EventListener)
    }
  }, [])

  if (allowed === null)
    return <div className="p-6 text-sm">Checking access…</div>
  if (!allowed)
    return (
      <div className="p-6 text-sm">
        To access this feature, you need to purchase a package. After purchase,
        login credentials will be provided by the admin. For account
        information, contact +977 9803526374 or medqas.np@gmail.com.{' '}
        <Link href="/pricing" className="underline">
          View Plans
        </Link>
      </div>
    )
  return <>{children}</>
}
