import { NextResponse } from 'next/server'
import { getGeminiKeys, callGeminiWithKey } from '@/utils/ai-providers'

type ReqBody = {
  questions: Array<{
    id: string
    question: string
    options: string[]
    correct?: string | number
  }>
  selections: Array<number | undefined>
  subject?: string
  topic?: string
}

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json()
    const { questions, selections, subject, topic } = body

    // build a compact prompt for feedback
    const rows = questions
      .slice(0, 12)
      .map((q, i) => {
        const sel = selections[i]
        const selText =
          sel == null ? 'SKIPPED' : q.options?.[sel] ?? String(sel)
        const correctText =
          typeof q.correct === 'number'
            ? q.options?.[q.correct] ?? String(q.correct)
            : q.correct ?? 'Unknown'
        return `${i + 1}. Q: ${
          q.question
        }\n   Your answer: ${selText}\n   Correct: ${correctText}`
      })
      .join('\n\n')

    const prompt = `You are an expert medical exam tutor. Provide a concise feedback summary for a student who just completed a CEE practice session. The subject is: ${
      subject ?? 'General'
    }. Topic: ${
      topic ?? 'Mixed'
    }.\n\nHere are a subset of attempted questions:\n\n${rows}\n\nPlease: 1) Give an overall score interpretation in one sentence. 2) List 3 focused study tips based on observed mistakes. 3) Provide 3 references or keywords the student should review. Keep the response short and actionable.`

    const gKeys = getGeminiKeys()
    let lastDetails: string | undefined
    if (gKeys.length) {
      const geminiPrompt = prompt
      for (const key of gKeys) {
        try {
          const r = await callGeminiWithKey(key, geminiPrompt, 0.6, 250)
          if (r.ok) return NextResponse.json({ text: r.text })
          lastDetails = r.details
        } catch (e: any) {
          lastDetails = String(e)
        }
      }
    } else {
      lastDetails = 'No Gemini API key configured'
    }

    // If OpenRouter + Gemini attempts all failed, include last details to help debug
    const mock = `No AI key available. Example feedback:\nOverall: Good attempt — focus on topics you missed.\nTips: 1) Review anatomy basics; 2) Practice problem-solving for applied questions; 3) Time management.\nReferences: \"Gray's Anatomy\", \"Robbins Pathology\", \"First Aid\"`
    return NextResponse.json({ text: mock, debug: lastDetails ?? 'no details' })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
