export async function tryCohereWithModels(
  apiKey: string,
  payloadBase: any,
  useChat = true,
): Promise<{ ok: true; json: any } | { ok: false; error: string }> {
  const raw =
    process.env.COHERE_MODELS ||
    process.env.NEXT_PUBLIC_COHERE_MODELS ||
    'command'
  const models = String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const urls = {
    chat: 'https://api.cohere.com/v1/chat',
    gen: 'https://api.cohere.com/v1/generate',
  }

  let lastErr = ''
  for (const model of models) {
    try {
      const payload = { ...payloadBase, model }
      const url = useChat ? urls.chat : urls.gen
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (resp.ok) {
        const json = await resp.json().catch(() => null)
        return { ok: true, json }
      }

      const txt = await resp.text().catch(() => '')
      lastErr = `model=${model} status=${resp.status} body=${txt}`

      // If model removed or rate limited, try next model.
      // Cohere returns 409 for removed models in some cases and 429 for rate limits.
      if (
        resp.status === 409 ||
        resp.status === 429 ||
        /was removed/i.test(txt)
      ) {
        continue
      }

      // For other errors, stop and return error.
      return { ok: false, error: lastErr }
    } catch (e: any) {
      lastErr = String(e)
      // continue to next model on fetch/network errors
      continue
    }
  }

  return { ok: false, error: `All Cohere models failed; last=${lastErr}` }
}

export default tryCohereWithModels
