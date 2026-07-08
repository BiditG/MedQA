'use client'

import React, { useId } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'
import useUser from '@/hooks/useUser'
import {
  Instagram,
  Loader2,
  LogOut,
  Menu,
  Stethoscope,
  User,
  Youtube,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const brandId = useId()
  const { profile, loading: profileLoading } = useProfile()
  const { user, loading: userLoading } = useUser()

  const loading = profileLoading || userLoading
  const displayName = user?.name || profile?.full_name || user?.email
  const avatarUrl = null

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/50 bg-muted/20 backdrop-blur supports-[backdrop-filter]:bg-muted/10"
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

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/blog"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:inline-flex"
          >
            Blog
          </Link>

          <nav
            aria-label="Social media"
            className="hidden items-center gap-1 sm:flex"
          >
            <SocialLink
              href="https://www.tiktok.com/@medqas.np"
              label="TikTok"
              icon={<TikTokIcon className="h-4 w-4" />}
            />
            <SocialLink
              href="https://www.youtube.com/@medqas_np"
              label="YouTube"
              icon={<Youtube className="h-4 w-4" aria-hidden />}
            />
            <SocialLink
              href="https://www.instagram.com/medqas.np/"
              label="Instagram"
              icon={<Instagram className="h-4 w-4" aria-hidden />}
            />
          </nav>

          <Link
            href="/pricing"
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
          </Link>

          <div>
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span className="hidden sm:inline">Loading...</span>
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
      </div>
    </header>
  )
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {icon}
    </a>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M16.6 3c.3 2.4 1.6 3.9 4 4.1v3.2c-1.4.1-2.7-.3-4-1.1v6.1c0 3.1-2.1 5.7-5.5 5.7-3.1 0-5.6-2.2-5.6-5.2 0-3.4 2.8-5.6 6.1-5.3v3.3c-1.5-.3-2.8.5-2.8 1.9 0 1.2 1 2 2.2 2 1.4 0 2.2-.9 2.2-2.5V3h3.4z" />
    </svg>
  )
}
