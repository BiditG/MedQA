import dynamic from 'next/dynamic'
import { PageHeader } from '@/components/PageHeader'

const MedicineSearch = dynamic(() => import('@/components/MedicineSearch'), {
  ssr: false,
})

export default function MedicinesPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Medicines"
        subtitle="Browse medicine details parsed from CSV"
      />
      <div className="mt-6">
        <MedicineSearch />
      </div>
    </div>
  )
}
