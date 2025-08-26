'use client'

import { NavLink } from './NavLink'
import {
  Activity,
  Bot,
  Box,
  FileUp,
  Home,
  Image as ImageIcon,
  Settings,
  Stethoscope,
  Pill,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/utils/tailwind'

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/drugs', label: 'Drug Lookup', icon: Pill },
    { href: '/disease-glossary', label: 'Glossary', icon: FileUp },
    { href: '/devices', label: 'Device Lookup', icon: Box },
    { href: '/tutor', label: 'Tutor', icon: Bot },
    { href: '/pdf-to-mcq', label: 'PDF → MCQ', icon: FileUp },
    { href: '/visualize', label: '3D Viz', icon: Box },
    { href: '/diagnose', label: 'Diagnose', icon: Stethoscope },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:bg-background">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="h-8 w-8 rounded-md bg-primary/20" aria-hidden />
          <Link href="/" className="text-sm font-semibold">
            MEDQAS
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Primary">
          <ul className="space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                icon={l.icon}
                label={l.label}
              />
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-40 transition-opacity md:hidden',
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-72 border-r bg-background shadow-xl transition-transform',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
        >
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <div className="h-8 w-8 rounded-md bg-primary/20" aria-hidden />
            <Link href="/" className="text-sm font-semibold" onClick={onClose}>
              MEDQAS
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-3" aria-label="Primary">
            <ul className="space-y-1">
              {links.map((l) => (
                <NavLink
                  key={l.href}
                  href={l.href}
                  icon={l.icon}
                  label={l.label}
                  onClick={onClose}
                />
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
