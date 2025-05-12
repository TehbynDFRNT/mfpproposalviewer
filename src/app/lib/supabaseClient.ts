/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/supabaseClient.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Basic Supabase client instance for client-side API calls
 */
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Server-side Supabase client for API routes
 * Uses the same public/anon key as the client instance
 * In a production environment, you might want to use a service_role key
 * for admin-level access from server components.
 */
export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
})
