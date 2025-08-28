'use client'

import { NavLink } from './NavLink'
import {
  Activity,
  Bot,
  Box,
  Brain,
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
  const groups = [
    {
      title: 'Practice',
      items: [
        { href: '/quiz', label: 'Practice MCQs', icon: Brain },
        { href: '/cee-practice', label: 'CEE Practice', icon: Brain },
        { href: '/cee-exam', label: 'CEE Full Exam', icon: Brain },
      ],
    },
    {
      title: 'Checks',
      items: [
        { href: '/heart-check', label: 'Heart Check', icon: Activity },
        { href: '/stroke-check', label: 'Stroke Check', icon: Activity },
        { href: '/bacteria-check', label: 'Bacteria Quiz', icon: Activity },
        { href: '/pneumonia-check', label: 'Pneumonia Check', icon: ImageIcon },
        { href: '/mri-check', label: 'Tumour Check', icon: ImageIcon },
      ],
    },
    {
      title: 'Lookup',
      items: [
        { href: '/drugs', label: 'Drug Lookup', icon: Pill },
        { href: '/medicines', label: 'Medicine Directory', icon: Pill },
        { href: '/devices', label: 'Device Lookup', icon: Box },
        { href: '/disease-glossary', label: 'Glossary', icon: FileUp },
      ],
    },
    {
      title: 'AI',
      items: [
        { href: '/tutor', label: 'Tutor', icon: Bot },
        { href: '/pdf-to-mcq', label: 'PDF → MCQ', icon: FileUp },
        { href: '/visualize', label: '3D Viz', icon: Box },
        { href: '/diagnose', label: 'Diagnose', icon: Stethoscope },
        { href: '/pathogenesis', label: 'Pathogenesis', icon: Activity },
      ],
    },
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
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
                  {g.title}
                </div>
                <ul className="space-y-1">
                  {g.items.map((l) => (
                    <NavLink
                      key={l.href}
                      href={l.href}
                      icon={l.icon}
                      label={l.label}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
                    {g.title}
                  </div>
                  <ul className="space-y-1">
                    {g.items.map((l) => (
                      <NavLink
                        key={l.href}
                        href={l.href}
                        icon={l.icon}
                        label={l.label}
                        onClick={onClose}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
