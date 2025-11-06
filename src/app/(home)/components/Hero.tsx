'use client'

import Link from 'next/link'
import { Brain, Sparkles, ShieldCheck, Cpu, BookOpen } from 'lucide-react'
import AvailableQuestions from '@/components/AvailableQuestions'
import AnimatedBars from './AnimatedBars'

export function Hero({
  onMobileStartClick,
}: {
  onMobileStartClick?: () => void
}) {
  return (
    <section className="w-full border-b border-border/50">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="heading-gradient text-3xl font-semibold leading-tight sm:text-5xl">
            MEDQAS: CEE MCQs, AIIMS, NEET PG, Entrance Prep & Free Medical
            Questions
          </h1>
          <p className="mx-auto mt-4 max-w-[70ch] text-base text-muted-foreground sm:text-lg">
            Practice CEE questions, AIIMS/NEET PG MCQs, and entrance exam prep
            for Nepali medical students. Access free MCQs, clinical reasoning,
            anatomy, and AI guidance — all in one medical learning app. MEDQAS
            is your trusted platform for medical entrance preparation, exam
            success, and verified clinical resources in Nepal.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/quiz"
              className="vibrant-btn inline-flex items-center justify-center text-sm font-medium"
            >
              Start practice
            </Link>
            <Link
              href="/tutor"
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium"
            >
              Ask AI Tutor
            </Link>
          </div>
          <AnimatedBars />
          <AvailableQuestions />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card-accent group p-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform motion-safe:group-hover:-translate-y-1 motion-reduce:transition-none">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">FDA & Regulatory checks</div>
                <div className="text-xs text-muted-foreground">
                  Drug & device references cross-checked with regulatory sources
                </div>
              </div>
            </div>
          </div>

          <div className="card-accent group p-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform motion-safe:group-hover:-translate-y-1 motion-reduce:transition-none">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">
                  Contextual, evidence-backed AI
                </div>
                <div className="text-xs text-muted-foreground">
                  AI answers grounded with citations and context
                </div>
              </div>
            </div>
          </div>

          <div className="card-accent group p-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform motion-safe:group-hover:-translate-y-1 motion-reduce:transition-none">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Verified clinical sources</div>
                <div className="text-xs text-muted-foreground">
                  Content curated from trusted medical resources
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
