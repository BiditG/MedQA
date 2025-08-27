'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Menu,
  Stethoscope,
  Brain,
  FileText,
  Activity,
  Pill,
  Box,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useId } from 'react'

export function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const brandId = useId()
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
          />

          <TopbarLink href="/quiz" label="Practice" Icon={Brain} />
          <TopbarLink href="/visualize" label="3D Viz" Icon={Box} />
          <TopbarLink
            href="/disease-glossary"
            label="Glossary"
            Icon={FileText}
          />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function TopbarLink({
  href,
  label,
  Icon,
}: {
  href: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
}) {
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
}: {
  label: string
  Icon: React.ComponentType<{ className?: string }>
  items: { href: string; label: string }[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((it) => (
          <DropdownMenuItem asChild key={it.href}>
            <Link href={it.href}>{it.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
