'use client'

import { useEffect, useRef, useState } from 'react'
import { AppTopbar } from './AppTopbar'
import { AppSidebar } from './AppSidebar'
import useUser from '@/hooks/useUser'
import { usePathname, useRouter } from 'next/navigation'
import ChatWidget from '@/components/ChatWidget'
import { AnnouncementPopup } from '@/components/AnnouncementPopup'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const openedPricingRef = useRef(false)

  useEffect(() => {
    if (openedPricingRef.current) return
    if (loading || user) return
    if (pathname !== '/') return

    openedPricingRef.current = true
    router.push('/pricing')
  }, [loading, pathname, router, user])

  return (
    <>
      <AppTopbar onMenu={() => setOpen(true)} />
      <AppSidebar
        open={open}
        onClose={() => setOpen(false)}
        onLockedClick={() => {
          window.location.href = '/pricing'
        }}
      />
      <AnnouncementPopup />
      {(!pathname || !pathname.startsWith('/weekly-exam')) && <ChatWidget />}
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-0 px-4 md:pl-64">
        <div className="flex w-full flex-col py-6 md:py-8">{children}</div>
      </main>
    </>
  )
}
