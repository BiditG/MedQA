import { NextResponse } from 'next/server'

// Simple proxy for OpenFDA device endpoints.
// Supports query params:
//  - q: the raw OpenFDA search string (e.g. "product_code:ABC" or "device_name:\"pacemaker\"")
//  - type: one of classification|enforcement|510k|pma|registrationlisting (defaults to classification)
//  - limit: numeric limit (defaults to 10)

const VALID_TYPES = new Set([
  'classification',
  'enforcement',
  '510k',
  'pma',
  'registrationlisting',
])

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const typeRaw = (
      url.searchParams.get('type') || 'classification'
    ).toLowerCase()
    const limit = Number(url.searchParams.get('limit') || '10')

    const type = VALID_TYPES.has(typeRaw) ? typeRaw : 'classification'

    if (!q) {
      return NextResponse.json(
        { error: 'missing query parameter `q`' },
        { status: 400 },
      )
    }

    const base = 'https://api.fda.gov/device'
    const endpoint = `${base}/${type}.json`

    // build query string — we accept a raw q string to give callers flexibility
    const params = new URLSearchParams()
    params.set('search', q)
    params.set('limit', String(limit))

    // append API key if provided server-side
    const apiKey = process.env.OPENFDA_KEY
    if (apiKey) params.set('api_key', apiKey)

    const fetchUrl = `${endpoint}?${params.toString()}`

    const res = await fetch(fetchUrl)
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'OpenFDA error', status: res.status, body: text },
        { status: 502 },
      )
    }

    const data = await res.json()

    // Return the raw OpenFDA response; client will interpret fields by dataset.
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
