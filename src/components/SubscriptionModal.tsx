'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createBrowserClient } from '@/utils/supabase-browser'

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

  if (!open || !container) return null

  const modal = (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-6 sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-2xl ring-1 ring-black/5 sm:p-6"
        onClick={(e) => e.stopPropagation()} // <-- Add this to prevent clicks inside modal from bubbling
      >
        <div className="flex flex-col gap-4 gap-6 sm:flex-row sm:items-start">
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
              tools and many more. One subscription covers everything.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
              <div className="sm:col-span-2">
                {/* Prices in one line */}
                <div className="whitespace-nowrap text-xs font-semibold leading-tight tracking-tight sm:text-sm md:text-base">
                  रु 999 (1 month), रु 1499 (3 months), रु 4999 (1 year)
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Cancel anytime. Secure payment methods supported.
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
                <button
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onSubscribe?.()

                    // Close modal promptly for snappy UX
                    onClose()

                    // Determine auth state: prefer prop (treat truthy values as authed), fallback to Supabase
                    let authed =
                      typeof isAuthed !== 'undefined'
                        ? Boolean(isAuthed)
                        : undefined
                    if (authed === undefined) {
                      try {
                        const supabase = createBrowserClient()
                        // use getSession which is more reliable for client session presence
                        const { data, error } = await supabase.auth.getSession()
                        if (error) {
                          console.debug(
                            '[subscribe] getSession error',
                            error.message,
                          )
                        }
                        authed = !!data?.session?.user
                      } catch (err) {
                        console.debug('[subscribe] supabase client error', err)
                        authed = false
                      }
                    }

                    const redirectTo = encodeURIComponent('/pricing')
                    const loginMsg = encodeURIComponent(
                      'Please sign in to subscribe',
                    )

                    // Small delay to allow modal close animation before navigation
                    setTimeout(() => {
                      if (authed) {
                        window.location.href = '/pricing'
                      } else {
                        window.location.href = `/login?message=${loginMsg}&redirectTo=${redirectTo}`
                      }
                    }, 100)
                  }}
                  className="vibrant-btn"
                >
                  Subscribe — plans from रु 999
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
