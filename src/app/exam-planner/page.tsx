import { PremiumGuard } from '@/components/PremiumGuard'
import { ExamPlannerClient } from './ExamPlannerClient'

export const metadata = {
  title: 'Exam Tracker',
  description:
    'CEE chapter tracker with readiness status and estimated marks tracking.',
}

export default function ExamTrackerPage() {
  return (
    <PremiumGuard>
      <ExamPlannerClient />
    </PremiumGuard>
  )
}
