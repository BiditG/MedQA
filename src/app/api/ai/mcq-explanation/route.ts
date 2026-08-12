import { NextRequest, NextResponse } from 'next/server'
import {
  AiChatMessage,
  callGeminiWithKey,
  callOllamaChat,
  getGeminiKeys,
  getOllamaConfig,
} from '@/utils/ai-providers'

type Msg = { role: 'user' | 'assistant'; content: string }

type McqContext = {
  question: string
  options: string[]
  answer?: string
  correctOption?: string
  explanation?: string | null
  exam?: string | null
  subject?: string | null
  topic?: string | null
  selectedOption?: string | null
}

function buildSystemPrompt(mcq: McqContext) {
  return [
    'You are MedQAS AI Explanation, a concise medical MCQ tutor.',
    'Explain the answer using exam reasoning, not just memorized facts.',
    'Be accurate, supportive, and compact. Use short headings and bullets when helpful.',
    'If the learner asks follow-up questions, stay focused on this exact MCQ unless they ask for broader context.',
    mcq.subject ? `Subject: ${mcq.subject}.` : '',
    mcq.topic ? `Topic: ${mcq.topic}.` : '',
    mcq.exam ? `Exam context: ${mcq.exam}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function buildQuestionPrompt(mcq: McqContext, mode: 'explain' | 'chat') {
  const optionRows = mcq.options
    .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
    .join('\n')

  const answerLine = mcq.correctOption || mcq.answer
  const selectedLine = mcq.selectedOption
    ? `Student selected: ${mcq.selectedOption}`
    : 'Student has not selected an answer yet.'

  const base = `MCQ:
${mcq.question}

Options:
${optionRows}

Correct answer: ${answerLine || 'Unknown'}
${selectedLine}
${mcq.explanation ? `Stored explanation: ${mcq.explanation}` : ''}`

  if (mode === 'chat') return base

  return `${base}

Give a clear solution:
1. Identify the correct option.
2. Explain why it is correct.
3. Briefly rule out the other options.
4. End with one high-yield exam takeaway.`
}

function toGeminiPrompt(messages: AiChatMessage[]) {
  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n\n')
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { mcq, messages, mode } = body as {
    mcq?: McqContext
    messages?: Msg[]
    mode?: 'explain' | 'chat'
  }

  if (!mcq?.question || !Array.isArray(mcq.options)) {
    return NextResponse.json(
      { error: 'mcq.question and mcq.options are required' },
      { status: 400 },
    )
  }

  const chatMessages: AiChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(mcq) },
    {
      role: 'user',
      content: buildQuestionPrompt(mcq, mode === 'chat' ? 'chat' : 'explain'),
    },
  ]

  for (const message of messages || []) {
    if (message.role === 'user' || message.role === 'assistant') {
      chatMessages.push(message)
    }
  }

  let lastDetails: string | undefined

  const ollamaConfig = getOllamaConfig()
  if (
    ollamaConfig.apiKey ||
    process.env.OLLAMA_HOST ||
    process.env.OLLAMA_BASE_URL
  ) {
    const ollama = await callOllamaChat(chatMessages, 0.25, 750)
    if (ollama.ok) {
      return NextResponse.json({
        reply: ollama.text,
        provider: 'ollama',
        model: ollama.usedModel,
      })
    }
    lastDetails = `Ollama failed: ${ollama.details}`
  }

  const geminiKeys = getGeminiKeys()
  for (const key of geminiKeys) {
    try {
      const result = await callGeminiWithKey(
        key,
        toGeminiPrompt(chatMessages),
        0.25,
        750,
      )
      if (result.ok) {
        return NextResponse.json({
          reply: result.text,
          provider: 'gemini',
          model:
            (result as any).usedModel ?? process.env.GEMINI_MODEL ?? 'unknown',
        })
      }
      lastDetails = result.details
    } catch (error: any) {
      lastDetails = String(error)
    }
  }

  return NextResponse.json(
    {
      error: 'All AI providers failed',
      details: lastDetails ?? 'no details',
    },
    { status: 502 },
  )
}
