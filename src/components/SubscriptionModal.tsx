'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function SubscriptionModal({
  open,
  onClose,
  onSubscribe, // <-- add this prop
  isAuthed,
}: {
  open: boolean
  onClose: () => void
  onSubscribe?: () => void // <-- add this to the type
  isAuthed?: boolean
}) {
  const [container] = useState(() =>
    typeof document !== 'undefined' ? document.createElement('div') : null,
  )

  useEffect(() => {
    if (!container) return
    document.body.appendChild(container)
    return () => {
      if (container.parentNode) container.parentNode.removeChild(container)
    }
  }, [container])
  // keep hooks stable between renders: declare selection state before
  // any early returns so hook order never changes when `open` toggles.
  const [selected, setSelected] = useState<'1m' | '3m' | '1y'>('1m')

  if (!open || !container) return null
  const modal = (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-6 sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-[95vw] overflow-y-auto rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-2xl ring-1 ring-black/5 sm:max-w-4xl sm:p-6 md:max-w-6xl md:p-8 lg:max-w-7xl lg:p-10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="grid grid-cols-1 items-start gap-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c-1.657 0-3 1.343-3 3v5h6v-5c0-1.657-1.343-3-3-3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 5v1"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold leading-tight">
              Go Premium — Unlock everything MEDQAS offers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribing gives you full access to all AI tools, premium
              content, faster processing, and priority support — everything in
              one simple plan.
            </p>

            <div className="mt-4 grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
              <div>
                <div className="text-sm font-semibold">What you get</div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-3 w-3 rounded-full bg-green-500" />
                    Full AI Tutor: stepwise clinical reasoning, evidence-backed
                    answers, and follow-ups
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-3 w-3 rounded-full bg-green-500" />
                    PDF → MCQ: convert notes & lectures into practice questions
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-3 w-3 rounded-full bg-green-500" />
                    Advanced visualization: 3D previews, annotated images, and
                    flowcharts
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-3 w-3 rounded-full bg-green-500" />
                    Priority processing & higher upload limits for documents and
                    images
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-3 w-3 rounded-full bg-green-500" />
                    Full question bank & premium exam packages (CEE, AIIMS, NEET
                    PG)
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-sm font-semibold">Pricing & details</div>
                <div className="mt-2 text-sm">
                  Simple plans — pay monthly, quarterly, or yearly. All plans
                  include a 7-day free trial on first-time signups.
                </div>
                <div className="mt-3">
                  {/* Pricing cards — grid on larger screens (1 / 2 / 3 columns) */}
                  <div className="flex flex-col gap-3">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected('1m')}
                      onKeyDown={(e) => e.key === 'Enter' && setSelected('1m')}
                      className={
                        'flex h-full min-h-[84px] items-center justify-between rounded-lg border p-4 shadow-sm ' +
                        (selected === '1m'
                          ? 'bg-card ring-2 ring-primary/60'
                          : 'bg-card/50')
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                          {/* currency icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 8c-1.657 0-3 1.343-3 3v5h6v-5c0-1.657-1.343-3-3-3z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 5v1"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Monthly</div>
                          <div className="text-xs text-muted-foreground">
                            Billed monthly — cancel anytime
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">रु 999</div>
                        <div className="text-xs text-muted-foreground">
                          / month
                        </div>
                      </div>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected('3m')}
                      onKeyDown={(e) => e.key === 'Enter' && setSelected('3m')}
                      className={
                        'flex h-full min-h-[84px] items-center justify-between rounded-lg border p-4 shadow-sm ' +
                        (selected === '3m'
                          ? 'bg-card ring-2 ring-primary/60'
                          : 'bg-card/50')
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-accent/10 p-2 text-accent">
                          {/* calendar icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Quarterly</div>
                          <div className="text-xs text-muted-foreground">
                            Billed every 3 months — best for short-term savings
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">रु 1499</div>
                        <div className="text-xs text-muted-foreground">
                          / 3 months
                        </div>
                      </div>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected('1y')}
                      onKeyDown={(e) => e.key === 'Enter' && setSelected('1y')}
                      className={
                        'flex h-full min-h-[84px] items-center justify-between rounded-lg border p-4 shadow-sm ' +
                        (selected === '1y'
                          ? 'bg-card ring-2 ring-primary/60'
                          : 'bg-card/50')
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">
                            {/* trophy icon */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 21h8M12 11v10M5 7h14l-1 4a3 3 0 01-3 3H9a3 3 0 01-3-3L5 7z"
                              />
                            </svg>
                          </div>
                          <span className="absolute -right-3 -top-3 rounded-full border-2 border-white bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-bold text-white shadow-lg">
                            Best Value
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Yearly</div>
                          <div className="text-xs text-muted-foreground">
                            Billed yearly — biggest savings + priority support
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">रु 4999</div>
                        <div className="text-xs text-muted-foreground">
                          / year
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onSubscribe?.()

                      // Close modal promptly for snappy UX
                      onClose()

                      // Always allow viewing plans and subscribing without sign-in
                      const redirectTo = `/pricing?selected=${selected}`
                      setTimeout(() => {
                        window.location.href = redirectTo
                      }, 150)
                    }}
                    className="vibrant-btn w-full sm:w-auto"
                  >
                    View Plans & Subscribe
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Need help? Reply to{' '}
              <a className="underline" href="mailto:medqas.np@gmail.com">
                medqas.np@gmail.com
              </a>{' '}
              for discounts and support.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="text-sm text-muted-foreground" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, container)
}
