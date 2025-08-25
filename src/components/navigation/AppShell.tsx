'use client'

import { useState } from 'react'
import { AppTopbar } from './AppTopbar'
import { AppSidebar } from './AppSidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <AppTopbar onMenu={() => setOpen(true)} />
      <AppSidebar open={open} onClose={() => setOpen(false)} />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-0 px-4 md:pl-64">
        <div className="flex w-full flex-col py-6 md:py-8">{children}</div>
      </main>
    </>
  )
}
