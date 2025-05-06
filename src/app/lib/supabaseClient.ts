/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/supabaseClient.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Basic Supabase client instance for API calls
 */
export const supabase = createClient(supabaseUrl, supabaseKey)
