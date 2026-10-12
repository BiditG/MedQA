import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'
import { parseRankbreakerCsv } from '@/lib/rankbreaker'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const csv = String((await req.json()).csv || '')
    const parsed = parseRankbreakerCsv(csv)
    if (parsed.errors.length)
      return NextResponse.json(
        { errors: parsed.errors, preview: parsed.rows.slice(0, 10) },
        { status: 422 },
      )
    if (!parsed.rows.length)
      return NextResponse.json(
        { error: 'The CSV has no questions.' },
        { status: 400 },
      )
    const supabase = getServiceClient()
    const { data: edition, error: editionError } = await supabase
      .from('cee_rankbreaker_editions')
      .select('status')
      .eq('id', params.id)
      .single()
    if (editionError || !edition)
      return NextResponse.json({ error: 'Edition not found.' }, { status: 404 })
    if (edition.status !== 'draft')
      return NextResponse.json(
        { error: 'Only draft editions can be imported.' },
        { status: 409 },
      )
    const records = parsed.rows.map((row, index) => ({
      edition_id: params.id,
      external_id: row.id,
      subject: row.subject,
      chapter: row.chapter,
      topic: row.topic,
      question: row.question,
      option_a: row.optionA,
      option_b: row.optionB,
      option_c: row.optionC,
      option_d: row.optionD,
      answer: row.answer,
      explanation: row.explanation,
      position: index + 1,
    }))
    const { error: importError } = await supabase.rpc(
      'cee_rankbreaker_replace_questions',
      { p_edition_id: params.id, p_questions: records },
    )
    if (importError) throw importError
    return NextResponse.json({
      ok: true,
      count: records.length,
      subjectCounts: records.reduce(
        (acc: Record<string, number>, row) => ({
          ...acc,
          [row.subject]: (acc[row.subject] || 0) + 1,
        }),
        {},
      ),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Import failed; the draft was not changed.' },
      { status: 400 },
    )
  }
}
