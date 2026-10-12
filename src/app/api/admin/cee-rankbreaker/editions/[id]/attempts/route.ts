import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await getServiceClient()
    .from('cee_rankbreaker_attempts')
    .select(
      'id, participant_name, whatsapp_normalized, status, created_at, started_at, submitted_at, net_marks, accuracy, completion_seconds, correct_count, incorrect_count, unanswered_count',
    )
    .eq('edition_id', params.id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attempts: data || [] })
}
