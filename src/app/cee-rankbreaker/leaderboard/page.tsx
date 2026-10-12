import Link from 'next/link'
import CeeRankbreakerLeaderboard from '@/components/CeeRankbreakerLeaderboard'
export const metadata = { title: 'CEE Rankbreaker ranking' }
export default function CeeRankbreakerLeaderboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/cee-rankbreaker"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← CEE Rankbreaker
      </Link>
      <div className="mt-5">
        <CeeRankbreakerLeaderboard />
      </div>
    </main>
  )
}
