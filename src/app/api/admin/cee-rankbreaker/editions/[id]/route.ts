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
  const supabase = getServiceClient()
  const [{ data: edition, error }, { data: questions, error: questionError }] =
    await Promise.all([
      supabase
        .from('cee_rankbreaker_editions')
        .select('*')
        .eq('id', params.id)
        .single(),
      supabase
        .from('cee_rankbreaker_questions')
        .select(
          'id, external_id, position, subject, chapter, topic, question, option_a, option_b, option_c, option_d, answer, explanation',
        )
        .eq('edition_id', params.id)
        .order('position'),
    ])
  if (error || questionError)
    return NextResponse.json(
      { error: (error || questionError)?.message },
      { status: 404 },
    )
  return NextResponse.json({ edition, questions: questions || [] })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await req.json()
    const supabase = getServiceClient()
    const { data: edition, error: findError } = await supabase
      .from('cee_rankbreaker_editions')
      .select('status')
      .eq('id', params.id)
      .single()
    if (findError || !edition)
      return NextResponse.json({ error: 'Edition not found.' }, { status: 404 })
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (body.name !== undefined) {
      if (edition.status !== 'draft')
        return NextResponse.json(
          { error: 'Only draft editions can be renamed.' },
          { status: 409 },
        )
      const name = String(body.name || '')
        .trim()
        .slice(0, 80)
      if (!name)
        return NextResponse.json(
          { error: 'Edition name is required.' },
          { status: 400 },
        )
      patch.name = name
    }
    if (typeof body.reviewReleased === 'boolean')
      patch.review_released = body.reviewReleased
    if (body.status) {
      if (!['draft', 'published', 'closed'].includes(body.status))
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
      if (body.status === 'published') {
        const { count, error: countError } = await supabase
          .from('cee_rankbreaker_questions')
          .select('*', { count: 'exact', head: true })
          .eq('edition_id', params.id)
        if (countError) throw countError
        if (count !== 200)
          return NextResponse.json(
            {
              error:
                'An edition must contain exactly 200 valid questions before publication.',
            },
            { status: 409 },
          )
      }
      patch.status = body.status
    }
    const { data, error } = await supabase
      .from('cee_rankbreaker_editions')
      .update(patch)
      .eq('id', params.id)
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ edition: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not update edition.' },
      { status: 400 },
    )
  }
}
