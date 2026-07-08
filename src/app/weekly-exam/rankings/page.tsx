import Link from 'next/link'
import WeeklyExamLeaderboard from '@/components/WeeklyExamLeaderboard'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Mock Exam Rankings',
  description: 'MEDQAS Mock Exam rankings with time filters.',
}

export default function WeeklyExamRankingsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/mock-exam"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Mock Exam
      </Link>

      <header className="mt-6 border-b pb-5">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Mock Exam Rankings
        </h1>
      </header>

      <section className="mt-6">
        <WeeklyExamLeaderboard />
      </section>
    </main>
  )
}
