'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { admin } from '@/lib/supabase/admin'
import { createServerSupabase, isAdmin } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

/**
 * Every mutation in the admin lives here.
 *
 * `requireAdmin()` is the real security boundary. Middleware only hides UI; this
 * check is what stops an unauthorised write, because the service_role key is
 * only ever reached from inside these functions after the check passes.
 */

export type ActionState = { ok: boolean; error?: string; message?: string }

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error('Not authorised. Sign in with an admin account.')
  }
}

/** Collections the generic editor is allowed to touch. */
const WRITABLE = new Set([
  'profile',
  'projects',
  'project_stack',
  'experience_orgs',
  'experience_roles',
  'skill_groups',
  'skills',
  'certifications',
  'affiliations',
  'posts',
  'resource_groups',
  'resources',
])

type TableName = keyof Database['public']['Tables']

function assertWritable(table: string): asserts table is TableName {
  if (!WRITABLE.has(table)) throw new Error(`Unknown table: ${table}`)
}

/**
 * The generic CRUD helpers write to a column set only known at runtime (the
 * table arrives in a hidden form field), which the typed client cannot express.
 * These calls go through a narrow untyped view of the same client. Every table
 * is still validated against the WRITABLE allow-list, and every caller has
 * already passed `requireAdmin()`.
 */
type LooseClient = {
  from(table: string): {
    select(columns?: string): any
    insert(values: Record<string, unknown>): Promise<{ error: { message: string } | null }>
    update(values: Record<string, unknown>): {
      eq(column: string, value: unknown): Promise<{ error: { message: string } | null }>
    }
    delete(): {
      eq(column: string, value: unknown): Promise<{ error: { message: string } | null }>
    }
  }
}

function loose(): LooseClient {
  return admin() as unknown as LooseClient
}

/* ---- auth ---------------------------------------------------------------- */

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { ok: false, error: 'Email and password are required.' }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { ok: false, error: 'Those credentials did not work.' }
  }

  // Password alone is not enough — the user must also be in `admins`.
  if (!(await isAdmin())) {
    await supabase.auth.signOut()
    return { ok: false, error: 'That account is signed in but is not an admin.' }
  }

  redirect('/admin')
}

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

/* ---- generic CRUD -------------------------------------------------------- */

/**
 * Insert or update one row. `id` absent -> insert.
 * `jsonb` columns arrive as JSON strings from a form field and are parsed here
 * so the editor never has to know which columns are JSON.
 */
export async function saveRow(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }

  const table = String(formData.get('_table') ?? '')
  assertWritable(table)

  const id = String(formData.get('_id') ?? '')
  const payload: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('_')) continue
    if (key.endsWith('[]')) {
      // comma or newline separated -> jsonb array of strings
      payload[key.slice(0, -2)] = value
        .toString()
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    } else {
      payload[key] = value
    }
  }

  // checkbox fields that were unchecked are absent from FormData entirely
  for (const key of ['published', 'is_read']) {
    if (!formData.has(key) && formData.has(`__${key}`)) payload[key] = false
  }

  const db = loose()
  const result = id
    ? await db.from(table).update(payload).eq('id', id)
    : await db.from(table).insert(payload)

  if (result.error) return { ok: false, error: result.error.message }

  revalidatePath('/admin')
  revalidatePath('/', 'layout')
  return { ok: true, message: id ? 'Saved.' : 'Created.' }
}

export async function deleteRow(formData: FormData): Promise<void> {
  await requireAdmin()

  const table = String(formData.get('_table') ?? '')
  assertWritable(table)
  const id = String(formData.get('_id') ?? '')
  if (!id) return

  await loose().from(table).delete().eq('id', id)

  revalidatePath('/admin')
  revalidatePath('/', 'layout')
}

/** Move a row up or down within its `sort_order` ordering. */
export async function moveRow(formData: FormData): Promise<void> {
  await requireAdmin()

  const table = String(formData.get('_table') ?? '')
  assertWritable(table)
  const id = String(formData.get('_id') ?? '')
  const direction = String(formData.get('_dir'))
  if (!id || (direction !== 'up' && direction !== 'down')) return

  const db = loose()
  const { data: current } = await db.from(table).select('*').eq('id', id).maybeSingle()
  if (!current) return

  const sortKey = 'sort_order' in current ? 'sort_order' : null
  if (!sortKey) return

  const currentOrder = Number(current[sortKey] ?? 0)
  const target = direction === 'up' ? currentOrder - 1 : currentOrder + 1

  // Swap with whichever row currently occupies the target slot
  const { data: neighbour } = await db
    .from(table)
    .select('id, sort_order')
    .eq('sort_order', target)
    .maybeSingle()

  await db.from(table).update({ [sortKey]: target }).eq('id', id)
  if (neighbour) {
    await db.from(table).update({ [sortKey]: currentOrder }).eq('id', neighbour.id)
  }

  revalidatePath('/admin')
  revalidatePath('/', 'layout')
}

/* ---- profile: single row ------------------------------------------------- */

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }

  const db = admin()
  const paragraphs = String(formData.get('paragraphs') ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const socials = String(formData.get('socials') ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split('|').map((s) => s.trim())
      return { label, href: href ?? '' }
    })

  const row = {
    name: String(formData.get('name') ?? '').trim(),
    tagline: String(formData.get('tagline') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    github_username: String(formData.get('github_username') ?? '').trim(),
    paragraphs,
    socials,
    updated_at: new Date().toISOString(),
  }

  const { data: existing } = await db.from('profile').select('id').limit(1).maybeSingle()

  const result = existing
    ? await db.from('profile').update(row).eq('id', existing.id)
    : await db.from('profile').insert(row)

  if (result.error) return { ok: false, error: result.error.message }

  revalidatePath('/admin')
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Profile saved.' }
}

/* ---- contact messages ---------------------------------------------------- */

export async function markMessage(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('_id') ?? '')
  const isRead = String(formData.get('_read')) === 'true'
  if (!id) return

  await admin().from('contact_messages').update({ is_read: isRead }).eq('id', id)
  revalidatePath('/admin/messages')
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('_id') ?? '')
  if (!id) return
  await admin().from('contact_messages').delete().eq('id', id)
  revalidatePath('/admin/messages')
}
