import type { NextApiRequest, NextApiResponse } from 'next'
import { getGeminiKeys, callGeminiWithKey } from '@/utils/ai-providers'

type Req = {
  questions: Array<any>
  answers: Record<string, string>
  summary: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')
  const body = req.body as Req
  // Minimal validation
  if (!body || !Array.isArray(body.questions))
    return res.status(400).json({ error: 'Invalid payload' })

  const orKeys = []

  const systemPrompt = `You are an exam coach. Return concise, actionable feedback in short bullet points only. Do NOT produce long paragraphs. Format:
1) A one-line summary sentence (very short).
2) Then 3 brief bullet points (each one line) that: a) state the topic/area to improve, b) give a one-line focused study tip, and c) recommend 1-2 short resources or keywords (book titles, high-yield topics or concise URLs).\n\nRespond exactly in plain text with bullets (use '-', '*' or numbered list). Keep everything short and to the point.`
  const userPromptLines: string[] = []
  userPromptLines.push(
    `Score: ${body.summary?.score ?? 0} / ${body.summary?.total ?? 0}`,
  )
  userPromptLines.push('Per-subject performance:')
  for (const [k, v] of Object.entries(body.summary?.bySubject || {})) {
    userPromptLines.push(
      `${k}: correct ${(v as any).correct} wrong ${(v as any).wrong} total ${
        (v as any).total
      }`,
    )
  }
  userPromptLines.push(
    '\nList the top 3 topics the user should focus on and a one-line study tip for each, including 1-2 resource keywords or titles per topic.',
  )

  const payload = {
    model: 'command-light',
    message: userPromptLines.join('\n'),
    preamble: systemPrompt,
    max_tokens: 300,
    temperature: 0.2,
  }

  try {
    // Use Gemini-only rotation
    let lastDetails: string | undefined
    const gKeys = getGeminiKeys()
    if (gKeys.length) {
      const gemPrompt = [systemPrompt, userPromptLines.join('\n')]
        .filter(Boolean)
        .join('\n\n')
      for (const key of gKeys) {
        try {
          const r = await callGeminiWithKey(key, gemPrompt, 0.2, 300)
          if (r.ok)
            return res.status(200).json({ feedback: String(r.text).trim() })
          lastDetails = r.details
        } catch (e: any) {
          lastDetails = String(e)
        }
      }
    } else {
      return res.status(500).json({ error: 'No Gemini API key configured' })
    }

    // If no provider produced answers, return error with last details
    return res
      .status(500)
      .json({
        error: 'All Gemini requests failed',
        details: lastDetails ?? 'no details',
      })
  } catch (e: any) {
    return res.status(500).json({ error: String(e) })
  }
}
