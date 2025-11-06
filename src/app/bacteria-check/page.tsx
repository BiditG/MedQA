'use client'

import BacteriaQuiz from '@/components/BacteriaQuiz'
import { PremiumGuard } from '@/components/PremiumGuard'

export default function Page() {
  return (
    <PremiumGuard>
      <main className="p-6">
        <BacteriaQuiz />
      </main>
    </PremiumGuard>
  )
}
