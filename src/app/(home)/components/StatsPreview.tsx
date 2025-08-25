import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StatsPreview({
  subject,
  topic,
}: {
  subject?: string
  topic?: string
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['count', { subject, topic }],
    queryFn: async () => {
      const supabase = createBrowserClient()
      let q = supabase.from('mcqs').select('*', { count: 'exact', head: true })
      if (subject) q = q.eq('subject', subject)
      if (topic) q = q.eq('topic', topic)
      const { count, error } = await q
      if (error) throw error
      return count ?? 0
    },
    staleTime: 60_000,
  })

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Available questions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <div className="text-2xl font-semibold">~ {data ?? 0}</div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Based on your current filters
        </p>
      </CardContent>
    </Card>
  )
}
