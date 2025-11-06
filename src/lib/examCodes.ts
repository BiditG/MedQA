import supabase from './supabaseAdmin'

export type ExamCode = {
  id: string
  code: string
  label?: string
  active: boolean
  createdAt: string
  expiresAt?: string
}

function generateHumanCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = (n: number) =>
    Array.from(
      { length: n },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join('')
  return `${pick(4)}-${pick(4)}`
}

function isExpired(expiresAt?: string | null) {
  return expiresAt ? Date.now() > Date.parse(expiresAt) : false
}

function mapRow(r: any): ExamCode {
  return {
    id: r.id,
    code: r.code,
    label: r.label ?? undefined,
    active: !!r.active,
    createdAt: r.created_at,
    expiresAt: r.expires_at ?? undefined,
  }
}

export async function listExamCodes(): Promise<ExamCode[]> {
  const { data, error } = await supabase
    .from('exam_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createExamCode(input: {
  label?: string
  expiresAt?: string
  code?: string
}) {
  let value = (input.code || generateHumanCode()).toUpperCase().trim()
  for (let i = 0; i < 5; i++) {
    const { data, error } = await supabase
      .from('exam_codes')
      .insert({
        code: value,
        label: input.label || null,
        active: true,
        expires_at: input.expiresAt
          ? new Date(input.expiresAt).toISOString()
          : null,
      })
      .select('*')
      .single()
    if (!error && data) return mapRow(data)
    if (error?.code === '23505') {
      value = generateHumanCode()
      continue
    }
    throw error
  }
  throw new Error('Could not create a unique code')
}

export async function updateExamCode(
  id: string,
  patch: Partial<Pick<ExamCode, 'label' | 'active' | 'expiresAt'>>,
) {
  const updates: any = {}
  if (patch.label !== undefined) updates.label = patch.label
  if (patch.active !== undefined) updates.active = !!patch.active
  if (patch.expiresAt !== undefined)
    updates.expires_at = patch.expiresAt
      ? new Date(patch.expiresAt).toISOString()
      : null

  const { data, error } = await supabase
    .from('exam_codes')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data ? mapRow(data) : null
}

export async function deleteExamCode(id: string) {
  const { error, count } = await supabase
    .from('exam_codes')
    .delete({ count: 'exact' })
    .eq('id', id)
  if (error) throw error
  return (count ?? 0) > 0
}

export async function verifyExamCode(inputCode: string) {
  const value = (inputCode || '').toUpperCase().trim()
  if (!value) return { ok: false as const, error: 'Missing code' as const }

  const { data, error } = await supabase
    .from('exam_codes')
    .select('id, code, active, expires_at, created_at, label')
    .eq('code', value)
    .maybeSingle()

  if (error) return { ok: false as const, error: 'Server error' as const }
  if (!data) return { ok: false as const, error: 'Invalid code' as const }
  if (!data.active)
    return { ok: false as const, error: 'Code is disabled' as const }
  if (isExpired(data.expires_at))
    return { ok: false as const, error: 'Code expired' as const }

  return { ok: true as const, code: mapRow(data) }
}
