import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface Window {
    __supabase_client__?: SupabaseClient
  }
}

// Use non-generic SupabaseClient to avoid excessive type-instantiation depth in TS
type AnyClient = SupabaseClient

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
    // minimal debug (do NOT log the key)
    console.debug(
      '[supabase] creating browser client for',
      url,
      'origin=',
      window.location.origin,
    )
    // Cast to a lightweight client type to prevent TS2589 deep instantiation
    // Add explicit auth options to avoid unexpected redirect/session handling differences in prod
    window.__supabase_client__ = (createClient as any)(url, key, {
      auth: {
        persistSession: true,
        // detectSessionInUrl parses auth callback params automatically; set to false if you handle callback manually
        detectSessionInUrl: true,
      },
    }) as any
  } else {
    console.debug('[supabase] reusing existing browser client for', url)
  }

  return window.__supabase_client__ as AnyClient
}
