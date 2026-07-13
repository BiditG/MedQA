import { createExamCode } from '@/lib/examCodes'
import supabase from '@/lib/supabaseAdmin'

const AUTO_LABEL_PREFIX = 'Auto mock exam code'
const NPT_OFFSET_MINUTES = 5 * 60 + 45

export function getNepalDateParts(now = new Date()) {
  const nptMs = now.getTime() + NPT_OFFSET_MINUTES * 60 * 1000
  const nptDate = new Date(nptMs)
  const year = nptDate.getUTCFullYear()
  const month = nptDate.getUTCMonth() + 1
  const day = nptDate.getUTCDate()
  const dateKey = [
    year,
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-')

  return { year, month, day, dateKey }
}

export function nepalLocalTimeToUtcIso(
  dateParts: { year: number; month: number; day: number },
  hour: number,
  minute = 0,
) {
  const utcMs =
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, hour, minute) -
    NPT_OFFSET_MINUTES * 60 * 1000
  return new Date(utcMs).toISOString()
}

export function assertCronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return

  const authorization = req.headers.get('authorization') || ''
  const cronSecret = req.headers.get('x-cron-secret') || ''
  const valid =
    authorization === `Bearer ${secret}` ||
    cronSecret === secret ||
    req.headers.get('x-vercel-cron') === '1'

  if (!valid) throw new Error('Unauthorized cron request')
}

export async function publishDailyMockExamCode(now = new Date()) {
  const dateParts = getNepalDateParts(now)
  const label = `${AUTO_LABEL_PREFIX} - ${dateParts.dateKey} NPT`
  const announcementSlug = `daily-mock-exam-code-${dateParts.dateKey}`
  const expiresAt = nepalLocalTimeToUtcIso(dateParts, 23, 59)

  const existing = await findExamCodeByLabel(label)
  const code =
    existing ||
    (await createExamCode({
      label,
      expiresAt,
    }))

  if (existing && (!existing.active || existing.expires_at !== expiresAt)) {
    await supabase
      .from('exam_codes')
      .update({ active: true, expires_at: expiresAt })
      .eq('id', existing.id)
  }

  await upsertAnnouncement({
    slug: announcementSlug,
    title: `Today&apos;s mock exam code: ${code.code}`,
    body: [
      `Use code ${code.code} to enter today&apos;s MEDQAS mock exam.`,
      '',
      'This code is valid from 6:00 PM to 11:59 PM Nepal time today.',
      'After midnight, this code will be disabled automatically.',
    ].join('\n'),
    dateKey: dateParts.dateKey,
  })

  return {
    dateKey: dateParts.dateKey,
    code: code.code,
    expiresAt,
  }
}

export async function expireOldAutomatedMockExamCodes(now = new Date()) {
  const dateParts = getNepalDateParts(now)
  const currentLabel = `${AUTO_LABEL_PREFIX} - ${dateParts.dateKey} NPT`

  const { data, error } = await supabase
    .from('exam_codes')
    .update({ active: false })
    .like('label', `${AUTO_LABEL_PREFIX}%`)
    .neq('label', currentLabel)
    .select('id, code, label')

  if (error) throw error

  return {
    disabledCount: data?.length || 0,
    disabledCodes: data || [],
  }
}

async function findExamCodeByLabel(label: string) {
  const { data, error } = await supabase
    .from('exam_codes')
    .select('*')
    .eq('label', label)
    .maybeSingle()

  if (error) throw error
  return data
    ? {
        id: data.id as string,
        code: data.code as string,
        label: data.label as string,
        active: Boolean(data.active),
        expires_at: data.expires_at as string | null,
      }
    : null
}

async function upsertAnnouncement({
  slug,
  title,
  body,
  dateKey,
}: {
  slug: string
  title: string
  body: string
  dateKey: string
}) {
  const { data: category, error: categoryError } = await supabase
    .from('community_categories')
    .select('id')
    .eq('slug', 'medqas-announcements')
    .maybeSingle()

  if (categoryError) throw categoryError

  const payload = {
    title: decodeHtmlTitle(title),
    slug,
    body: decodeHtmlTitle(body),
    author_id: null,
    author_name: 'MEDQAS Team',
    category_id: category?.id || null,
    category_slug: 'medqas-announcements',
    subject: 'General',
    topic: `Mock Exam ${dateKey}`,
    tags: ['mock-exam', 'exam-code', dateKey],
    post_type: 'Announcement',
    status: 'open',
    is_pinned: true,
    is_featured: true,
    is_verified_by_medqas: true,
  }

  const { error } = await supabase
    .from('community_posts')
    .upsert(payload, { onConflict: 'slug' })

  if (error) throw error
}

function decodeHtmlTitle(value: string) {
  return value.replaceAll('&apos;', "'")
}
