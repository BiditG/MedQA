'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, ExternalLink } from 'lucide-react'

export default function PricingPage() {
  const features = [
    {
      emoji: '🧠',
      title: 'Full MCQ Library',
      desc: 'Practice thousands of multiple-choice questions across subjects.',
    },
    {
      emoji: '🫀',
      title: '3D Organ Models',
      desc: 'Ultra-realistic 3D anatomy models; rotate, zoom, and go fullscreen.',
    },
    {
      emoji: '🔍',
      title: 'Compare Organs',
      desc: 'View up to 9 organs simultaneously to understand relationships.',
    },
    {
      emoji: '🎯',
      title: 'Entrance Prep Modules',
      desc: 'Nepali-specific medical entrance preparation content.',
    },
    {
      emoji: '🤖',
      title: 'AI-Powered Tools',
      desc: 'Smart study recommendations, generate MCQs from PDFs, pathogenesis flowcharts.',
    },
    {
      emoji: '📈',
      title: 'Study Progress Tracker',
      desc: 'Track your performance and focus on weak areas.',
    },
    {
      emoji: '✨',
      title: 'Interactive Learning',
      desc: 'Engaging visuals and AI-assisted explanations make learning faster.',
    },
    {
      emoji: '📱',
      title: 'Cross-Platform Access',
      desc: 'Access from web, tablet, or mobile.',
    },
  ]

  const plans = [
    { id: '1m', name: '1 Month', original: 1299, price: 999, save: 300 },
    { id: '3m', name: '3 Months', original: 2499, price: 1499, save: 1000 },
    { id: '1y', name: '1 Year', original: 9999, price: 4999, save: 5000 },
  ]
  const [selected, setSelected] = useState(plans[0])
  const fmt = (n: number) => `रु ${n.toLocaleString('en-IN')}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Discount banner (top, no borders) */}
        <section className="relative mb-8 overflow-hidden bg-gradient-to-r from-amber-50 to-pink-50 p-4 text-center">
          <p className="text-base font-semibold">
            We have discounts right now — save money on your purchase
            <span className="ml-2 inline-block animate-pulse">🎉</span>
          </p>

          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span
              className="confetti"
              style={{
                left: '8%',
                background: '#F59E0B',
                animationDuration: '2.2s',
                animationDelay: '0s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '16%',
                background: '#10B981',
                animationDuration: '2.6s',
                animationDelay: '.1s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '24%',
                background: '#3B82F6',
                animationDuration: '2.0s',
                animationDelay: '.2s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '32%',
                background: '#EC4899',
                animationDuration: '2.4s',
                animationDelay: '.05s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '40%',
                background: '#F59E0B',
                animationDuration: '2.1s',
                animationDelay: '.15s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '48%',
                background: '#10B981',
                animationDuration: '2.7s',
                animationDelay: '.3s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '56%',
                background: '#3B82F6',
                animationDuration: '2.3s',
                animationDelay: '.12s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '64%',
                background: '#EC4899',
                animationDuration: '2.8s',
                animationDelay: '.25s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '72%',
                background: '#F59E0B',
                animationDuration: '2.5s',
                animationDelay: '.18s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '80%',
                background: '#10B981',
                animationDuration: '2.2s',
                animationDelay: '.28s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '88%',
                background: '#3B82F6',
                animationDuration: '2.9s',
                animationDelay: '.08s',
              }}
            />
            <span
              className="confetti"
              style={{
                left: '94%',
                background: '#EC4899',
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
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Premium Subscription</h1>
          <p className="text-lg text-muted-foreground">
            Unlock all premium features and supercharge your medical learning
          </p>
        </div>
        {/* Premium features (hover to reveal description) */}
        <section className="mb-8">
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
        <section className="mb-8">
          <h3 className="mb-4 text-2xl font-bold">Plans</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)} // keeps amount updating
                className="rounded-lg border p-4 text-left hover:shadow-sm focus:outline-none" // removed active ring styling
              >
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground line-through">
                      {fmt(p.original)}
                    </div>
                    <div className="text-2xl font-bold">{fmt(p.price)}</div>
                    <div className="text-xs text-green-600">
                      Save {p.save.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>{' '}
        {/* end of Plans row */}
        {/* Payment Instructions (below banner) */}
        <section className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-xl font-bold">Payment Instructions</h3>

          {/* QR Code */}
          <div className="mb-6">
            <p className="mb-3 text-sm text-muted-foreground">
              Scan this QR code to pay via UPI:
            </p>
            <div className="flex justify-center rounded-lg border bg-white p-4">
              <Image
                src="/payment-qr.png"
                alt="Payment QR Code"
                width={200}
                height={200}
                className="rounded"
              />
            </div>
            <p className="mt-2 text-center font-mono text-sm">
              UPI ID: your-upi@okaxis
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
                Scan the QR code or use the UPI ID above
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
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            ✓ Secure payment • ✓ Cancel anytime • ✓ 7-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}
