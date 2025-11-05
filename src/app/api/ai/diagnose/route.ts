import { NextRequest, NextResponse } from 'next/server'
import { getGeminiKeys, callGeminiWithKey } from '@/utils/ai-providers'

type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

function toPreamble(history: Msg[]) {
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
  const body = await req.json().catch(() => ({}))
  const { messages, disease, attempts, reveal } = body as {
    messages: Msg[]
    disease?: string
    attempts?: number
    reveal?: boolean
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
  if (reveal) {
    // Explicit reveal requested by client/button: override and ask to reveal now.
    // In this mode the model must ONLY state the diagnosis with no justification.
    baseSystem.push(
      'The interviewer requested a reveal. ONLY reply with a single short sentence in the exact format:\n"My diagnosis is <DIAGNOSIS>." Do NOT provide any explanation, justification, or additional commentary.',
    )
  } else if (askedCount >= revealAt) {
    // Regular reveal after sufficient questions: also return only the diagnosis sentence.
    baseSystem.push(
      'The interviewer has asked enough questions. ONLY reply with a single short sentence in the exact format:\n"My diagnosis is <DIAGNOSIS>." Do NOT provide any explanation, justification, or additional commentary.',
    )
  } else {
    baseSystem.push(
      'Do NOT reveal the exact diagnosis yet. Let them probe further.',
    )
  }

  const last = messages[messages.length - 1]
  const { preamble, chat_history } = toPreamble([
    { role: 'system', content: baseSystem.join(' ') },
    ...messages,
  ])

  const payload = {
    message: last.content,
    chat_history,
    preamble,
    max_tokens: 400,
    temperature: 0.5,
  }

  const gKeys = getGeminiKeys()
  if (!gKeys.length)
    return NextResponse.json(
      { error: 'No Gemini API key configured' },
      { status: 500 },
    )

  const prompt = [payload.preamble, payload.message]
    .filter(Boolean)
    .join('\n\n')
  let lastDetails: string | undefined
  for (const key of gKeys) {
    try {
      const r = await callGeminiWithKey(
        key,
        prompt,
        payload.temperature ?? 0.5,
        payload.max_tokens ?? 400,
      )
      if (r.ok)
        return NextResponse.json({
          reply: r.text,
          revealed: Boolean(reveal) || askedCount >= revealAt,
        })
      lastDetails = r.details
    } catch (e: any) {
      lastDetails = String(e)
    }
  }

  return NextResponse.json(
    { error: 'All AI providers failed', details: lastDetails ?? 'no details' },
    { status: 502 },
  )
}
