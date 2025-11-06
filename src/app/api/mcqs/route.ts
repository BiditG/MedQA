import { NextResponse } from 'next/server'
import { fetchNeetPgMcqs } from '@/utils/supabase-data'

async function getSubjectsFromSupabase() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const fs = await import('fs')
    const path = await import('path')

    // Read env vars
    const envPath = path.resolve(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const env: Record<string, string> = {}
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=')
      if (key && value)
        env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '')
    })

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data, error } = await supabase
      .from('mcqs')
      .select('subject')
      .not('subject', 'is', null)

    if (error) throw error

    const subjects = Array.from(
      new Set(data.map((item) => item.subject)),
    ).sort()
    return subjects
  } catch (e) {
    console.error('Error fetching subjects from Supabase:', e)
    return []
  }
}

async function getTopicsFromSupabase(subject?: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const fs = await import('fs')
    const path = await import('path')

    // Read env vars
    const envPath = path.resolve(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const env: Record<string, string> = {}
    envContent.split('\n').forEach((line) => {
      const [key, value] = line.split('=')
      if (key && value)
        env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '')
    })

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    let query = supabase.from('mcqs').select('topic').not('topic', 'is', null)

    if (subject) {
      query = query.eq('subject', subject)
    }

    const { data, error } = await query

    if (error) throw error

    const topics = Array.from(new Set(data.map((item) => item.topic))).sort()
    return topics
  } catch (e) {
    console.error('Error fetching topics from Supabase:', e)
    return []
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const op = url.searchParams.get('op') || ''
    const subject = url.searchParams.get('subject') || ''
    const topic = url.searchParams.get('topic') || ''
    const limit = Number(url.searchParams.get('limit') || '0')

    // Handle metadata operations from Supabase
    if (op === 'subjects') {
      const subjects = await getSubjectsFromSupabase()
      return NextResponse.json({ subjects })
    }

    if (op === 'topics') {
      const topics = await getTopicsFromSupabase(subject)
      return NextResponse.json({ topics })
    }

    // Fetch MCQs from Supabase
    const data = await fetchNeetPgMcqs({ subject, topic, limit })
    return NextResponse.json({ data })
  } catch (e) {
    console.error('MCQs API error:', e)
    return NextResponse.json({ data: [] }, { status: 500 })
  }
}
