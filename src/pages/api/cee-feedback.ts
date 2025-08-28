import type { NextApiRequest, NextApiResponse } from 'next'

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

  const key = process.env.COHERE_API_KEY
  if (!key) return res.status(500).json({ error: 'Cohere key not configured' })

  const systemPrompt = `You are an exam coach. Provide a concise study plan and feedback based on the user's answers. Focus on topics to improve, common mistakes, and suggested study resources. Keep the response to 4 short bullet points.`
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
    '\nList the top 3 topics the user should focus on and a one-line study tip for each.',
  )

  const payload = {
    model: 'command-r',
    message: userPromptLines.join('\n'),
    preamble: systemPrompt,
    max_tokens: 300,
    temperature: 0.2,
  }

  try {
    const r = await fetch('https://api.cohere.com/v1/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!r.ok) {
      const txt = await r.text()
      return res.status(502).json({ error: `Cohere error: ${r.status} ${txt}` })
    }
    const data = await r.json()
    // Compatible with other chat endpoints in repo: text may be in data.text
    const output =
      data?.text ??
      data?.reply ??
      (data?.generations && data.generations[0]?.text) ??
      ''
    return res.status(200).json({ feedback: (output || '').trim() })
  } catch (e: any) {
    return res.status(500).json({ error: String(e) })
  }
}
