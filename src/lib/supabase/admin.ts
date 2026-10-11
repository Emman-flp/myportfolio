import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Service-role client. BYPASSES row level security.
 *
 * ⚠️ Server-only. The `server-only` package enforces this at build time — if an
 * import error appears here, a Client Component tried to reach the database
 * directly, which is exactly what we want to prevent.
 */
import 'server-only'

let client: SupabaseClient<Database> | undefined

export function admin(): SupabaseClient<Database> {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        'Supabase is not configured. Copy .env.local.example to .env.local and fill in the keys.',
      )
    }
    client = createSupabaseClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return client
}

/** True when the Supabase env vars are present. Says nothing about validity. */
export function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
