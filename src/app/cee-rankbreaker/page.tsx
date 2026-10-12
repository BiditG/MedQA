import Link from 'next/link'
import { Trophy } from 'lucide-react'
import CeeRankbreakerAccess from '@/components/CeeRankbreakerAccess'

export const metadata = { title: 'CEE Rankbreaker' }
export default function CeeRankbreakerPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-2xl border bg-card p-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Trophy className="h-4 w-4" /> Competitive CEE exam
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          CEE Rankbreaker
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          200 challenging questions. One minute per question. Test your
          preparation and compete on the leaderboard.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Correct answer', '+1 mark'],
            ['Incorrect answer', '−0.25 marks'],
            ['Unanswered question', '0 marks'],
            ['Maximum marks', '200'],
            ['Time', '60 seconds per question'],
            ['Exam limit', 'Up to 200 minutes'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-background p-3">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 font-semibold">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <a className="vibrant-btn" href="#enter">
            Enter exam
          </a>
          <Link
            className="rounded-md border px-4 py-2 text-sm font-semibold"
            href="/cee-rankbreaker/leaderboard"
          >
            View leaderboard
          </Link>
        </div>
      </section>
      <div className="mt-7 max-w-xl">
        <CeeRankbreakerAccess />
      </div>
    </main>
  )
}
