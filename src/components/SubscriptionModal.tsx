'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function SubscriptionModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
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

  if (!open || !container) return null

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
            <h2 className="text-xl font-semibold">
              Go Premium — All AI features
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Unlock advanced AI tutor, PDF → MCQ, visualization and diagnostic
              tools. One subscription covers everything.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
              <div className="sm:col-span-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-extrabold">रु 299</div>
                  <div className="text-sm text-muted-foreground">/ month</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Billed monthly. Cancel anytime. Secure payment methods
                  supported.
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 rounded-full bg-green-500" />
                    All AI tutor features
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 rounded-full bg-green-500" />
                    PDF → MCQ exports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 rounded-full bg-green-500" />
                    Priority processing & larger uploads
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end">
                <button className="rounded-full bg-primary px-6 py-3 text-white shadow hover:brightness-95">
                  Subscribe — रु 299 / month
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Students and educators: reply to our support email for educational
              discounts.
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
