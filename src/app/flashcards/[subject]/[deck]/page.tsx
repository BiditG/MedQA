import { notFound } from 'next/navigation'
import { PremiumGuard } from '@/components/PremiumGuard'
import { FlashcardStudyClient } from '@/components/flashcards/FlashcardStudyClient'
import { flashcardDecks, getFlashcardDeck } from '@/data/flashcards'
import { subjectToSlug } from '@/data/oneShotNotes'

type PageProps = {
  params: {
    subject: string
    deck: string
  }
}

export function generateStaticParams() {
  return flashcardDecks.map((deck) => ({
    subject: subjectToSlug(deck.subject),
    deck: deck.slug,
  }))
}

export function generateMetadata({ params }: PageProps) {
  const deck = getFlashcardDeck(params.subject, params.deck)

  return {
    title: deck ? `${deck.title} Flashcards | MEDQAS` : 'Flashcards | MEDQAS',
    description: deck
      ? `Study ${deck.title} with animated CEE flashcards and spaced revision.`
      : 'Study animated CEE flashcards with spaced revision.',
  }
}

export default function FlashcardDeckPage({ params }: PageProps) {
  const deck = getFlashcardDeck(params.subject, params.deck)
  if (!deck) return notFound()

  return (
    <PremiumGuard>
      <FlashcardStudyClient deck={deck} />
    </PremiumGuard>
  )
}
