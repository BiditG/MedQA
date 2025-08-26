import dynamic from 'next/dynamic'
import { PageHeader } from '@/components/PageHeader'

// Dynamically load the client component on the client only to avoid server-side
// attempting to access client module internals (prevents "default.then" errors).
const DrugSearch = dynamic(() => import('@/components/DrugSearch'), {
  ssr: false,
})

export default function DrugsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Drug Lookup"
        subtitle="Search OpenFDA for drug label information"
      />
      <div className="mt-6">
        <DrugSearch />
      </div>
    </div>
  )
}
