// Lightweight client-side auth helper that calls our JWT login endpoint.
export async function signInAndPersist(email: string, password: string) {
  const resp = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data?.error || 'Failed to sign in')
  // We use HttpOnly cookies; notify listeners only
  try {
    window.dispatchEvent(
      new CustomEvent('auth:change', { detail: { access_token: true } }),
    )
  } catch {}
  return data
}

export default signInAndPersist

export function signOut() {
  try {
    fetch('/api/auth/signout', { method: 'POST' }).catch(() => {})
    try {
      window.dispatchEvent(
        new CustomEvent('auth:change', { detail: { access_token: null } }),
      )
    } catch {}
  } catch (e) {
    // ignore
  }
}
