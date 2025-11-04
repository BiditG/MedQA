'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import { useProfile } from '@/hooks/useProfile'
import { useSupabaseUser } from '@/hooks/useSupabaseUser' // <-- added
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
  const { user, loading: userLoading } = useSupabaseUser() // <-- added
  const [authOpen, setAuthOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)

  const handleSubscribeClick = () => {
    // Option 1: Close modal and redirect to payment page
    setSubOpen(false)
    window.location.href = '/pricing'

    // Option 2: Or use Next.js router (import { useRouter } from 'next/navigation')
    // const router = useRouter()
    // router.push('/pricing')
  }

  const loading = profileLoading || userLoading // <-- combined loading state

  // Merge user metadata with profile
  const displayName =
    user?.user_metadata?.full_name || profile?.full_name || user?.email
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture

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
          {/* Lookup dropdown: drugs & devices */}
          <TopbarDropdown
            label="Lookup"
            Icon={Pill}
            items={[
              { href: '/drugs', label: 'Drug Lookup' },
              { href: '/devices', label: 'Device Lookup' },
            ]}
            profile={profile}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />

          {/* Checks dropdown: clinical/check quizzes */}
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
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />

          {/* AI dropdown: AI tools */}
          <TopbarDropdown
            label="AI"
            Icon={Brain}
            items={[
              { href: '/tutor', label: 'AI Tutor' },
              { href: '/pdf-to-mcq', label: 'PDF → MCQ' },
              { href: '/diagnose', label: 'Diagnose' },
            ]}
            profile={profile}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />

          <TopbarLink
            href="/quiz"
            label="Practice"
            Icon={Brain}
            profile={profile}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
          <TopbarLink
            href="/cee-practice"
            label="CEE Practice"
            Icon={Brain}
            profile={profile}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
          <TopbarLink
            href="/visualize"
            label="3D Viz"
            Icon={Box}
            profile={profile}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
          <TopbarLink
            href="/disease-glossary"
            label="Glossary"
            Icon={FileText}
            profile={profile}
            loading={loading}
            onLockedClick={() => setSubOpen(true)}
          />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setSubOpen(true)}
            className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-amber-500 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:brightness-95 md:inline-flex"
          >
            Subscribe
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
                      <img
                        src={avatarUrl}
                        alt="Profile"
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
                        const supabase = (
                          await import('@/utils/supabase-browser')
                        ).createBrowserClient()
                        await supabase.auth.signOut()
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
        <SubscriptionModal
          open={subOpen}
          onClose={() => setSubOpen(false)}
          onSubscribe={handleSubscribeClick} // <-- pass handler
        />
      </div>
    </header>
  )
}

function TopbarLink({
  href,
  label,
  Icon,
  profile,
  loading,
  onLockedClick,
}: {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  profile?: any
  loading?: boolean
  onLockedClick?: () => void
}) {
  function isRestricted(gTitle: string, itemHref: string, itemLabel: string) {
    if (gTitle === 'AI') return true
    if (gTitle === 'Lookup')
      return !['Glossary', 'Medicine Directory'].includes(itemLabel)
    if (gTitle === 'Practice') return itemHref !== '/cee-practice'
    return false
  }

  // Derive restricted by mapping label/href into the same rules used by sidebar
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
  const disabled =
    !loading && restricted && !(profile?.premium || profile?.role === 'admin')

  if (disabled) {
    return (
      <button
        onClick={() => onLockedClick?.()}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground"
      >
        <Icon className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{label}</span>
        <Lock className="ml-1 h-4 w-4 text-muted-foreground" />
      </button>
    )
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only">{label}</span>
    </Link>
  )
}

function TopbarDropdown({
  label,
  Icon,
  items,
  profile,
  loading,
  onLockedClick,
}: {
  label: string
  Icon: React.ComponentType<{ className?: string }>
  items: { href: string; label: string }[]
  profile?: any
  loading?: boolean
  onLockedClick?: () => void
}) {
  function isRestricted(gTitle: string, itemHref: string, itemLabel: string) {
    if (gTitle === 'AI') return true
    if (gTitle === 'Lookup')
      return !['Glossary', 'Medicine Directory'].includes(itemLabel)
    if (gTitle === 'Practice') return itemHref !== '/cee-practice'
    return false
  }

  const anyRestricted = items.some((it) =>
    isRestricted(label, it.href, it.label),
  )
  const allRestricted = items.every((it) =>
    isRestricted(label, it.href, it.label),
  )
  const hasAccess = loading || profile?.premium || profile?.role === 'admin'

  // If entire group is restricted and the user lacks access, render a Subscribe
  // button instead of the dropdown to avoid exposing the menu.
  if (allRestricted && !hasAccess) {
    return (
      <Button
        variant="ghost"
        onClick={() => onLockedClick?.()}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground"
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
        <Lock className="ml-1 h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
          {/* If any child is restricted and user lacks access, show lock indicator */}
          {!hasAccess && anyRestricted ? (
            <Lock className="ml-1 h-4 w-4 text-muted-foreground" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((it) => {
          const restricted = isRestricted(label, it.href, it.label)
          const disabled =
            !loading &&
            restricted &&
            !(profile?.premium || profile?.role === 'admin')
          if (disabled) {
            return (
              <DropdownMenuItem key={it.href}>
                <button
                  onClick={() => onLockedClick?.()}
                  className="w-full text-left"
                >
                  {it.label}
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
