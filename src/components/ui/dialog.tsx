'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function SubscriptionModal({
  open,
  onClose,
  onSubscribe,
}: {
  open: boolean
  onClose: () => void
  onSubscribe?: () => void
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open || !container) return null

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Unlock Premium Features</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get unlimited access to all medical learning tools
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Unlimited AI Tutor
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> All Clinical Checks
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> PDF to MCQ Generator
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> AI Diagnosis Tool
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 3D Visualizations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Drug & Device Lookup
            </li>
          </ul>

          <button
            onClick={() => {
              onSubscribe?.()
            }}
            className="w-full rounded-lg bg-gradient-to-r from-primary to-amber-500 px-4 py-3 font-semibold text-white hover:brightness-95"
          >
            Subscribe Now
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Cancel anytime • 7-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, container)
}
