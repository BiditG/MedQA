import DiseaseGlossary from '@/components/DiseaseGlossary'

export const metadata = {
  title: 'Disease Glossary — Nepali',
  description: 'English to Nepali disease name glossary',
}

export default function Page() {
  return (
    <main className="flex w-full flex-1 flex-col items-center py-8">
      <DiseaseGlossary />
    </main>
  )
}
