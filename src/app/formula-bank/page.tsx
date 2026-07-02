import { PremiumGuard } from '@/components/PremiumGuard'
import { FormulaBankClient } from './FormulaBankClient'

export const metadata = {
  title: 'Formula Bank',
  description:
    'Chapter-wise CEE Physics and Chemistry formula bank for quick revision.',
}

export default function FormulaBankPage() {
  return (
    <PremiumGuard>
      <FormulaBankClient />
    </PremiumGuard>
  )
}
