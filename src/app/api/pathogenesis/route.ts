import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

type CohereResponse = {
  text: string
}

function parseCsv(content: string) {
  const lines: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      cur += ch
    } else if (ch === '\n' && !inQuotes) {
      lines.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur) lines.push(cur)

  const rows = lines.map((line) => {
    const cols: string[] = []
    let cell = ''
    let q = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        q = !q
      } else if (ch === ',' && !q) {
        cols.push(cell)
        cell = ''
      } else {
        cell += ch
      }
    }
    cols.push(cell)
    return cols.map((c) => c.trim().replace(/^"|"$/g, ''))
  })

  return rows
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 },
    )
  }

  try {
    // Normalize query: remove common prefixes like "pathogenesis of"
    let topic = query.trim()
    topic = topic.replace(/^pathogenesis\s+of\s+/i, '')
    topic = topic.replace(/^the\s+/i, '').trim()

    // Try direct page summary first
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    let response = await fetch(summaryUrl)

    // If direct summary not found, use the search API to find a closest page
    if (!response.ok) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`
      const sres = await fetch(searchUrl)
      if (!sres.ok) throw new Error('Wikipedia search failed')
      const sjson = await sres.json()
      const hits = sjson?.query?.search || []
      if (hits.length === 0) {
        return NextResponse.json(
          { error: 'No Wikipedia page found for that topic' },
          { status: 404 },
        )
      }
      const best = hits[0].title
      response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(best)}`,
      )
    }

    if (!response.ok) {
      console.error('Final Wikipedia fetch failed', response.status)
      // fallthrough to return a gentle fallback below
    }

    const data = await response.json().catch(() => null)
    const extract = (data && data.extract) || null

    // First: check our local CSV database for a matching disease
    try {
      const csvPath = path.join(
        process.cwd(),
        'public',
        'data',
        'pathogenesis.csv',
      )
      if (fs.existsSync(csvPath)) {
        const raw = fs.readFileSync(csvPath, 'utf8')
        const rows = parseCsv(raw)
        // Header row expected: Disease,Language,Pathogenesis,References,Source,LastUpdated
        const header = rows[0].map((h: string) => h.toLowerCase())
        const diseaseIdx = header.indexOf('disease')
        const pathIdx = header.indexOf('pathogenesis')
        const sourceIdx = header.indexOf('source')
        if (diseaseIdx >= 0 && pathIdx >= 0) {
          for (let i = 1; i < rows.length; i++) {
            const cols = rows[i]
            const name = (cols[diseaseIdx] || '').toLowerCase()
            if (name === topic.toLowerCase()) {
              const rawPath = cols[pathIdx] || ''
              // split on arrow-like separators to steps
              const steps = rawPath
                .split(/→|->|\u2192|\u2013|\|/)
                .map((s) => s.replace(/^\d+\.?\s*/, '').trim())
                .filter(Boolean)
              // build mermaid: chain steps S0 --> S1 --> S2 ...
              let mermaid = `graph TD\n`
              steps.forEach((s: string, idx: number) => {
                const nodeId = `S${idx}`
                mermaid += `${nodeId}[${s.replace(/\]/g, '')}]`
                if (idx < steps.length - 1) mermaid += ` --> S${idx + 1}`
                mermaid += `\n`
              })
              const source = cols[sourceIdx] || ''
              return NextResponse.json({
                title: topic,
                steps,
                mermaid,
                source,
                csv: true,
              })
            }
          }
        }
      }
    } catch (e) {
      console.error('CSV lookup failed', e)
    }

    // If a Cohere API key is available, try LLM synthesis for a better structured output
    const COHERE_API_KEY =
      process.env.COHERE_API_KEY || process.env.NEXT_PUBLIC_COHERE_API_KEY
    if (COHERE_API_KEY) {
      try {
        // Fetch page content sections to provide context (mobile-sections endpoint)
        const sectionsUrl = `https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(topic)}`
        const sres = await fetch(sectionsUrl)
        const sjson = await sres.json().catch(() => null)
        const pageText = [] as string[]
        if (sjson && Array.isArray(sjson.lead?.sections || [])) {
          sjson.lead.sections.forEach((sec: any) =>
            pageText.push(sec.text || ''),
          )
        }
        if (sjson && Array.isArray(sjson.remaining?.sections || [])) {
          sjson.remaining.sections.forEach((sec: any) =>
            pageText.push(sec.text || ''),
          )
        }

        const context =
          pageText.join('\n\n').slice(0, 20000) || extract || topic

        // Tailored prompt: strict JSON output with steps and mermaid graph only
        const prompt = `You are a medical educator. From the article text below, extract a clear pathogenesis flow for the topic '${topic}'. Return STRICT JSON only with keys: steps (an array of 4-8 short labels), mermaid (a single string with a 'graph TD' flow connecting the steps). Do not include any additional commentary. Article text:\n${context}`

        const cohereRes = await fetch('https://api.cohere.com/v1/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${COHERE_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'command-xlarge-nightly',
            prompt,
            max_tokens: 600,
            temperature: 0.1,
          }),
        })

        if (cohereRes.ok) {
          const jr: any = await cohereRes.json()
          const text = (jr?.generations?.[0]?.text || jr?.text || '') as string
          // Attempt to parse JSON from model output
          let parsed: any = null
          try {
            parsed = JSON.parse(text)
          } catch (e) {
            // try to find a JSON block
            try {
              const start = text.indexOf('{')
              const end = text.lastIndexOf('}')
              if (start >= 0 && end > start) {
                parsed = JSON.parse(text.slice(start, end + 1))
              }
            } catch (e) {}
          }

          if (parsed && parsed.mermaid && parsed.steps) {
            return NextResponse.json({
              title: topic,
              steps: parsed.steps,
              mermaid: parsed.mermaid,
              notes: parsed.notes || '',
              source: data?.title || topic,
              llm: true,
            })
          }

          return NextResponse.json({
            extract: extract || topic,
            llm_text: text,
            source: data?.title || topic,
          })
        }
      } catch (e) {
        console.error('Cohere call failed', e)
      }
    }

    if (extract) {
      return NextResponse.json({ extract, title: data.title })
    }

    // If we couldn't obtain a useful extract, return a safe fallback so the UI can still
    // render a basic pathogenesis flowchart for learning purposes.
    const fallback = `${topic} — basic pathogenesis flow: initiating event leads to host response, pathological changes, clinical manifestations, diagnosis, and treatment.`
    return NextResponse.json({
      extract: fallback,
      title: topic,
      warning:
        'Used fallback extract; external fetch failed or returned no extract',
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    // Return fallback if external resources are unavailable
    const topic =
      (query || '').replace(/^pathogenesis\s+of\s+/i, '').trim() || 'Topic'
    const fallback = `${topic} — basic pathogenesis flow: initiating event leads to host response, pathological changes, clinical manifestations, diagnosis, and treatment.`
    return NextResponse.json({
      extract: fallback,
      title: topic,
      warning: String(error),
    })
  }
}
