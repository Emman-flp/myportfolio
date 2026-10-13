'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { admin } from '@/lib/supabase/admin'
import { createServerSupabase, isAdmin } from '@/lib/supabase/server'
import { isConfigured } from '@/lib/supabase/admin'
import { localSignIn, localSignOut } from '@/lib/localAuth'
import { readContent, writeContent } from '@/lib/store'
import { hasLiveData } from '@/lib/data'
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

/**
 * Collections the generic editor is allowed to touch, mapped to the matching
 * key in the local JSON store so both backends get the same shape.
 */
const WRITABLE: Record<string, string> = {
  profile: 'profile',
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

type TableName = keyof Database['public']['Tables']

function assertWritable(table: string): asserts table is TableName {
  if (!WRITABLE[table]) throw new Error(`Unknown table: ${table}`)
}

/** Map a database column name onto the camelCase key used in the JSON store. */
const LOCAL_KEY: Record<string, string> = {
  sort_order: 'sort_order',
  is_read: 'is_read',
  created_at: 'created_at',
  group_id: 'group_id',
  org_id: 'org_id',
  published_at: 'published_at',
  published: 'published',
  read_minutes: 'readMinutes',
  github_username: 'githubUsername',
  verify_url: 'verifyUrl',
  logo_url: 'logo',
  icon_url: 'icon',
  video_url: 'videoUrl',
  featured_in: 'featuredIn',
  bullets: 'bullets',
  tags: 'tags',
  badges: 'badges',
  links: 'links',
  paragraphs: 'paragraphs',
  socials: 'socials',
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

  if (!password) return { ok: false, error: 'Password is required.' }

  // Use Supabase Auth only when the database is actually reachable AND running
  // the schema. `isConfigured()` alone is not enough — a valid URL with an
  // empty database would send the user to a dead end instead of the local gate.
  if (isConfigured() && (await hasLiveData())) {
    try {
      const supabase = await createServerSupabase()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (!error && (await isAdmin())) redirect('/admin')

      await supabase.auth.signOut()
      return {
        ok: false,
        error: 'Those credentials did not work, or that account is not an admin.',
      }
    } catch {
      // Database unreachable — fall through to the local password gate.
    }
  }

  if (await localSignIn(password)) redirect('/admin')

  return {
    ok: false,
    error: process.env.ADMIN_PASSWORD ? 'Wrong password.' : 'Set ADMIN_PASSWORD in .env.local first.',
  }
}

export async function signOut() {
  await localSignOut()
  try {
    const supabase = await createServerSupabase()
    await supabase.auth.signOut()
  } catch {
    // no session to clear
  }
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

  const live = await hasLiveData()

  if (!live) {
    await saveLocal(WRITABLE[table], id, payload, table)
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return { ok: true, message: id ? 'Saved to local content.' : 'Created in local content.' }
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

/** Apply an edit to the JSON store, translating column names to store keys. */
async function saveLocal(collection: string, id: string, payload: Record<string, unknown>, table: string) {
  const content = await readContent()

  if (collection === 'profile') {
    await writeContent({ profile: { ...content.profile, ...mapProfile(payload) } })
    return
  }

  const list = (content as Record<string, unknown>)[collection]
  if (!Array.isArray(list)) return

  const mapped: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(payload)) {
    mapped[LOCAL_KEY[k] ?? k] = v
  }

  if (id) {
    const index = list.findIndex((row) => (row as Record<string, unknown>).id === id)
    if (index >= 0) list[index] = { ...list[index], ...mapped }
  } else {
    list.push({ ...mapped, id: `local-${Date.now().toString(36)}` })
  }

  await writeContent({ [collection]: list } as never)
  void table
}

/** The profile form is its own action, so it has its own translation. */
function mapProfile(payload: Record<string, unknown>): Record<string, unknown> {
  return payload
}

export async function deleteRow(formData: FormData): Promise<void> {
  await requireAdmin()

  const table = String(formData.get('_table') ?? '')
  assertWritable(table)
  const id = String(formData.get('_id') ?? '')
  if (!id) return

  if (!(await hasLiveData())) {
    const content = await readContent()
    const collection = WRITABLE[table]
    const list = (content as Record<string, unknown>)[collection]
    if (Array.isArray(list)) {
      await writeContent({
        [collection]: list.filter((r) => (r as Record<string, unknown>).id !== id),
      } as never)
    }
  } else {
    await loose().from(table).delete().eq('id', id)
  }

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

  if (!(await hasLiveData())) {
    await writeContent({
      profile: {
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        email: row.email,
        githubUsername: row.github_username,
        paragraphs,
        socials,
      },
    })
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return { ok: true, message: 'Profile saved to local content.' }
  }

  const db = admin()
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
