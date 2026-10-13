import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Service-role client. BYPASSES row level security.
 *
 * ⚠️ Server-only. The `server-only` package enforces this at build time — if an
 * import error appears here, a Client Component tried to reach the database
 * directly, which is exactly what we want to prevent.
 *
 * ## Key formats
 *
 * Supabase is replacing the long-lived JWT keys (`eyJ…`, what `.env.local` holds
 * today) with nameable ones: `sb_publishable_…` and `sb_secret_…`. Legacy keys
 * keep working until they are explicitly disabled in the dashboard.
 *
 * When migrating, Supabase's guidance is to send the new keys on the `apikey`
 * header only, because they are not JWTs and anything that parses one fails with
 * `Invalid JWT`. It is tempting to reach for `supabase-js`'s `omitApiKeyAsBearer`
 * for this. It does not work — that is **not** a client-level option;
 * `supabase-js` passes it internally to its Functions client only.
 *
 * That is still fine, for two reasons:
 *
 *   1. Edge Functions — where `Invalid JWT` actually bites, since `verify_jwt`
 *      only understands legacy JWTs — is already handled: `supabase-js` builds
 *      its Functions client with `omitApiKeyAsBearer: true`.
 *   2. The data API accepts a new-format key on `Authorization` for migration
 *      compatibility.
 *
 * `scripts/verify-key-formats.mjs` asserts the headers on both paths for both
 * formats, so an upgrade that changes this fails loudly instead of silently
 * breaking auth.
 *
 * **So: no option is needed here, and adding one would be dead code.**
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

/** True when the Supabase env vars are present and the URL is well formed. */
export function isConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && typeof url === 'string' && /^https?:\/\//.test(url),
  )
}
