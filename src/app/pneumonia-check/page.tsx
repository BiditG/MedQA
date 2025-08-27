import PneumoniaQuiz from '@/components/PneumoniaQuiz'

export const metadata = {
  title: 'Pneumonia Check',
}

export default function Page() {
  return (
    <main className="p-6">
      <PneumoniaQuiz />
    </main>
  )
}
