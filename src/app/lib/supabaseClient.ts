import { createClient, SupabaseClientOptions } from '@supabase/supabase-js'
import camelcaseKeys from 'camelcase-keys'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Custom fetch wrapper transforming JSON responses from snake_case → camelCase.
 * Matches standard fetch signature.
 */
async function fetchWithCamel(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init)
  const contentType = res.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    // parse original JSON
    const original = await res.clone().json()
    // deep-convert all keys to camelCase
    const camel = camelcaseKeys(original, { deep: true })
    // rebuild body
    const body = JSON.stringify(camel)
    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    })
  }

  return res
}

/**
 * Single Supabase client instance that auto-camelizes JSON.
 * Chooses service role key on server, anon on browser.
 */
export const supabase = createClient(
  url,
  typeof window === 'undefined' ? serviceRoleKey : anonKey,
  {
    global: {
      fetch: fetchWithCamel,
    },
  } as Partial<SupabaseClientOptions<any>>
)
