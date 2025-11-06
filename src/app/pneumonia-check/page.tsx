'use client'

import PneumoniaQuiz from '@/components/PneumoniaQuiz'
import { PremiumGuard } from '@/components/PremiumGuard'

export default function Page() {
  return (
    <PremiumGuard>
      <main className="p-6">
        <PneumoniaQuiz />
      </main>
    </PremiumGuard>
  )
}
