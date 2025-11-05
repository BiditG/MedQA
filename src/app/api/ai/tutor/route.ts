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

  const { preamble, chat_history } = toPreamble(messages)
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
    message: last.content,
    chat_history,
    preamble: [systemBits.join(' '), preamble].filter(Boolean).join('\n\n'),
    max_tokens: 600,
    temperature: 0.3,
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
  const debugMode = new URL(req.url).searchParams.get('debug') === '1'

  for (const key of gKeys) {
    try {
      const r = await callGeminiWithKey(
        key,
        prompt,
        payload.temperature ?? 0.3,
        payload.max_tokens ?? 600,
      )
      if (r.ok) {
        const used =
          (r as any).usedModel ?? process.env.GEMINI_MODEL ?? 'unknown'
        const base = { reply: r.text, provider: 'gemini', model: used }
        if (debugMode)
          return NextResponse.json({
            ...base,
            debug: { raw: (r as any).raw ?? null },
          })
        return NextResponse.json(base)
      }
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
