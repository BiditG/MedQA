'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Check, ExternalLink, Star } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function PricingPage() {
  const features = [
    {
      emoji: '🧠',
      title: 'AI Tutor',
      desc: 'Stepwise clinical reasoning, evidence-backed answers, adaptive follow-ups.',
    },
    {
      emoji: '📄',
      title: 'PDF → MCQ Generator',
      desc: 'Convert notes, lectures and PDFs into exam-style practice questions.',
    },
    {
      emoji: '🫀',
      title: '3D Organ Models',
      desc: 'High-quality 3D anatomy: rotate, zoom, annotate and compare organs.',
    },
    {
      emoji: '🔍',
      title: 'Clinical Checks & Diagnosis',
      desc: 'Heart, stroke, pneumonia and MRI checks powered by AI-assisted tools.',
    },
    {
      emoji: '📚',
      title: 'Full Question Bank',
      desc: 'Curated MCQs and premium exam packages (CEE, AIIMS, NEET PG, and more).',
    },
    {
      emoji: '⚡',
      title: 'Priority Processing',
      desc: 'Faster processing, higher upload limits, and priority queueing for heavy tasks.',
    },
    {
      emoji: '�',
      title: 'Drug & Device Lookup',
      desc: 'Quick access to medicine details and device references.',
    },
    {
      emoji: '📈',
      title: 'Study Progress & Analytics',
      desc: 'Track strengths, weaknesses and personalized study recommendations.',
    },
    {
      emoji: '🤝',
      title: 'Priority Support',
      desc: 'Faster responses and dedicated support for premium users.',
    },
    {
      emoji: '📱',
      title: 'Cross-Platform Access',
      desc: 'Use MEDQAS on web, tablet, and mobile with synced progress.',
    },
  ]

  const plans = [
    { id: '1m', name: '1 Month', original: 1299, price: 999, save: 300 },
    { id: '3m', name: '3 Months', original: 2499, price: 1499, save: 1000 },
    { id: '1y', name: '1 Year', original: 9999, price: 4999, save: 5000 },
  ]
  const [selected, setSelected] = useState(plans[0])
  const fmt = (n: number) => `रु ${n.toLocaleString('en-IN')}`

  const search = useSearchParams()
  useEffect(() => {
    const s = search?.get('selected')
    if (!s) return
    const found = plans.find((p) => p.id === s)
    if (found) setSelected(found)
  }, [search])

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 py-6 sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative z-10 mx-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-gradient-to-b from-white to-slate-50 shadow-2xl ring-1 ring-black/5">
        {/* Close */}
        <div className="flex items-center justify-between border-b bg-white/70 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM7 12h10M12 7v10" />
              </svg>
            </span>
            <h2 className="text-sm font-semibold">Premium Subscription</h2>
          </div>
          <button
            onClick={() =>
              history.length > 1 ? history.back() : (window.location.href = '/')
            }
            aria-label="Close pricing"
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent/50"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-6 sm:px-6">
          {/* Discount banner (top, no borders) */}
          <section className="relative mb-6 overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-4 text-center">
            <p className="text-base font-semibold">
              We have discounts right now — save money on your purchase
              <span className="ml-2 inline-block animate-pulse">🎉</span>
            </p>

            <div aria-hidden className="pointer-events-none absolute inset-0">
              <span
                className="confetti"
                style={{
                  left: '8%',
                  background: '#2563EB',
                  animationDuration: '2.2s',
                  animationDelay: '0s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '16%',
                  background: '#06B6D4',
                  animationDuration: '2.6s',
                  animationDelay: '.1s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '24%',
                  background: '#60A5FA',
                  animationDuration: '2.0s',
                  animationDelay: '.2s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '32%',
                  background: '#7C3AED',
                  animationDuration: '2.4s',
                  animationDelay: '.05s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '40%',
                  background: '#2563EB',
                  animationDuration: '2.1s',
                  animationDelay: '.15s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '48%',
                  background: '#06B6D4',
                  animationDuration: '2.7s',
                  animationDelay: '.3s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '56%',
                  background: '#60A5FA',
                  animationDuration: '2.3s',
                  animationDelay: '.12s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '64%',
                  background: '#7C3AED',
                  animationDuration: '2.8s',
                  animationDelay: '.25s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '72%',
                  background: '#2563EB',
                  animationDuration: '2.5s',
                  animationDelay: '.18s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '80%',
                  background: '#06B6D4',
                  animationDuration: '2.2s',
                  animationDelay: '.28s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '88%',
                  background: '#60A5FA',
                  animationDuration: '2.9s',
                  animationDelay: '.08s',
                }}
              />
              <span
                className="confetti"
                style={{
                  left: '94%',
                  background: '#7C3AED',
                  animationDuration: '2.4s',
                  animationDelay: '.22s',
                }}
              />
            </div>

            <style jsx>{`
              @keyframes confetti-fall {
                0% {
                  transform: translateY(-120%) rotate(0deg);
                  opacity: 0;
                }
                10% {
                  opacity: 0.95;
                }
                100% {
                  transform: translateY(140%) rotate(540deg);
                  opacity: 0.95;
                }
              }
              .confetti {
                position: absolute;
                top: -10%;
                width: 8px;
                height: 14px;
                border-radius: 2px;
                opacity: 0.9;
                animation-name: confetti-fall;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
              }
            `}</style>
          </section>
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="heading-gradient mb-2 text-3xl font-bold">
              Premium Subscription
            </h1>
            <p className="text-base text-muted-foreground">
              Unlock all premium features and supercharge your medical learning
            </p>
          </div>
          {/* Premium features (hover to reveal description) */}
          <section className="mb-6">
            <h3 className="mb-4 text-xl font-bold">Premium features</h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <li
                  key={f.title}
                  className="group rounded-lg border bg-card p-4 transition focus-within:bg-accent/40 hover:bg-accent/40"
                >
                  <button
                    type="button"
                    className="w-full text-left font-medium outline-none"
                  >
                    <span className="mr-2" aria-hidden>
                      {f.emoji}
                    </span>
                    {f.title}
                  </button>
                  <p className="mt-2 max-h-0 overflow-hidden text-sm text-muted-foreground opacity-0 transition-all duration-200 ease-out group-focus-within:max-h-24 group-focus-within:opacity-100 group-hover:max-h-24 group-hover:opacity-100">
                    {f.desc}
                  </p>
                </li>
              ))}
            </ul>
          </section>
          {/* Plans row */}
          <section className="mb-6">
            <h3 className="mb-4 text-2xl font-bold">Plans</h3>
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {plans.map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p)} // keeps amount updating
                  className="card-accent relative rounded-lg border p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.28 }}
                >
                  {p.id === '1y' && (
                    <span className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      <Star className="h-3 w-3" /> Best Value
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-semibold">{p.name}</div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground line-through">
                        {fmt(p.original)}
                      </div>
                      <div className="text-2xl font-bold">{fmt(p.price)}</div>
                      <div className="text-xs text-blue-600">
                        Save {p.save.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </section>{' '}
          {/* end of Plans row */}
          {/* Payment Instructions (below banner) */}
          <section className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-xl font-bold">Payment Instructions</h3>

            {/* QR Code */}
            <div className="mb-6">
              <p className="mb-3 text-sm text-muted-foreground">
                Scan this QR code to pay via Esewa:
              </p>
              <div className="flex justify-center rounded-lg border bg-white p-4">
                <Image
                  src="/data/QR.jpg"
                  alt="Payment QR Code"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
              <p className="mt-2 text-center font-mono text-sm">
                Esewa ID: 9803526374
              </p>
            </div>

            {/* Payment Amount (from selected plan) */}
            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Amount to Pay:</span>
                <span className="text-2xl font-bold text-primary">
                  {fmt(selected.price)}
                </span>
              </div>
            </div>

            {/* Steps */}
            <div className="mb-6 space-y-3">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <p className="text-sm">
                  Scan the QR code or use the Esewa ID above
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <p className="text-sm">
                  Complete the payment of {fmt(selected.price)}
                </p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <p className="text-sm">
                  Submit payment proof using the form below
                </p>
              </div>
            </div>

            {/* Google Form Button */}
            <a
              href="https://forms.gle/JPVGJtaC5Uj3zaep6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:brightness-95"
            >
              Submit Payment Proof
              <ExternalLink className="h-4 w-4" />
            </a>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Your subscription will be activated within 24 hours after
              verification
            </p>
          </section>
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Questions or issues? Contact us at{' '}
              <a href="mailto:medqas.np@gmail.com" className="underline">
                medqas.np@gmail.com
              </a>{' '}
              — we typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PricingPage />
    </Suspense>
  )
}
