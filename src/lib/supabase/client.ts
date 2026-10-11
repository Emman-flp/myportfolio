import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Browser client. Uses the anon key, so it is fully subject to RLS.
 * Safe to ship to the client.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
