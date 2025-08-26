import DrugSearch from '@/components/DrugSearch'
import { PageHeader } from '@/components/PageHeader'

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
