import { NextRequest, NextResponse } from 'next/server'

// Gemma 3 27B Instruct via Google AI Studio
const GOOGLE_AI_API =
  'https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent'

// Parse multiple API keys from env (comma-separated)
function getApiKeys(): string[] {
  const keys = process.env.GEMINI_API_KEY || ''
  return keys
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

export async function POST(req: NextRequest) {
  const apiKeys = getApiKeys()
  if (apiKeys.length === 0) {
    return NextResponse.json(
      { error: 'Missing GEMINI_API_KEY (comma-separated for multiple keys)' },
      { status: 500 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const { symptoms } = body as { symptoms?: string }

  if (!symptoms || !symptoms.trim()) {
    return NextResponse.json(
      { error: 'symptoms field required' },
      { status: 400 },
    )
  }

  const prompt = `You are a medical diagnostic assistant. A patient describes the following symptoms:

${symptoms}

Based on these symptoms, provide:
1. **Most Likely Diagnosis** (1-2 conditions)
2. **Differential Diagnoses** (2-3 other possibilities)
3. **Recommended Tests** (3-5 diagnostic tests to confirm)
4. **Immediate Actions** (what the patient should do now)
5. **Red Flags** (warning signs that require immediate medical attention)

Be concise, clear, and evidence-based. Format your response with clear headings. Limit to 400-500 words.

**Important:** This is for educational purposes only. Always advise seeking professional medical care.`

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 800,
      topP: 0.95,
      topK: 40,
    },
  }

  // Try each API key in order until one succeeds
  let lastError = ''
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i]
    console.log(`[diagnose] Trying Gemini API key ${i + 1}/${apiKeys.length}`)

    try {
      const resp = await fetch(`${GOOGLE_AI_API}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!resp.ok) {
        const text = await resp.text()
        lastError = `Key ${i + 1} failed: ${resp.status} ${text}`
        console.warn(lastError)

        // If rate limited (429), try next key immediately
        if (resp.status === 429) continue

        // For other errors, also try next key
        continue
      }

      const data = await resp.json()
      const diagnosis = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      if (!diagnosis) {
        lastError = `Key ${i + 1}: No diagnosis in response`
        console.warn(lastError)
        continue
      }

      console.log(`[diagnose] Success with API key ${i + 1}`)
      return NextResponse.json({ diagnosis })
    } catch (err: any) {
      lastError = `Key ${i + 1} exception: ${err.message}`
      console.error(lastError)
      continue
    }
  }

  // All keys failed
  return NextResponse.json(
    { error: 'All API keys exhausted', details: lastError },
    { status: 500 },
  )
}
