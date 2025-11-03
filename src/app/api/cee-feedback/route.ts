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
  const { questions, answers, summary } = body as {
    questions: Array<{
      id: string
      subject?: string
      topic?: string
      question: string
      answer?: string
      explanation?: string
    }>
    answers: Record<string, string>
    summary: {
      total: number
      score: number
      bySubject: Record<
        string,
        { correct: number; wrong: number; total: number }
      >
    }
  }

  if (!questions || !answers || !summary) {
    return NextResponse.json(
      { error: 'Invalid request: questions, answers, and summary required' },
      { status: 400 },
    )
  }

  // Build the prompt for AI feedback
  const prompt = `You are an expert medical educator. A student just completed a CEE practice quiz. Provide constructive, personalized feedback.

**Quiz Summary:**
- Total Questions: ${summary.total}
- Score: ${summary.score}/${summary.total} (${Math.round(
    (summary.score / summary.total) * 100,
  )}%)

**Performance by Subject:**
${Object.entries(summary.bySubject)
  .map(
    ([subj, stats]) =>
      `- ${subj}: ${stats.correct}/${stats.total} correct (${Math.round(
        (stats.correct / stats.total) * 100,
      )}%)`,
  )
  .join('\n')}

**Incorrect Answers (for learning):**
${questions
  .filter((q) => {
    const userAnswer = answers[q.id]
    const correctAnswer = (q.answer || '').toString().trim()
    const isIdx = Number.isInteger(Number(correctAnswer))
    const correctOpt = isIdx
      ? ['A', 'B', 'C', 'D'][Number(correctAnswer) - 1]
      : correctAnswer
    return userAnswer && userAnswer !== correctOpt
  })
  .map((q) => {
    const userAnswer = answers[q.id]
    const correctAnswer = (q.answer || '').toString().trim()
    const isIdx = Number.isInteger(Number(correctAnswer))
    const correctOpt = isIdx
      ? ['A', 'B', 'C', 'D'][Number(correctAnswer) - 1]
      : correctAnswer
    return `
Q: ${q.question}
Your Answer: ${userAnswer}
Correct Answer: ${correctOpt}
${q.explanation ? `Explanation: ${q.explanation}` : ''}
Topic: ${q.topic || 'General'} | Subject: ${q.subject || 'Unspecified'}
`
  })
  .join('\n---\n')}

**Instructions:**
1. Congratulate the student on their score.
2. Identify 2-3 key strengths (subjects/topics they did well in).
3. Identify 2-3 areas for improvement (subjects/topics with most mistakes).
4. Provide 3-5 specific study tips based on their weak areas.
5. Encourage them with a motivational closing.

Keep the feedback concise (300-400 words), supportive, and actionable.`

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 800,
      topP: 0.95,
      topK: 40,
    },
  }

  // Try each API key in order until one succeeds
  let lastError = ''
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i]
    console.log(
      `[cee-feedback] Trying Gemini API key ${i + 1}/${apiKeys.length}`,
    )

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
      const feedback = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      if (!feedback) {
        lastError = `Key ${i + 1}: No feedback in response`
        console.warn(lastError)
        continue
      }

      console.log(`[cee-feedback] Success with API key ${i + 1}`)
      return NextResponse.json({ feedback })
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
