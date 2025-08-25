import { Card, CardContent } from '@/components/ui/card'

export function ExplanationPanel({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <Card className="mt-4 bg-muted/30">
      <CardContent className="pt-6 text-sm">
        <p className="mb-1 font-medium">Why this works</p>
        <p className="whitespace-pre-wrap text-muted-foreground">
          {text || 'No explanation provided.'}
        </p>
      </CardContent>
    </Card>
  )
}
