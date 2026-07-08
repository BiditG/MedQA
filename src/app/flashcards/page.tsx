import { PremiumGuard } from '@/components/PremiumGuard'
import { FlashcardsHomeClient } from '@/components/flashcards/FlashcardsHomeClient'
import { flashcardDecks } from '@/data/flashcards'

export const metadata = {
  title: 'CEE Flashcards with Spaced Revision | MEDQAS',
  description:
    'Study animated Biology, Chemistry, Physics, and MAT flashcards with spaced revision on MEDQAS.',
}

export default function FlashcardsPage() {
  return (
    <PremiumGuard>
      <FlashcardsHomeClient decks={flashcardDecks} />
    </PremiumGuard>
  )
}
