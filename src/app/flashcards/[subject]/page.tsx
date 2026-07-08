import { notFound } from 'next/navigation'
import { PremiumGuard } from '@/components/PremiumGuard'
import { FlashcardsSubjectClient } from '@/components/flashcards/FlashcardsSubjectClient'
import { getFlashcardDecksBySubject } from '@/data/flashcards'
import { getOneShotSubject, oneShotSubjects } from '@/data/oneShotNotes'

type PageProps = {
  params: {
    subject: string
  }
}

export function generateStaticParams() {
  return oneShotSubjects.map((subject) => ({ subject: subject.slug }))
}

export function generateMetadata({ params }: PageProps) {
  const subject = getOneShotSubject(params.subject)

  return {
    title: subject
      ? `${subject.name} CEE Flashcards | MEDQAS`
      : 'CEE Flashcards | MEDQAS',
    description: subject
      ? `Animated ${subject.name} flashcards with spaced revision for CEE preparation.`
      : 'Animated CEE flashcards with spaced revision.',
  }
}

export default function FlashcardsSubjectPage({ params }: PageProps) {
  const subject = getOneShotSubject(params.subject)
  if (!subject) return notFound()

  return (
    <PremiumGuard>
      <FlashcardsSubjectClient
        subject={subject.name}
        decks={getFlashcardDecksBySubject(params.subject)}
      />
    </PremiumGuard>
  )
}
