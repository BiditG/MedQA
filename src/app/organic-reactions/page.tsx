import { PremiumGuard } from '@/components/PremiumGuard'
import { OrganicReactionsClient } from './OrganicReactionsClient'

export const metadata = {
  title: 'Organic Reactions',
  description:
    'Chapter-wise CEE organic chemistry reactions with diagrammatic reaction schemes.',
}

export default function OrganicReactionsPage() {
  return (
    <PremiumGuard>
      <OrganicReactionsClient />
    </PremiumGuard>
  )
}
