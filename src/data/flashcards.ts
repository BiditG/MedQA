import { readFileSync } from 'fs'
import path from 'path'
import { OneShotSubject, subjectToSlug } from './oneShotNotes'

export type FlashcardDifficulty = 'Again' | 'Hard' | 'Good' | 'Easy'
export type FlashcardSubject = OneShotSubject
export type FlashcardType =
  | 'basic'
  | 'formula'
  | 'reaction'
  | 'diagram'
  | 'trap'
  | 'trick'

export type Flashcard = {
  id: string
  slug: string
  subject: FlashcardSubject
  chapter: string
  topic: string
  deckId: string
  type: FlashcardType
  front: string
  back: string
  hint?: string
  explanation?: string
  tags?: string[]
}

export type FlashcardDeck = {
  id: string
  slug: string
  title: string
  subject: FlashcardSubject
  chapter: string
  topic: string
  description: string
  cardCount: number
  estimatedTime: string
  cards: Flashcard[]
}

export type FlashcardProgress = {
  cardId: string
  easeFactor: number
  intervalDays: number
  repetitions: number
  lastReviewedAt?: string
  nextReviewAt: string
  status: 'new' | 'learning' | 'review' | 'mastered'
  difficultyHistory: FlashcardDifficulty[]
  saved?: boolean
}

type FlashcardCsvRow = {
  subject: FlashcardSubject
  chapter: string
  topic: string
  deck_id: string
  deck_slug: string
  deck_title: string
  deck_description: string
  card_number: string
  card_id: string
  card_slug: string
  card_type: FlashcardType
  front: string
  back: string
  hint: string
  explanation: string
  tags: string
  estimated_time: string
}

export const flashcardDecks: FlashcardDeck[] = loadFlashcardDecksFromCsv()

export function getFlashcardDeck(subjectSlug: string, deckSlug: string) {
  return flashcardDecks.find(
    (deck) =>
      subjectToSlug(deck.subject) === subjectSlug && deck.slug === deckSlug,
  )
}

export function getFlashcardDecksBySubject(subjectSlug: string) {
  return flashcardDecks.filter(
    (deck) => subjectToSlug(deck.subject) === subjectSlug,
  )
}

export function getRelatedFlashcardDecks(deck: FlashcardDeck, limit = 3) {
  return flashcardDecks
    .filter((item) => item.id !== deck.id && item.subject === deck.subject)
    .slice(0, limit)
}

function loadFlashcardDecksFromCsv() {
  const csvPath = path.join(
    process.cwd(),
    'content',
    'flashcards',
    'cee-flashcards-chapter-wise.csv',
  )
  const csv = readFileSync(csvPath, 'utf8')
  const rows = (parseCsv(csv) as FlashcardCsvRow[]).filter(isFlashcardRow)
  const deckMap = new Map<string, FlashcardDeck>()

  for (const row of rows) {
    const deck =
      deckMap.get(row.deck_id) ??
      ({
        id: row.deck_id,
        slug: row.deck_slug,
        title: row.deck_title,
        subject: row.subject,
        chapter: row.chapter,
        topic: row.topic,
        description: row.deck_description,
        cardCount: 0,
        estimatedTime: row.estimated_time,
        cards: [],
      } satisfies FlashcardDeck)

    deck.cards.push({
      id: row.card_id,
      slug: row.card_slug,
      deckId: row.deck_id,
      subject: row.subject,
      chapter: row.chapter,
      topic: row.topic,
      type: row.card_type,
      front: row.front,
      back: row.back,
      hint: row.hint || undefined,
      explanation: row.explanation || undefined,
      tags: row.tags ? row.tags.split('|').filter(Boolean) : [],
    })
    deck.cardCount = deck.cards.length
    deckMap.set(row.deck_id, deck)
  }

  return Array.from(deckMap.values())
}

function isFlashcardRow(row: FlashcardCsvRow) {
  const headerValues = new Set([
    'subject',
    'chapter',
    'topic',
    'deck_id',
    'deck_slug',
    'deck_title',
    'deck_description',
    'card_number',
    'card_id',
    'card_slug',
    'card_type',
    'front',
    'back',
    'hint',
    'explanation',
    'tags',
    'estimated_time',
  ])

  if (!row.deck_id || !row.card_id || !row.front || !row.back) return false

  return !Object.values(row).some((value) =>
    headerValues.has(String(value).trim().toLowerCase()),
  )
}

function parseCsv(csv: string) {
  const records: string[][] = []
  let row: string[] = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < csv.length; index++) {
    const char = csv[index]
    const nextChar = csv[index + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(value)
      value = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(value)
      value = ''
      if (row.some((cell) => cell.length > 0)) records.push(row)
      row = []
    } else {
      value += char
    }
  }

  if (value || row.length > 0) {
    row.push(value)
    records.push(row)
  }

  const [headers, ...rows] = records
  return rows.map((cells) =>
    Object.fromEntries(
      headers.map((header, index) => [header, cells[index] ?? '']),
    ),
  )
}
