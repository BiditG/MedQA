;(async () => {
  try {
    const fs = require('fs')
    function readEnvLocalVar(key) {
      try {
        const env = fs.readFileSync('.env.local', 'utf8')
        const re = new RegExp('^' + key + '\\s*=\\s*(.+)$', 'm')
        const m = env.match(re)
        if (m) return m[1].trim().replace(/^['"]|['"]$/g, '')
      } catch {}
      return undefined
    }
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      readEnvLocalVar('NEXT_PUBLIC_SUPABASE_URL')
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      readEnvLocalVar('SUPABASE_SERVICE_ROLE_KEY') ||
      readEnvLocalVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (!url || !key) {
      console.error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      )
      process.exit(2)
    }
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const table =
      process.env.SUPABASE_MCQS_TABLE ||
      readEnvLocalVar('SUPABASE_MCQS_TABLE') ||
      'mcqs'
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) throw error
    console.log('Supabase MCQ sample:', data && data[0] ? data[0] : null)
    process.exit(0)
  } catch (err) {
    console.error(
      'Supabase test error:',
      err && err.message ? err.message : err,
    )
    process.exit(1)
  }
})()
