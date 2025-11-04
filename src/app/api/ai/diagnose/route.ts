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
  const { messages, disease, attempts } = body as {
    messages: Msg[]
    disease?: string
    attempts?: number
  }
  if (!Array.isArray(messages) || messages.length === 0)
    return NextResponse.json({ error: 'messages[] required' }, { status: 400 })

  const revealAt = Math.max(3, Math.min(6, attempts ?? 3))

  // System prompt: patient simulator
  const baseSystem = [
    'You are simulating a patient in a medical OSCE-style interview.',
    'Stay in character: reply in first person as the patient describing symptoms.',
    'Only reveal information when asked; avoid giving the diagnosis directly early on.',
    'Provide realistic symptom details: onset, duration, severity, associated and relieving factors, relevant negatives.',
  ]
  if (disease)
    baseSystem.push(
      `Your underlying (hidden) diagnosis is: ${disease}. Reflect appropriate symptoms.`,
    )

  // If user has asked 3-4 meaningful questions, reveal diagnosis gently
  const askedCount = messages.filter((m) => m.role === 'user').length
  if (askedCount >= revealAt) {
    baseSystem.push(
      'The interviewer has asked enough questions. Now, gently reveal the likely diagnosis and a brief rationale.',
    )
  } else {
    baseSystem.push(
      'Do NOT reveal the exact diagnosis yet. Let them probe further.',
    )
  }

  const last = messages[messages.length - 1]
  const { preamble, chat_history } = toCohere([
    { role: 'system', content: baseSystem.join(' ') },
    ...messages,
  ])

  const payload = {
    model: 'command-r',
    message: last.content,
    chat_history,
    preamble,
    max_tokens: 400,
    temperature: 0.5,
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
  const text = data?.text ?? data?.response ?? ''
  return NextResponse.json({ reply: text, revealed: askedCount >= revealAt })
}
