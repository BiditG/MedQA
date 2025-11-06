import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { count, error } = await supabase
      .from('mcqs')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({ count: count || 0 })
  } catch (e) {
    console.error('Error fetching count from Supabase:', e)
    // Fallback to CSV count if Supabase fails
    try {
      const fs = await import('fs')
      const path = await import('path')
      const csvPath = path.resolve(
        process.cwd(),
        'public',
        'data',
        'ceemcq.csv',
      )
      if (!fs.existsSync(csvPath)) return NextResponse.json({ count: 0 })
      const content = await fs.promises.readFile(csvPath, 'utf8')
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
      let count = lines.length
      if (lines.length > 0 && lines[0].includes(','))
        count = Math.max(0, count - 1)
      return NextResponse.json({ count })
    } catch (fallbackError) {
      return NextResponse.json({ count: 0 })
    }
  }
}
