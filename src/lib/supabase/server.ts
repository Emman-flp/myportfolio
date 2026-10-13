import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import { hasLocalSession, localAuthEnabled } from '../localAuth'

/**
 * Request-scoped client carrying the user's session cookie.
 * RLS applies. Used to answer "is this person an admin?" via the `admins` table.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — cookie writes are not allowed
            // there. Safe to ignore; middleware refreshes the session.
          }
        },
      },
    },
  )
}

/**
 * True when the current request is allowed to reach /admin.
 *
 * Two independent gates, either of which is sufficient:
 *   - a Supabase session belonging to a row in `admins`
 *   - the local password session, used when no database is connected
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) return true
    }
  } catch {
    // No database — fall through to the local gate.
  }

  if (localAuthEnabled() && (await hasLocalSession())) return true

  return false
}
