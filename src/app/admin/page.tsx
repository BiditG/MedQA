'use client'

import Link from 'next/link'
import useUser from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import {
  BookOpenText,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react'

const adminTools = [
  {
    href: '/admin/blog',
    title: 'Blog Manager',
    description:
      'Create SEO posts for CEE syllabus 2026, best books for CEE Nepal, and mock quiz searches.',
    icon: BookOpenText,
  },
  {
    href: '/admin/users',
    title: 'Users',
    description: 'Create accounts, change roles, and manage learner access.',
    icon: Users,
  },
  {
    href: '/admin/exam-codes',
    title: 'Exam Codes',
    description: 'Generate, copy, expire, and disable weekly exam codes.',
    icon: KeyRound,
  },
  {
    href: '/admin/glossary-upload',
    title: 'Glossary Upload',
    description: 'Upload disease glossary content for student lookup tools.',
    icon: LayoutDashboard,
  },
]

export default function AdminPageClient() {
  const { user, loading } = useUser()

  if (loading) return <div className="p-6">Checking session...</div>

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Please sign in as an admin to access this page.
        </p>
        <div className="mt-5 flex gap-3">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </main>
    )
  }

  if (user.role !== 'admin') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You are signed in but not an admin.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Admin workspace
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              MEDQAS Admin
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage growth content, student access, and exam utilities from one
              quiet dashboard.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/blog">Write SEO blog post</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {adminTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <tool.icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{tool.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
