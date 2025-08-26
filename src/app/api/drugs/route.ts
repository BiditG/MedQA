import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()
  if (!q)
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 })

  const limitParam = parseInt(url.searchParams.get('limit') || '1', 10) || 1
  const encoded = encodeURIComponent(
    `openfda.brand_name:"${q}" OR openfda.generic_name:"${q}"`,
  )
  let openfdaUrl = `https://api.fda.gov/drug/label.json?search=${encoded}&limit=${limitParam}`
  // Use server-side API key if provided in env; do NOT commit keys to the repo
  const key = process.env.OPENFDA_KEY
  if (key) {
    openfdaUrl += `&api_key=${encodeURIComponent(key)}`
  }

  try {
    const upstream = await fetch(openfdaUrl)
    const text = await upstream.text()
    if (!upstream.ok) {
      // Try to parse JSON error body; otherwise return text
      try {
        const j = JSON.parse(text)
        return NextResponse.json(j, { status: upstream.status })
      } catch {
        return NextResponse.json(
          { error: text || `OpenFDA status ${upstream.status}` },
          { status: upstream.status },
        )
      }
    }

    const json = JSON.parse(text)
    // Cache responses on the CDN for a short period to reduce OpenFDA hits
    return NextResponse.json(json, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=59' },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}
