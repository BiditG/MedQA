import type { FlashcardDifficulty, FlashcardProgress } from '@/data/flashcards'

export function calculateNextReview(
  difficulty: FlashcardDifficulty,
  currentProgress?: FlashcardProgress,
): Omit<FlashcardProgress, 'cardId' | 'difficultyHistory' | 'saved'> {
  const now = new Date()
  const progress = currentProgress ?? {
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
  }

  let easeFactor = progress.easeFactor
  let intervalDays = progress.intervalDays
  let repetitions = progress.repetitions

  if (difficulty === 'Again') {
    repetitions = 0
    intervalDays = 0
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  }

  if (difficulty === 'Hard') {
    repetitions += 1
    intervalDays = Math.max(1, Math.round(intervalDays * 1.2)) || 1
    easeFactor = Math.max(1.3, easeFactor - 0.15)
  }

  if (difficulty === 'Good') {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 3
    else intervalDays = Math.round(intervalDays * easeFactor)
  }

  if (difficulty === 'Easy') {
    repetitions += 1
    if (repetitions === 1) intervalDays = 3
    else if (repetitions === 2) intervalDays = 7
    else intervalDays = Math.round(intervalDays * (easeFactor + 0.3))
    easeFactor += 0.15
  }

  const nextReviewAt = new Date(now)
  nextReviewAt.setDate(now.getDate() + intervalDays)

  return {
    easeFactor,
    intervalDays,
    repetitions,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewAt.toISOString(),
    status:
      repetitions >= 5 && difficulty !== 'Again'
        ? 'mastered'
        : repetitions >= 2
          ? 'review'
          : 'learning',
  }
}
