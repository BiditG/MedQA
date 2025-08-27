import MRIQuiz from '@/components/MRIQuiz'

export const metadata = {
  title: 'Tumour Check',
}

export default function Page() {
  return (
    <main className="p-6">
      <MRIQuiz />
    </main>
  )
}
