// Server-only Supabase client for data access (no auth). Do not import in client components.
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getDataClient() {
  if (!URL || !SERVICE_KEY) {
    throw new Error(
      'Supabase not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON for public tables)',
    )
  }
  const supabase = createClient(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch },
  })
  return supabase
}

export type McqRow = {
  id: string
  exam?: string | null
  subject?: string | null
  topic?: string | null
  q: string
  options: Record<string, string> // JSONB: { A: '...', B: '...', C: '...', D: '...' }
  answer: string
  explanation?: string | null
  year?: number | null
  created_at?: string | null
}

export async function fetchNeetPgMcqs({
  subject,
  topic,
  limit,
  table = process.env.SUPABASE_MCQS_TABLE || 'mcqs',
}: {
  subject?: string
  topic?: string
  limit?: number
  table?: string
}) {
  const client = getDataClient()
  let q = client
    .from(table)
    .select('*')
    .order('created_at', { ascending: true })
  if (subject) q = q.eq('subject', subject)
  if (topic) q = q.eq('topic', topic)
  if (limit && limit > 0) q = q.limit(limit)
  const { data, error } = await q
  if (error) throw error
  const out = (data as McqRow[]).map((r) => {
    // Normalize options: accept either stored JSON object, array, or stringified JSON
    let opts: string[] = ['', '', '', '']
    try {
      if (r.options == null) {
        opts = ['', '', '', '']
      } else if (typeof r.options === 'string') {
        // Try parse JSON string -> object or array
        try {
          const parsed = JSON.parse(r.options)
          if (Array.isArray(parsed)) {
            opts = parsed.map((v) => (v == null ? '' : String(v))).slice(0, 4)
          } else if (typeof parsed === 'object' && parsed !== null) {
            opts = ['A', 'B', 'C', 'D'].map((k) =>
              parsed[k] ? String(parsed[k]) : '',
            )
          } else {
            // plain string -> use as single option
            opts = [String(parsed), '', '', '']
          }
        } catch {
          // Not JSON: treat as single-string option
          opts = [String(r.options), '', '', '']
        }
      } else if (Array.isArray(r.options)) {
        opts = (r.options as any[])
          .map((v) => (v == null ? '' : String(v)))
          .slice(0, 4)
      } else if (typeof r.options === 'object') {
        // Prefer keys A,B,C,D in order; also support numeric keys 0..3
        opts = ['A', 'B', 'C', 'D'].map((k, i) => {
          if ((r.options as any)[k]) return String((r.options as any)[k])
          if ((r.options as any)[i]) return String((r.options as any)[i])
          return ''
        })
      }
    } catch (e) {
      opts = ['', '', '', '']
    }
    return {
      id: String(r.id),
      exam: r.exam ?? null,
      subject: r.subject ?? null,
      topic: r.topic ?? null,
      q: r.q ?? '',
      options: opts,
      answer: r.answer ?? '',
      explanation: r.explanation ?? null,
      year: r.year ?? null,
    }
  })
  return out
}
