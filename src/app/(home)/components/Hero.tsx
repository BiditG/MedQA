import { Brain } from 'lucide-react'

export function Hero() {
  return (
    <section className="w-full border-b border-foreground/10">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-10">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Practice Medical MCQs
          </h1>
          <p className="text-muted-foreground">
            NEET/USMLE-style questions to boost your prep. Pick a subject and
            topic, choose a mode, and jump in. You’ve got this!
          </p>
        </div>
        <div className="hidden rounded-2xl border p-4 sm:block">
          <Brain className="h-10 w-10 text-indigo-500" aria-hidden />
        </div>
      </div>
    </section>
  )
}
