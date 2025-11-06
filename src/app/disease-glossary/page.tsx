'use client'

import DiseaseGlossary from '@/components/DiseaseGlossary'
import { PremiumGuard } from '@/components/PremiumGuard'

export default function Page() {
  return (
    <PremiumGuard>
      <main className="flex w-full flex-1 flex-col items-center py-8">
        <DiseaseGlossary />
      </main>
    </PremiumGuard>
  )
}
