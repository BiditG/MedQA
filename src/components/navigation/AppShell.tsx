'use client'

import { useState, useEffect, useRef } from 'react'
import { AppTopbar } from './AppTopbar'
import { AppSidebar } from './AppSidebar'
import SubscriptionModal from '@/components/SubscriptionModal'
import useUser from '@/hooks/useUser'
import { usePathname } from 'next/navigation'
import ChatWidget from '@/components/ChatWidget'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const { user, loading } = useUser()
  const pathname = usePathname()
  const openedRef = useRef(false)

  // Auto-open subscription modal for unauthenticated visitors on the landing page
  useEffect(() => {
    if (openedRef.current) return
    if (pathname !== '/') return
    if (loading) return
    if (!user) {
      setSubOpen(true)
      openedRef.current = true
    }
  }, [pathname, loading, user])
  return (
    <>
      <AppTopbar onMenu={() => setOpen(true)} />
      <AppSidebar
        open={open}
        onClose={() => setOpen(false)}
        onLockedClick={() => setSubOpen(true)}
      />
      {(!pathname || !pathname.startsWith('/weekly-exam')) && <ChatWidget />}
      <SubscriptionModal open={subOpen} onClose={() => setSubOpen(false)} />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-0 px-4 md:pl-64">
        <div className="flex w-full flex-col py-6 md:py-8">{children}</div>
      </main>
    </>
  )
}
