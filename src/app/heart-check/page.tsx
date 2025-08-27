import HeartReport from '@/components/HeartReport'

export const metadata = {
  title: 'Heart Check — MEDQAS',
}

export default function Page() {
  return (
    <main className="p-6">
      <HeartReport />
    </main>
  )
}
