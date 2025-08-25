import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <Link href="/quiz" className="underline-offset-2 hover:underline">
          Continue last session
        </Link>
        <Link
          href="/quiz?mode=exam"
          className="underline-offset-2 hover:underline"
        >
          Take a timed exam
        </Link>
        <Link href="/quiz" className="underline-offset-2 hover:underline">
          Review mistakes
        </Link>
      </CardContent>
    </Card>
  )
}
