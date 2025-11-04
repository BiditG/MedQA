'use client'

import Image from 'next/image'
import { Check, ExternalLink } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Premium Subscription</h1>
          <p className="text-lg text-muted-foreground">
            Unlock all premium features and supercharge your medical learning
          </p>
        </div>

        {/* Payment Section */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: Plan Details */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-2xl font-bold">Monthly Plan</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">रु 299</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Unlimited AI Tutor access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>All clinical checks & quizzes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>PDF to MCQ generator</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>AI Diagnosis tool</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>3D Medical Visualizations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>Drug & Device Lookup</span>
              </li>
            </ul>
          </div>

          {/* Right: Payment Instructions */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-xl font-bold">Payment Instructions</h3>

            {/* QR Code */}
            <div className="mb-6">
              <p className="mb-3 text-sm text-muted-foreground">
                Scan this QR code to pay via UPI:
              </p>
              <div className="flex justify-center rounded-lg border bg-white p-4">
                <Image
                  src="/payment-qr.png" // Put your QR code image in public/payment-qr.png
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

            {/* Payment Amount */}
            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Amount to Pay:</span>
                <span className="text-2xl font-bold text-primary">रु 299</span>
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
                <p className="text-sm">Complete the payment of रु 299</p>
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
              href="https://forms.gle/YOUR_GOOGLE_FORM_ID" // Replace with your Google Form link
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
          </div>
        </div>

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
