'use client'

import CeeExam from '@/components/CeeExam'
import { PremiumGuard } from '@/components/PremiumGuard'

export default function Page() {
  return (
    <PremiumGuard>
      <main className="p-4">
        <CeeExam />
      </main>
    </PremiumGuard>
  )
}
