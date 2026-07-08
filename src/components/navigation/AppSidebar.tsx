'use client'

import { NavLink } from './NavLink'
import {
  Activity,
  Bot,
  Box,
  Brain,
  Crown,
  FileUp,
  Image as ImageIcon,
  Stethoscope,
  Pill,
  Coffee,
  BookOpen,
  Atom,
  FlaskConical,
  Dna,
  BookOpenCheck,
  GraduationCap,
  ClipboardList,
  Newspaper,
  Trophy,
  CalendarCheck,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { cn } from '@/utils/tailwind'
import { Lock } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

export function AppSidebar({
  open,
  onClose,
  onLockedClick,
}: {
  open: boolean
  onClose: () => void
  onLockedClick?: () => void
}) {
  const groups = [
    {
      title: 'Upgrade',
      items: [{ href: '/pricing', label: 'Subscribe', icon: Crown }],
    },
    {
      title: 'Blog',
      items: [{ href: '/blog', label: 'CEE Blog', icon: Newspaper }],
    },
    {
      title: 'Mock Exam',
      items: [
        { href: '/mock-exam', label: 'Mock Exam', icon: Brain },
        { href: '/mock-exam/rankings', label: 'Rankings', icon: Trophy },
      ],
    },
    {
      title: 'Free Daily MCQs',
      items: [
        {
          href: '/mock-exam/free-daily-mcqs',
          label: 'Free Daily MCQs',
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: 'Practice',
      items: [
        { href: '/quiz', label: 'AIIMS/NEET PG MCQs', icon: Brain },
        { href: '/cee-mcqs', label: 'CEE MCQs', icon: BookOpenCheck },
        { href: '/cee-guide', label: 'CEE Guide', icon: BookOpen },
        { href: '/flashcards', label: 'Flashcards', icon: Brain },
        { href: '/exam-planner', label: 'Exam Tracker', icon: ClipboardList },
        { href: '/formula-bank', label: 'Formula Bank', icon: FlaskConical },
        {
          href: '/organic-reactions',
          label: 'Organic Reactions',
          icon: FlaskConical,
        },
        {
          href: '/cee-online-class',
          label: 'CEE Online Class',
          icon: GraduationCap,
        },
        { href: '/cee-exam', label: 'CEE Full Exam', icon: Brain },
        { href: '/cee-past-practice', label: 'Past Questions', icon: Brain },
        { href: '/visualize', label: '3D Anatomy', icon: Box },
        { href: '/pomodoro', label: 'Pomodoro', icon: Coffee },
      ],
    },
    // New Notes group under Practice
    {
      title: 'Notes',
      items: [
        { href: '/notes/physics', label: 'Physics', icon: Atom },
        { href: '/notes/chemistry', label: 'Chemistry', icon: FlaskConical },
        { href: '/notes/biology', label: 'Biology', icon: Dna },
      ],
    },
    {
      title: 'Diagrams',
      items: [{ href: '/diagrams', label: 'Medical Diagrams', icon: BookOpen }],
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
        { href: '/diagnose', label: 'Diagnose', icon: Stethoscope },
        { href: '/pathogenesis', label: 'Pathogenesis', icon: Activity },
      ],
    },
  ]

  const { profile, loading } = useProfile()

  // Prevent body from scrolling when mobile sidebar is open so touch scroll stays within the sidebar
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = prevOverflow || ''
    }
    return () => {
      document.body.style.overflow = prevOverflow || ''
      // restore only overflow; avoid touchAction to not interfere with native scrolling
    }
  }, [open])

  function isRestricted(_gTitle: string, _itemHref: string) {
    // Non-logged-in users: lock everything except the weekly exam and pricing/subscribe
    // If profile is null (not signed in) then restrict unless the item is allowed publicly.
    const publicPaths = ['/weekly-exam', '/mock-exam', '/pricing', '/blog', '/']
    if (loading) return false
    if (!profile) {
      return !publicPaths.some(
        (p) => _itemHref === p || _itemHref.startsWith(p),
      )
    }
    return false
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:bg-muted/30 md:backdrop-blur-sm">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Image
            src="/data/logo.jpg"
            alt="MEDQAS"
            width={32}
            height={32}
            className="rounded-md object-cover"
          />
          <Link href="/" className="text-sm font-semibold">
            MEDQAS
          </Link>
          <div className="ml-auto">
            {profile ? (
              <Link href="/profile" className="text-sm text-muted-foreground">
                {profile.email}
              </Link>
            ) : null}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Primary">
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g.title}>
                <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
                  {g.title}
                </div>
                <ul className="space-y-1">
                  {g.items.map((l) => {
                    const restricted = isRestricted(g.title, l.href)
                    // Disabled flag controls UI lock state for links
                    const disabled = Boolean(restricted)

                    // Render a prominent Subscribe CTA for the Upgrade group
                    if (l.href === '/pricing' || g.title === 'Upgrade') {
                      return (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            className="vibrant-btn inline-flex w-full items-center justify-between gap-3 px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              {l.icon ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
                                  <l.icon className="h-4 w-4 text-primary" />
                                </span>
                              ) : null}
                              <span className="truncate font-medium">
                                {l.label}
                              </span>
                            </div>
                            {/* keep space for trailing visuals if needed */}
                          </Link>
                        </li>
                      )
                    }

                    return (
                      <NavLink
                        key={l.href}
                        href={l.href}
                        icon={l.icon}
                        label={l.label}
                        onClick={disabled ? onLockedClick : undefined}
                        disabled={disabled}
                        trailing={
                          disabled ? (
                            <Lock className="h-4 w-4 text-foreground/70" />
                          ) : null
                        }
                      />
                    )
                  })}
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
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-72 border-r bg-muted shadow-xl transition-transform',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
        >
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <Image
              src="/data/logo.jpg"
              alt="MEDQAS"
              width={32}
              height={32}
              className="rounded-md object-cover"
            />
            <Link href="/" className="text-sm font-semibold" onClick={onClose}>
              MEDQAS
            </Link>
          </div>
          <nav
            className="max-h-screen flex-1 overflow-y-auto p-3"
            aria-label="Primary"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
            }}
          >
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
                    {g.title}
                  </div>
                  <ul className="space-y-1">
                    {g.items.map((l) => {
                      const restricted = isRestricted(g.title, l.href)
                      const disabled = Boolean(restricted)

                      if (l.href === '/pricing' || g.title === 'Upgrade') {
                        return (
                          <li key={l.href}>
                            <Link
                              href={l.href}
                              onClick={onClose}
                              className="vibrant-btn inline-flex w-full items-center justify-between gap-3 px-3 py-2 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                {l.icon ? (
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
                                    <l.icon className="h-4 w-4 text-primary" />
                                  </span>
                                ) : null}
                                <span className="truncate font-medium">
                                  {l.label}
                                </span>
                              </div>
                            </Link>
                          </li>
                        )
                      }

                      return (
                        <NavLink
                          key={l.href}
                          href={l.href}
                          icon={l.icon}
                          label={l.label}
                          onClick={disabled ? onLockedClick : onClose}
                          disabled={disabled}
                          trailing={
                            disabled ? (
                              <Lock className="h-4 w-4 text-foreground/70" />
                            ) : null
                          }
                        />
                      )
                    })}
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
