import Link from 'next/link'

export default function UpgradePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Upgrade to Premium</h1>
      <p className="mt-2 text-muted-foreground">
        Get full access to all AI features. Plans start at ₹299 / month.
      </p>

      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-medium">Monthly</h2>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold">₹299</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>
          <ul className="mt-4 list-disc pl-5 text-sm text-muted-foreground">
            <li>Access to all AI tools</li>
            <li>Priority support</li>
            <li>Sync across devices</li>
          </ul>
          <div className="mt-6">
            <Link
              href="/upgrade/checkout?plan=monthly"
              className="inline-block w-full rounded bg-green-600 px-4 py-2 text-center text-white"
            >
              Buy monthly — ₹299 / mo
            </Link>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-medium">Yearly (recommended)</h2>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold">₹2,999</span>
            <span className="text-sm text-muted-foreground">/ year</span>
          </div>
          <ul className="mt-4 list-disc pl-5 text-sm text-muted-foreground">
            <li>Save more vs monthly</li>
            <li>All AI features</li>
            <li>Priority support</li>
          </ul>
          <div className="mt-6">
            <Link
              href="/upgrade/checkout?plan=yearly"
              className="inline-block w-full rounded bg-green-600 px-4 py-2 text-center text-white"
            >
              Buy yearly — ₹2,999 / yr
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-8 text-sm">
        Already a premium user?{' '}
        <Link href="/profile" className="underline">
          Visit your profile
        </Link>{' '}
        or{' '}
        <Link href="/login" className="underline">
          log in
        </Link>{' '}
        again to refresh your session.
      </div>
    </main>
  )
}
