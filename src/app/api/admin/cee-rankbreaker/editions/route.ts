import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function GET(req: Request) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('cee_rankbreaker_editions')
      .select(
        'id, name, status, review_released, created_at, cee_rankbreaker_questions(count), cee_rankbreaker_attempts(count)',
      )
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ editions: data || [] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not load editions.' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const admin = await requireAdminFromRequest(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const name = String((await req.json()).name || '')
      .trim()
      .slice(0, 80)
    if (!name)
      return NextResponse.json(
        { error: 'Edition name is required.' },
        { status: 400 },
      )
    const { data, error } = await getServiceClient()
      .from('cee_rankbreaker_editions')
      .insert({ name, created_by: admin.authUser.id })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ edition: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not create edition.' },
      { status: 400 },
    )
  }
}
