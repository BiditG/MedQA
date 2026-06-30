'use client'

import { Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ExternalLink, Star } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type Plan = {
  id: string
  name: string
  original: number
  price: number
  save: number
}

const plans: Plan[] = [
  { id: '1m', name: '1 Month', original: 1299, price: 499, save: 800 },
  { id: '3m', name: '3 Months', original: 2499, price: 999, save: 1500 },
  { id: '1y', name: '1 Year', original: 9999, price: 2499, save: 7500 },
]

const notesPrice = 349

function PricingPage() {
  const [selected, setSelected] = useState(plans[0])
  const [includeNotes, setIncludeNotes] = useState(false)
  const search = useSearchParams()
  const total = selected.price + (includeNotes ? notesPrice : 0)
  const fmt = (n: number) => `Rs ${n.toLocaleString('en-IN')}`

  useEffect(() => {
    const selectedPlan = search?.get('selected')
    const notes = search?.get('notes')
    if (notes === '1') setIncludeNotes(true)
    if (!selectedPlan) return

    const found = plans.find((plan) => plan.id === selectedPlan)
    if (found) setSelected(found)
  }, [search])

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 py-6 sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 mx-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-gradient-to-b from-white to-slate-50 shadow-2xl ring-1 ring-black/5">
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
          <section className="relative mb-6 overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 p-4 text-center">
            <p className="text-base font-semibold">
              Discounts are active right now. Choose a plan and pay the shown
              total.
            </p>
          </section>

          <div className="mb-8 text-center">
            <h1 className="heading-gradient mb-2 text-3xl font-bold">
              Premium Subscription
            </h1>
            <p className="text-base text-muted-foreground">
              Choose your plan and optional revision notes bundle.
            </p>
          </div>

          <section className="mb-6">
            <h3 className="mb-4 text-2xl font-bold">Plans</h3>
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {plans.map((plan, index) => (
                <motion.button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelected(plan)}
                  className={
                    'card-accent relative rounded-lg border p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none ' +
                    (selected.id === plan.id ? 'ring-2 ring-primary/60' : '')
                  }
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.28 }}
                >
                  {plan.id === '1y' && (
                    <span className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      <Star className="h-3 w-3" /> Best Value
                    </span>
                  )}
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-lg font-semibold">{plan.name}</div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground line-through">
                        {fmt(plan.original)}
                      </div>
                      <div className="text-2xl font-bold">
                        {fmt(plan.price)}
                      </div>
                      <div className="text-xs text-blue-600">
                        Save {plan.save.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            <button
              type="button"
              onClick={() => setIncludeNotes((value) => !value)}
              className={
                'mt-4 flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none ' +
                (includeNotes ? 'ring-2 ring-primary/60' : '')
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    'flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ' +
                    (includeNotes
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40')
                  }
                >
                  {includeNotes ? '✓' : null}
                </span>
                <div>
                  <div className="text-lg font-semibold">
                    Colorful Revision Notes Bundle
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Additional focused revision notes bundle.
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{fmt(notesPrice)}</div>
                <div className="text-xs text-muted-foreground">one time</div>
              </div>
            </button>
          </section>

          <section className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-xl font-bold">Payment Instructions</h3>

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

            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{selected.name} plan</span>
                  <span>{fmt(selected.price)}</span>
                </div>
                {includeNotes ? (
                  <div className="flex items-center justify-between text-sm">
                    <span>Colorful revision notes bundle</span>
                    <span>{fmt(notesPrice)}</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="font-semibold">Amount to Pay:</span>
                <span className="text-2xl font-bold text-primary">
                  {fmt(total)}
                </span>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <p className="text-sm">Scan the QR code or use the Esewa ID.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <p className="text-sm">Complete the payment of {fmt(total)}.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <p className="text-sm">
                  Submit payment proof using the form below.
                </p>
              </div>
            </div>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSe49scpgfJJoP9aB9kpSW0uQaa-gqIcNbpGqJeQp5zJkD1IQw/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:brightness-95"
            >
              Submit Payment Proof
              <ExternalLink className="h-4 w-4" />
            </a>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Your subscription will be activated within 24 hours after
              verification.
            </p>
          </section>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Questions or issues? Contact us at{' '}
              <a href="mailto:medqas.np@gmail.com" className="underline">
                medqas.np@gmail.com
              </a>{' '}
              or WhatsApp +977 9803526374. We typically respond within 24 hours.
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
