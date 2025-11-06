'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'
import useUser from '@/hooks/useUser'
import { Loader2, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Stethoscope,
  Brain,
  FileText,
  Activity,
  Pill,
  Box,
  Lock,
} from 'lucide-react'
import { useId } from 'react'
import SubscriptionModal from '@/components/SubscriptionModal'

export function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const brandId = useId()
  const { profile, loading: profileLoading } = useProfile()
  const { user, loading: userLoading } = useUser()
  const [subOpen, setSubOpen] = useState(false)

  const loading = profileLoading || userLoading
  const isAuthed = !!user

  // Merge user metadata with profile (our user shape is simpler)
  const displayName = user?.name || profile?.full_name || user?.email
  const avatarUrl = null

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50"
      role="banner"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
        <Button
          variant="ghost"
          className="md:hidden"
          aria-label="Open navigation"
          onClick={onMenu}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>

        <Link
          href="/"
          aria-labelledby={brandId}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <div className="bg-primary/15 inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary">
            <Stethoscope className="h-4 w-4" aria-hidden />
          </div>
          <span
            id={brandId}
            className="text-sm font-semibold tracking-tight sm:text-base"
          >
            MEDQAS
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="ml-2 hidden items-center gap-1 md:flex"
        >
          {/* Lookup */}
          <TopbarDropdown
            label="Lookup"
            Icon={Pill}
            items={[
              { href: '/drugs', label: 'Drug Lookup' },
              { href: '/devices', label: 'Device Lookup' },
            ]}
            profile={profile}
            isAuthed={isAuthed}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />

          {/* Checks */}
          <TopbarDropdown
            label="Checks"
            Icon={Activity}
            items={[
              { href: '/heart-check', label: 'Heart Check' },
              { href: '/stroke-check', label: 'Stroke Check' },
              { href: '/bacteria-check', label: 'Bacteria Quiz' },
              { href: '/pneumonia-check', label: 'Pneumonia Check' },
              { href: '/mri-check', label: 'Tumour Check' },
            ]}
            profile={profile}
            isAuthed={isAuthed}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />

          {/* AI */}
          <TopbarDropdown
            label="AI"
            Icon={Brain}
            items={[
              { href: '/tutor', label: 'AI Tutor' },
              { href: '/pdf-to-mcq', label: 'PDF → MCQ' },
              { href: '/diagnose', label: 'Diagnose' },
            ]}
            profile={profile}
            isAuthed={isAuthed}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />

          <TopbarLink
            href="/quiz"
            label="Practice"
            Icon={Brain}
            profile={profile}
            isAuthed={isAuthed}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
          <TopbarLink
            href="/cee-practice"
            label="CEE Practice"
            Icon={Brain}
            profile={profile}
            isAuthed={isAuthed}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
          <TopbarLink
            href="/visualize"
            label="3D Viz"
            Icon={Box}
            profile={profile}
            isAuthed={isAuthed}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
          <TopbarLink
            href="/disease-glossary"
            label="Glossary"
            Icon={FileText}
            profile={profile}
            isAuthed={isAuthed}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSubOpen(true)}
            aria-label="Subscribe"
            className="vibrant-btn inline-flex items-center gap-2 ring-1 ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M8.5 3.5l1.2 2.9 2.9 1.2-2.9 1.2-1.2 2.9-1.2-2.9L4.4 7.6l2.9-1.2 1.2-2.9zM17 6l.9 2.1L20 9l-2.1.9L17 12l-.9-2.1L14 9l2.1-.9L17 6zM16 14.5l1.4 3.3 3.3 1.4-3.3 1.4L16 24l-1.4-3.3L11.3 19l3.3-1.4L16 14.5z" />
            </svg>
            <span className="hidden sm:inline">Subscribe</span>
          </button>
          <div>
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span className="hidden sm:inline">Loading…</span>
                <span className="sr-only">Loading profile</span>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/40">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                        {(displayName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <button
                      onClick={async () => {
                        try {
                          const { signOut } = await import(
                            '@/utils/auth-client'
                          )
                          signOut()
                        } catch {}
                        window.location.href = '/'
                      }}
                      className="w-full"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Sign out
                      </span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
                <span className="sr-only">Sign in</span>
              </Link>
            )}
          </div>
        </div>
        <SubscriptionModal open={subOpen} onClose={() => setSubOpen(false)} />
      </div>
    </header>
  )
}

function TopbarLink({
  href,
  label,
  Icon,
  profile,
  isAuthed,
  loading,
  onLockedClick,
}: {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  profile?: any
  isAuthed?: boolean
  loading?: boolean
  onLockedClick?: () => void
}) {
  function isRestricted(
    _gTitle: string,
    _itemHref: string,
    _itemLabel: string,
  ) {
    // Non-logged-in users: lock everything except weekly-exam and pricing
    const publicPaths = ['/weekly-exam', '/pricing', '/']
    if (loading) return false
    if (!profile && !isAuthed) {
      return !publicPaths.some(
        (p) => _itemHref === p || _itemHref.startsWith(p),
      )
    }
    return false
  }

  const restricted = isRestricted(
    label === 'Practice'
      ? 'Practice'
      : label === 'Glossary'
        ? 'Lookup'
        : label === 'CEE Practice'
          ? 'Practice'
          : 'Lookup',
    href,
    label,
  )

  const disabled = Boolean(restricted)

  if (disabled || loading) {
    return (
      <button
        onClick={() => onLockedClick?.()}
        className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-primary/5"
      >
        <Icon className="h-4 w-4" aria-hidden />
        <span className="underline-animate hidden sm:inline">{label}</span>
        <Lock className="h-4 w-4 text-muted-foreground" />
      </button>
    )
  }

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="underline-animate hidden sm:inline">{label}</span>
      <span className="sr-only">{label}</span>
    </Link>
  )
}

function TopbarDropdown({
  label,
  Icon,
  items,
  profile,
  isAuthed,
  loading,
  onLockedClick,
}: {
  label: string
  Icon: React.ComponentType<{ className?: string }>
  items: { href: string; label: string }[]
  profile?: any
  isAuthed?: boolean
  loading?: boolean
  onLockedClick?: () => void
}) {
  function isRestricted(
    _gTitle: string,
    _itemHref: string,
    _itemLabel: string,
  ) {
    const publicPaths = ['/weekly-exam', '/pricing', '/']
    if (loading) return false
    if (!profile && !isAuthed) {
      return !publicPaths.some(
        (p) => _itemHref === p || _itemHref.startsWith(p),
      )
    }
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const anyRestricted = items.some((it) =>
    isRestricted(label, it.href, it.label),
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const allRestricted = items.every((it) =>
    isRestricted(label, it.href, it.label),
  )

  if (false) {
    return (
      <Button
        variant="ghost"
        onClick={() => onLockedClick?.()}
        className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-primary/5 hover:text-foreground"
      >
        <Icon className="h-4 w-4" />
        <span className="underline-animate hidden sm:inline">{label}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-primary/5 hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
          <span className="underline-animate hidden sm:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((it) => {
          const itemRestricted = isRestricted(label, it.href, it.label)
          if (itemRestricted) {
            return (
              <DropdownMenuItem key={it.href}>
                <button
                  onClick={() => onLockedClick?.()}
                  className="flex w-full items-center justify-between"
                >
                  <span>{it.label}</span>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuItem>
            )
          }
          return (
            <DropdownMenuItem asChild key={it.href}>
              <Link href={it.href}>{it.label}</Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
