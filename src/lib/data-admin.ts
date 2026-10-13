import { admin, isConfigured } from './supabase/admin'
import { readContent, writeContent } from './store'
import { hasLiveData } from './data'

/**
 * Admin-only reads. Backed by Supabase when connected, otherwise by the local
 * JSON store — so the admin works with no database at all.
 *
 * Every caller sits behind `isAdmin()` (layout) and `requireAdmin()` (actions).
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
export { hasLiveData }
export async function getMessages(): Promise<AdminMessage[]> {
  if (await hasLiveData()) {
    requireConfig()
    const { data, error } = await admin()
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw new Error(error.message)
    return (data ?? []) as AdminMessage[]
  }

  const { messages } = await readContent()
  return (messages ?? []) as AdminMessage[]
}

export async function getRows<T = Record<string, unknown>>(
  table: string,
  opts: { order?: string; asc?: boolean; limit?: number } = {},
): Promise<T[]> {
  if (!(await hasLiveData())) return getLocalRows<T>(table)

  requireConfig()
  let q = admin().from(table).select('*')
  if (opts.order) q = q.order(opts.order, { ascending: opts.asc ?? true })
  if (opts.limit) q = q.limit(opts.limit)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []) as T[]
}

const STORE_COLLECTION: Record<string, string> = {
  projects: 'projects',
  project_stack: 'projectStack',
  experience_orgs: 'experienceOrgs',
  skills: 'skills',
  skill_groups: 'skillGroups',
  certifications: 'certifications',
  affiliations: 'affiliations',
  posts: 'posts',
  resource_groups: 'resources',
  resources: 'resources',
}

async function getLocalRows<T>(table: string): Promise<T[]> {
  const content = await readContent()
  const collection = STORE_COLLECTION[table]
  if (!collection) return []
  const value = (content as Record<string, unknown>)[collection]
  return Array.isArray(value) ? (value as T[]) : []
}

export async function getOne<T = Record<string, unknown>>(table: string, id: string): Promise<T | null> {
  if (!(await hasLiveData())) {
    const rows = await getLocalRows<T>(table)
    return rows.find((r) => (r as Record<string, unknown>).id === id) ?? null
  }

  requireConfig()
  const { data, error } = await admin().from(table).select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return (data ?? null) as T | null
}

export async function getFirst<T = Record<string, unknown>>(table: string): Promise<T | null> {
  if (table === 'profile') {
    const { profile } = await readContent()
    return profile as T
  }
  if (!(await hasLiveData())) {
    const rows = await getLocalRows<T>(table)
    return rows[0] ?? null
  }

  requireConfig()
  const { data, error } = await admin().from(table).select('*').limit(1).maybeSingle()
  if (error) throw new Error(error.message)
  return (data ?? null) as T | null
}

export { writeContent }
