'use client'

import StrokeReport from '@/components/StrokeReport'
import { PremiumGuard } from '@/components/PremiumGuard'

export default function Page() {
  return (
    <PremiumGuard>
      <main className="p-6">
        <StrokeReport />
      </main>
    </PremiumGuard>
  )
}
