import { PremiumGuard } from '@/components/PremiumGuard'
import { CeeMcqSelector } from './CeeMcqSelector'

export const metadata = {
  title: 'CEE MCQs',
  description:
    'Subject-wise CEE MCQ practice for Physics, Chemistry, Zoology, Botany, and MAT.',
}

export default function CeeMcqsPage() {
  return (
    <PremiumGuard>
      <CeeMcqSelector />
    </PremiumGuard>
  )
}
