import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with service role access.
 * This should ONLY be imported in React Server Components or server-side code.
 * DO NOT import this in client components.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;   // server-only var

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});