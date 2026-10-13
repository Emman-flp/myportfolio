import { admin, isConfigured } from './supabase/admin'

/**
 * Admin-only reads. Goes through the service_role key, so it bypasses RLS —
 * every function here is called exclusively from /admin, which is guarded by
 * `isAdmin()` in the layout and again in each server action.
 */

export type AdminMessage = {
  id: string
  name: string
  email: string
  organisation: string | null
  role: string | null
  budget: string | null
  timeline: string | null
  details: string | null
  is_read: boolean
  created_at: string
}

function requireConfig() {
  if (!isConfigured()) {
    throw new Error('Supabase is not configured. Check .env.local.')
  }
}

/** True when a query actually succeeds — i.e. keys are valid AND schema exists. */
export async function hasLiveData(): Promise<boolean> {
  if (!isConfigured()) return false
  try {
    const { error } = await admin().from('profile').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

export async function getMessages(): Promise<AdminMessage[]> {
  requireConfig()
  const { data, error } = await admin()
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminMessage[]
}

export async function getRows<T = Record<string, unknown>>(
  table: string,
  opts: { order?: string; asc?: boolean; limit?: number } = {},
): Promise<T[]> {
  requireConfig()
  let q = admin().from(table).select('*')
  if (opts.order) {
    q = q.order(opts.order, { ascending: opts.asc ?? true })
  }
  if (opts.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as T[]
}

export async function getOne<T = Record<string, unknown>>(
  table: string,
  id: string,
): Promise<T | null> {
  requireConfig()
  const { data, error } = await admin().from(table).select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return (data ?? null) as T | null
}

export async function getFirst<T = Record<string, unknown>>(
  table: string,
): Promise<T | null> {
  requireConfig()
  const { data, error } = await admin().from(table).select('*').limit(1).maybeSingle()
  if (error) throw new Error(error.message)
  return (data ?? null) as T | null
}

export async function countUnreadMessages(): Promise<number> {
  requireConfig()
  const { count } = await admin()
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)
  return count ?? 0
}
