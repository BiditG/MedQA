import { NextRequest, NextResponse } from 'next/server'

// Gemma 3 27B Instruct via Google AI Studio
const GOOGLE_AI_API =
  'https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent'

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

function toGemma(history: Msg[]) {
  const contents: Array<{
    role: 'user' | 'model'
    parts: Array<{ text: string }>
  }> = []
  let systemPrompt = ''

  for (const m of history) {
    if (m.role === 'system') {
      systemPrompt += m.content + '\n\n'
    } else {
      contents.push({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })
    }
  }
  return { systemPrompt, contents }
}

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
  const { messages, style, subject, topic } = body as {
    messages: Msg[]
    style?: 'eli5' | 'exam' | 'clinical'
    subject?: string
    topic?: string
  }

  if (!Array.isArray(messages) || messages.length === 0)
    return NextResponse.json({ error: 'messages[] required' }, { status: 400 })

  const last = messages[messages.length - 1]
  if (last.role !== 'user')
    return NextResponse.json(
      { error: 'Last message must be from user' },
      { status: 400 },
    )

  const { systemPrompt, contents } = toGemma(messages)
  const systemBits: string[] = []
  systemBits.push(
    'You are MedPrep Tutor, a friendly medical explainer. Be concise, accurate, and supportive.',
  )
  if (style === 'eli5')
    systemBits.push(
      "Tone: Explain like I'm 12. Use simple analogies first, then deepen.",
    )
  if (style === 'exam')
    systemBits.push(
      'Tone: Exam-focused. Bullet key points. Include mnemonics when helpful.',
    )
  if (style === 'clinical')
    systemBits.push(
      'Tone: Clinical reasoning. Think aloud briefly, then answer clearly.',
    )
  if (subject) systemBits.push(`Subject context: ${subject}`)
  if (topic) systemBits.push(`Topic context: ${topic}`)

  const fullSystemPrompt = [systemBits.join(' '), systemPrompt]
    .filter(Boolean)
    .join('\n\n')

  // Prepend system prompt to first user message if exists
  if (fullSystemPrompt && contents.length > 0) {
    contents[0].parts[0].text =
      fullSystemPrompt + '\n\n' + contents[0].parts[0].text
  }

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 600,
      topP: 0.95,
      topK: 40,
    },
  }

  // Try each API key in order until one succeeds
  let lastError = ''
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i]
    console.log(`[tutor] Trying Gemini API key ${i + 1}/${apiKeys.length}`)

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
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      if (!text) {
        lastError = `Key ${i + 1}: No text in response`
        console.warn(lastError)
        continue
      }

      console.log(`[tutor] Success with API key ${i + 1}`)
      return NextResponse.json({ reply: text })
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
