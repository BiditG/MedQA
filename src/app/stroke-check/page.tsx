import StrokeReport from '@/components/StrokeReport'

export const metadata = {
  title: 'Stroke Check — MEDQAS',
}

export default function Page() {
  return (
    <main className="p-6">
      <StrokeReport />
    </main>
  )
}
