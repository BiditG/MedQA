import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    __supabase_client__?: SupabaseClient
  }
}

// Narrow generics to avoid deep type instantiation
type AnyClient = SupabaseClient<any, 'public', any>

export function createBrowserClient(): AnyClient {
  if (typeof window === 'undefined') {
    throw new Error(
      'createBrowserClient must be called in the browser (client component or inside useEffect).',
    )
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart dev server.',
    )
  }

  if (!window.__supabase_client__) {
    console.debug('[supabase] creating browser client for', url)
    // Cast to a lightweight client type to prevent TS2589 deep instantiation
    window.__supabase_client__ = (createClient as any)(url, key, {
      auth: { persistSession: true },
    }) as any
  } else {
    console.debug('[supabase] reusing existing browser client for', url)
  }

  return window.__supabase_client__ as AnyClient
}
