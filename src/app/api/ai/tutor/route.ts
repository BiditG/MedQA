import { NextRequest, NextResponse } from 'next/server'

const COHERE_API = 'https://api.cohere.com/v1/chat'

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

function toCohere(history: Msg[]) {
  const preambles: string[] = []
  const chat_history: Array<{ role: 'USER' | 'CHATBOT'; message: string }> = []
  for (const m of history) {
    if (m.role === 'system') preambles.push(m.content)
    else
      chat_history.push({
        role: m.role === 'user' ? 'USER' : 'CHATBOT',
        message: m.content,
      })
  }
  return { preamble: preambles.join('\n\n'), chat_history }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey)
    return NextResponse.json(
      { error: 'Missing COHERE_API_KEY' },
      { status: 500 },
    )

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

  const { preamble, chat_history } = toCohere(messages)
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

  const payload = {
    model: 'command-r',
    message: last.content,
    chat_history,
    preamble: [systemBits.join(' '), preamble].filter(Boolean).join('\n\n'),
    max_tokens: 600,
    temperature: 0.3,
  }

  const resp = await fetch(COHERE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const text = await resp.text()
    return NextResponse.json(
      { error: 'Cohere error', details: text },
      { status: 500 },
    )
  }
  const data = await resp.json()
  // Cohere returns { text } for chat completion
  const text = data?.text ?? data?.response ?? ''
  return NextResponse.json({ reply: text })
}
