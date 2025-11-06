// Minimal auth shim to replace Supabase browser client for JWT-backed auth.
// This provides a tiny subset of the supabase client methods used by the UI:
// - auth.getUser(), auth.getSession()
// - auth.signOut()
// - auth.onAuthStateChange(handler)

declare global {
  interface Window {
    __medqa_auth_token__?: string | null
  }
}

function parseJwt(token: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(''),
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export function createBrowserClient() {
  if (typeof window === 'undefined')
    throw new Error('createBrowserClient must be called in browser')

  function getToken() {
    return window.__medqa_auth_token__ || localStorage.getItem('token') || null
  }

  function emitChange(eventName = 'auth:change', session: any = null) {
    try {
      window.dispatchEvent(new CustomEvent(eventName, { detail: session }))
    } catch {}
  }

  const client = {
    auth: {
      async getSession() {
        const token = getToken()
        const user = parseJwt(token)
        return {
          data: { session: token ? { access_token: token, user } : null },
        }
      },
      async getUser() {
        const token = getToken()
        const user = parseJwt(token)
        return { data: { user } }
      },
      async signOut() {
        localStorage.removeItem('token')
        window.__medqa_auth_token__ = null
        emitChange('auth:change', null)
        return { error: null }
      },
      onAuthStateChange(cb: (event: string, session: any) => void) {
        const handler = (e: any) => cb('SIGNED_IN', e.detail)
        window.addEventListener('auth:change', handler as EventListener)
        return {
          data: {
            subscription: {
              unsubscribe: () =>
                window.removeEventListener(
                  'auth:change',
                  handler as EventListener,
                ),
            },
          },
        }
      },
    },
  }

  return client as any
}
