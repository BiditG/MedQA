export function splitKeys(raw?: string) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function getGeminiKeys(): string[] {
  const raw =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
    ''
  const keys = String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  // Simple in-memory round-robin rotation per process.
  // Each call to getGeminiKeys() will rotate the start index by one so
  // requests are balanced across multiple API keys (good when you have many keys).
  // NOTE: This is process-local. For multiple server instances you may want a shared counter.
  if (keys.length <= 1) return keys
  try {
    // store counter on module scope
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).__medqa_gemini_rr = (global as any).__medqa_gemini_rr ?? 0
    // compute rotation
    const start = ((global as any).__medqa_gemini_rr as number) % keys.length
    ;(global as any).__medqa_gemini_rr =
      (((global as any).__medqa_gemini_rr as number) + 1) % keys.length
    return keys.slice(start).concat(keys.slice(0, start))
  } catch (e) {
    // fallback: return keys unchanged
    return keys
  }
}

export async function callGeminiWithKey(
  key: string,
  prompt: string,
  temperature = 0.3,
  maxTokens = 600,
  model = process.env.GEMINI_MODEL || 'gemma-3-27b-instruct',
) {
  // Try modern Gemini endpoint
  // Normalize model: if user included a "models/" prefix, strip it to avoid double-prefixing
  const modelId = String(model || '').startsWith('models/')
    ? String(model).replace(/^models\//, '')
    : String(model)
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      modelId,
    )}:generateContent?key=${key}`
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: temperature ?? 0.3,
        maxOutputTokens: maxTokens ?? 600,
      },
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!resp.ok) {
      const body = await resp.text().catch(() => '')
      let details = `status=${resp.status} body=${body}`

      // If it's a model-not-found / 404, attempt to ListModels so the caller can see what's available
      try {
        if (resp.status === 404 || /not found/i.test(body)) {
          const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
            key,
          )}`
          const listResp = await fetch(listUrl)
          if (listResp.ok) {
            const listData: any = await listResp.json().catch(() => null)
            const names = (listData?.models ?? []).map(
              (m: any) => m?.name || m?.model || JSON.stringify(m),
            )
            details += `; available_models=${names.slice(0, 50).join(',')}`

            // Attempt automatic fallback: try some reasonable alternative model names
            try {
              const normalized = names.map((n: string) =>
                String(n).replace(/^models\//, ''),
              )
              const candidates: string[] = []
              // prefer a direct swap of 'instruct' -> 'it'
              if (/instruct/i.test(modelId)) {
                candidates.push(modelId.replace(/instruct/i, 'it'))
              }
              // common Gemini fallbacks
              candidates.push(
                'gemini-pro-latest',
                'gemini-2.5-pro',
                'gemma-3-27b-it',
              )

              for (const cand of candidates) {
                if (normalized.includes(cand)) {
                  // try a retry call with this candidate
                  try {
                    const retryUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
                      cand,
                    )}:generateContent?key=${key}`
                    const retryResp = await fetch(retryUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    })
                    if (retryResp.ok) {
                      const retryData: any = await retryResp
                        .json()
                        .catch(() => null)
                      const retryText =
                        retryData?.candidates?.[0]?.content?.parts?.[0]?.text ??
                        retryData?.candidates?.[0]?.content ??
                        retryData?.output?.[0]?.content ??
                        retryData?.text ??
                        ''
                      return {
                        ok: true as const,
                        text: String(retryText || ''),
                        usedModel: cand,
                      }
                    } else {
                      const rb = await retryResp.text().catch(() => '')
                      details += `; retry_${cand}_status=${retryResp.status} body=${rb}`
                    }
                  } catch (e: any) {
                    details += `; retry_${cand}_error=${String(e)}`
                  }
                }
              }
            } catch (e: any) {
              details += `; fallback_error=${String(e)}`
            }
          } else {
            const listBody = await listResp.text().catch(() => '')
            details += `; list_models_status=${listResp.status} body=${listBody}`
          }
        }
      } catch (e: any) {
        details += `; list_models_error=${String(e)}`
      }

      return { ok: false as const, details }
    }
    const data: any = await resp.json().catch(() => null)
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content ??
      data?.output?.[0]?.content ??
      data?.text ??
      ''
    // include raw data and echo used model when present
    return {
      ok: true as const,
      text: String(text || ''),
      raw: data,
      usedModel: modelId,
    }
  } catch (e: any) {
    return { ok: false as const, details: String(e) }
  }
}
