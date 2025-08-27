'use client'

import Link from 'next/link'
import { Hero } from './(home)/components/Hero'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Brain,
  Box,
  FileText,
  Layers,
  BookOpen,
  Stethoscope,
  Scan,
  Microscope,
  Activity,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

function HomeInner() {
  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <Hero />
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <WhatWeOffer />
        </div>
      </section>
      <footer className="w-full border-t border-t-foreground/10 p-8 text-center text-xs">
        <p className="mb-2 text-muted-foreground">
          Built with Next.js, Tailwind, and Supabase
        </p>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={<div className="w-full max-w-6xl px-4 py-8">Loading…</div>}
    >
      <HomeInner />
    </Suspense>
  )
}

function WhatWeOffer() {
  const cards = [
    {
      href: '/quiz',
      title: 'Practice MCQs',
      desc: 'Exam-style questions with explanations.',
      Icon: Brain,
    },
    {
      href: '/tutor',
      title: 'AI Tutor',
      desc: 'Ask clinical questions; get concise answers.',
      Icon: Brain,
    },
    {
      href: '/pathogenesis',
      title: 'Pathogenesis Maker',
      desc: 'Turn topics into clean flowcharts.',
      Icon: Layers,
    },
    {
      href: '/pdf-to-mcq',
      title: 'PDF → MCQ',
      desc: 'Generate practice questions from notes.',
      Icon: FileText,
    },
    {
      href: '/disease-glossary',
      title: 'Disease Glossary',
      desc: 'Browse concise disease summaries.',
      Icon: BookOpen,
    },
    {
      href: '/visualize',
      title: '3D Visuals',
      desc: 'Anatomy previews and image-based learning.',
      Icon: Box,
    },
    {
      href: '/diagnose',
      title: 'Diagnose Helper',
      desc: 'Differentials and reasoning support.',
      Icon: Stethoscope,
    },
    {
      href: '/devices',
      title: 'Medical Devices',
      desc: 'Common devices and quick references.',
      Icon: Activity,
    },
    {
      href: '/drugs',
      title: 'Drugs',
      desc: 'Drug classes, uses, and side effects.',
      Icon: Microscope,
    },
    {
      href: '/stroke-check',
      title: 'Stroke Check',
      desc: 'FAST assessments and guidance.',
      Icon: Activity,
    },
    {
      href: '/heart-check',
      title: 'Heart Check',
      desc: 'Basic checks and triage signals.',
      Icon: Activity,
    },
    {
      href: '/bacteria-check',
      title: 'Bacteria Check',
      desc: 'ID helpers and quick tips.',
      Icon: Microscope,
    },
    {
      href: '/pneumonia-check',
      title: 'Pneumonia Check',
      desc: 'Quick screening references.',
      Icon: Scan,
    },
    {
      href: '/mri-check',
      title: 'MRI Check',
      desc: 'MRI basics and image cues.',
      Icon: Scan,
    },
  ] as const

  const reduce = useReducedMotion()
  const container = reduce
    ? undefined
    : {
        hidden: {},
        show: {
          transition: { staggerChildren: 0.06 },
        },
      }
  const item = reduce
    ? undefined
    : {
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: { duration: 0.36 } },
      }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">What we offer</h2>
      <motion.div
        variants={container}
        initial={reduce ? undefined : 'hidden'}
        whileInView={reduce ? undefined : 'show'}
        viewport={{ once: true, amount: 0.15 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map(({ href, title, desc, Icon }) => (
          <motion.div key={href} variants={item}>
            <Link href={href} className="group outline-none">
              <Card className="h-full transition-transform duration-200 group-hover:-translate-y-0.5">
                <CardHeader className="flex-row items-center gap-3">
                  <div className="bg-primary/15 inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base sm:text-lg">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground sm:text-base">
                  {desc}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
