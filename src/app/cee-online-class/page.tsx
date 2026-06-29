import { Clock3, GraduationCap } from 'lucide-react'
import { PremiumGuard } from '@/components/PremiumGuard'

export const metadata = {
  title: 'CEE Online Class',
  description: 'CEE Online Class is coming soon on MEDQAS.',
}

export default function CeeOnlineClassPage() {
  return (
    <PremiumGuard>
      <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-4 py-10">
        <div className="w-full rounded-xl border bg-background/95 p-6 shadow-sm sm:p-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" aria-hidden />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            Coming soon
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            CEE Online Class
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Live and recorded CEE classes, guided practice sessions, and
            structured course support are on the way.
          </p>
        </div>
      </section>
    </PremiumGuard>
  )
}
