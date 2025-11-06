const fs = require('fs')

async function main() {
  let url = process.env.TURSO_DB_URL
  if (!url) {
    try {
      const env = fs.readFileSync('.env.local', 'utf8')
      const m = env.match(/^TURSO_DB_URL=(.+)$/m)
      if (m) url = m[1].trim()
    } catch (e) {
      // ignore
    }
  }

  if (!url) {
    console.error('TURSO_DB_URL not set')
    process.exit(2)
  }

  console.log(
    'Using TURSO_DB_URL:',
    url.replace(/(libsql:\/\/).+@/, '$1<redacted>@'),
  )

  try {
    // lazy require
    const { createClient } = require('@libsql/client')
    const client = createClient({ url })
    const res = await client.execute('SELECT 1 as ok')
    console.log('Query result:', res && res.rows ? res.rows : res)
    process.exit(0)
  } catch (err) {
    console.error('Turso test error:')
    console.error(err && err.stack ? err.stack : err)
    process.exit(1)
  }
}

main()
