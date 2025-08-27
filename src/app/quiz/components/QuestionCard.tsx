import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OptionCard } from './OptionCard'

export type AnswerInfo =
  | { type: 'index'; index: number }
  | { type: 'text'; text: string }

export function QuestionCard({
  exam,
  subject,
  topic,
  year,
  q,
  options,
  answerInfo,
  selected,
  onSelect,
}: {
  exam?: string | null
  subject?: string | null
  topic?: string | null
  year?: number | null
  q: string
  options: string[]
  answerInfo: AnswerInfo
  selected: string | null
  onSelect: (opt: string, idx: number) => void
}) {
  return (
    <Card className="w-full max-w-full overflow-hidden shadow-md">
      <CardContent className="pt-6">
        {/* Badges */}
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          {subject && (
            <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300">
              {subject}
            </Badge>
          )}
          {topic && (
            <Badge className="border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
              {topic}
            </Badge>
          )}
          {/* year removed to avoid showing source year on every card */}
        </div>

        {/* Question */}
        <h2 className="mb-4 whitespace-pre-wrap break-words text-base font-medium leading-relaxed sm:text-lg">
          {q}
        </h2>

        {/* Options */}
        <div
          className="flex flex-col gap-3"
          role="radiogroup"
          aria-label="Options"
        >
          {options.map((opt, idx) => {
            const isCorrect =
              answerInfo.type === 'index'
                ? idx === answerInfo.index
                : opt === answerInfo.text
            const isSelected = selected === opt
            const showOutcome = selected !== null

            const state = showOutcome
              ? isSelected && isCorrect
                ? 'correct'
                : isSelected && !isCorrect
                  ? 'wrong'
                  : isCorrect
                    ? 'correct'
                    : 'default'
              : isSelected
                ? 'selected'
                : 'default'

            return (
              <OptionCard
                key={idx}
                index={idx}
                selected={isSelected}
                state={state}
                onClick={() => onSelect(opt, idx)}
                disabled={showOutcome}
              >
                <span className="whitespace-pre-wrap break-words">{opt}</span>
              </OptionCard>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
