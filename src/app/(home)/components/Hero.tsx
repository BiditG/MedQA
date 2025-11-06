'use client'

import Link from 'next/link'
import React from 'react'
import { ShieldCheck, Cpu, BookOpen, Play, MessageSquare } from 'lucide-react'
import AvailableQuestions from '@/components/AvailableQuestions'
import AnimatedBars from './AnimatedBars'

export function Hero() {
  return (
    <section className="w-full border-b border-border/50">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:max-w-6xl lg:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h1 className="mb-4 flex min-h-[80px] items-center justify-center text-2xl font-extrabold leading-tight sm:min-h-[90px] sm:text-3xl md:min-h-[110px] md:text-4xl lg:min-h-[120px] lg:text-5xl">
            <span className="subtle-hover heading-gradient">
              MEDQAS: The AI-Driven Medical Learning Platform with Smart MCQs
              for NEET, AIIMS & CEE Aspirants
            </span>
            <style>{`
              .subtle-hover {
                transition: all 0.3s ease;
                cursor: default;
              }

              .subtle-hover:hover {
                background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-2)), hsl(var(--accent)));
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }

              @media (prefers-reduced-motion: reduce) {
                .subtle-hover {
                  transition: none;
                }
                .subtle-hover:hover {
                  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-2)));
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                }
              }
            `}</style>
          </h1>
          <p className="mx-auto mb-6 mt-2 max-w-[85ch] text-center text-sm font-medium leading-relaxed text-muted-foreground sm:text-base md:text-lg lg:text-xl">
            <span className="block sm:inline">
              Supercharge your medical entrance preparation with{' '}
            </span>
            <span className="font-bold text-primary">MEDQAS</span> —
            Nepal&apos;s leading platform for{' '}
            <span className="font-bold text-accent">
              CEE, AIIMS, NEET PG MCQs
            </span>{' '}
            and{' '}
            <span className="font-bold text-accent">AI-powered guidance</span>.
            Get instant explanations, personalized clinical support, and smart
            analytics to master every topic. Unlock your full potential with
            responsive, modern learning.{' '}
            <span className="font-bold text-primary">
              MCQ access after package purchase.
            </span>
          </p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row lg:gap-4">
            <Link
              href="/quiz"
              className="vibrant-btn inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold lg:px-8 lg:py-4 lg:text-base"
            >
              <Play className="h-4 w-4 lg:h-5 lg:w-5" />
              Start Practice
            </Link>
            <Link
              href="/tutor"
              className="inline-flex transform items-center justify-center gap-2 rounded-lg border-2 border-accent px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground hover:shadow-lg lg:px-8 lg:py-4 lg:text-base"
            >
              <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5" />
              Ask AI Tutor
            </Link>
          </div>
          <AnimatedBars />
          <AvailableQuestions />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-12 lg:gap-4">
          <div className="card-accent group p-3 text-sm lg:p-4 lg:text-base">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform motion-safe:group-hover:-translate-y-1 motion-reduce:transition-none lg:h-10 lg:w-10">
                <ShieldCheck className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div>
                <div className="font-medium">FDA & Regulatory checks</div>
                <div className="text-xs text-muted-foreground lg:text-sm">
                  Drug & device references cross-checked with regulatory sources
                </div>
              </div>
            </div>
          </div>

          <div className="card-accent group p-3 text-sm lg:p-4 lg:text-base">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform motion-safe:group-hover:-translate-y-1 motion-reduce:transition-none lg:h-10 lg:w-10">
                <Cpu className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div>
                <div className="font-medium">
                  Contextual, evidence-backed AI
                </div>
                <div className="text-xs text-muted-foreground lg:text-sm">
                  AI answers grounded with citations and context
                </div>
              </div>
            </div>
          </div>

          <div className="card-accent group p-3 text-sm lg:p-4 lg:text-base">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition-transform motion-safe:group-hover:-translate-y-1 motion-reduce:transition-none lg:h-10 lg:w-10">
                <BookOpen className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div>
                <div className="font-medium">Verified clinical sources</div>
                <div className="text-xs text-muted-foreground lg:text-sm">
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
