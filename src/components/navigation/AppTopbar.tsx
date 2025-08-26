'use client'

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
          <TopbarLink href="/tutor" label="AI Tutor" Icon={Brain} />
          <TopbarLink href="/pdf-to-mcq" label="PDF→MCQ" Icon={FileText} />
          <TopbarLink href="/visualize" label="3D Viz" Icon={Box} />
          <TopbarLink href="/drugs" label="Drug Lookup" Icon={Pill} />
          <TopbarLink href="/devices" label="Device Lookup" Icon={Box} />
          <TopbarLink
            href="/disease-glossary"
            label="Glossary"
            Icon={FileText}
          />
          <TopbarLink href="/diagnose" label="Diagnose" Icon={Activity} />
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
