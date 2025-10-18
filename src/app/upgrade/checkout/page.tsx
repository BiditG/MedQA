import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const params = useSearchParams()
  const plan = params?.get('plan') ?? 'monthly'
  const title = plan === 'yearly' ? 'Yearly — ₹2,999' : 'Monthly — ₹299'

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        You selected: <strong>{title}</strong>
      </p>

      <div className="mt-6 rounded-xl border p-6">
        <p className="text-sm">
          This is a placeholder checkout. Integrate your payment provider
          (Stripe/Razorpay) here to collect payment and mark the user as
          premium.
        </p>
        <div className="mt-6 flex gap-3">
          <button className="rounded bg-green-600 px-4 py-2 text-white">
            Pay now
          </button>
          <Link href="/upgrade" className="rounded border px-4 py-2">
            Back
          </Link>
        </div>
      </div>
    </main>
  )
}
