'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { admin } from '@/lib/supabase/admin'
import { createServerSupabase, isAdmin } from '@/lib/supabase/server'
import { isConfigured } from '@/lib/supabase/admin'
import { localSignIn, localSignOut } from '@/lib/localAuth'
import { readContent, writeContent, STORE_PERSISTENCE_WARNING } from '@/lib/store'
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

/**
 * Sign in, by whichever gate applies.
 *
 * Supabase Auth is tried first when an email is supplied. The local
 * `ADMIN_PASSWORD` gate is always available as a fallback: it is the documented
 * recovery path if the Supabase account is lost, the `admins` row is missing, or
 * Auth is misconfigured. Losing that fallback the moment the database came
 * online would lock the owner out of their own site.
 */
export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!password) return { ok: false, error: 'Password is required.' }

  let dbError: string | null = null

  if (email && isConfigured() && (await hasLiveData())) {
    try {
      const supabase = await createServerSupabase()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (!error && (await isAdmin())) redirect('/admin')

      await supabase.auth.signOut()
      dbError =
        'Those credentials did not work, or that account is not in the admins table.'
    } catch {
      dbError = 'Could not reach the database.'
    }
  }

  if (await localSignIn(password)) redirect('/admin')

  // Prefer whichever message is actionable: "no local password configured" beats
  // "wrong credentials" when the local gate is switched off entirely.
  if (!process.env.ADMIN_PASSWORD) {
    return { ok: false, error: dbError ?? 'Set ADMIN_PASSWORD in .env.local to allow local sign-in.' }
  }

  return { ok: false, error: dbError ?? 'Wrong password.' }
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
    const result = await saveLocal(WRITABLE[table], id, payload, table)
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return result.persisted
      ? {
          ok: true,
          message: id ? 'Saved to local content.' : 'Created in local content.',
        }
      : {
          ok: false,
          error: STORE_PERSISTENCE_WARNING,
        }
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
async function saveLocal(
  collection: string,
  id: string,
  payload: Record<string, unknown>,
  table: string,
): Promise<{ persisted: boolean }> {
  const content = await readContent()

  if (collection === 'profile') {
    const result = await writeContent({
      profile: { ...content.profile, ...mapProfile(payload) },
    })
    return { persisted: result.persisted }
  }

  const list = (content as Record<string, unknown>)[collection]
  if (!Array.isArray(list)) return { persisted: false }

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

  const result = await writeContent({ [collection]: list } as never)
  void table
  return { persisted: result.persisted }
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
      const result = await writeContent({
        [collection]: list.filter((r) => (r as Record<string, unknown>).id !== id),
      } as never)
      if (!result.persisted) throw new Error(STORE_PERSISTENCE_WARNING)
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
    const result = await writeContent({
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
    return result.persisted
      ? { ok: true, message: 'Profile saved to local content.' }
      : { ok: false, error: STORE_PERSISTENCE_WARNING }
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
/* ---- seed: copy local content into an empty Supabase ---------------------- */

/**
 * Pushes `content/content.json` into Supabase, never overwriting existing rows.
 *
 * This handles one specific situation: the schema has been run but the tables
 * are still empty, so the site is serving from the local store while every new
 * edit would land in the database alone. Seeding makes the two agree instead of
 * quietly splitting content across two places.
 *
 * Three things this has to get right, all of them found by running the payloads
 * against the live schema rather than by reading it:
 *
 *   1. `projects.slug` is NOT NULL, and the local store has no slug � one is
 *      derived from the title.
 *   2. `experience_roles.org_id`, `skills.group_id` and `resources.group_id` are
 *      foreign keys, so children must be inserted *after* their parents and must
 *      reference the ids Postgres actually assigned. Pre-minting UUIDs fails.
 *   3. `skills` is one table feeding two views (the grouped list on /stack and
 *      the flat chip row on the homepage), so the grouped names and the flat
 *      list are merged rather than seeded twice.
 *
 * Each table is only written when empty, which makes the whole operation
 * safe to run twice.
 */

type SeedReport = { table: string; inserted: number; skipped: number; error?: string }

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item'

export async function seedSupabase(): Promise<{
  ok: boolean
  message?: string
  error?: string
  report?: SeedReport[]
}> {
  try {
    await requireAdmin()
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }

  if (!(await hasLiveData())) {
    return { ok: false, error: 'Supabase is not reachable, so there is nothing to seed into.' }
  }

  const content = await readContent()
  const db = admin()
  const report: SeedReport[] = []

  /**
   * Insert `rows` only when the table is empty.
   *
   * Returns the inserted rows (with their real ids) so callers can wire up
   * foreign keys, or `null` when the table already had rows or the insert
   * failed. The report records why either way.
   */
  const insert = async (
    table: string,
    rows: Record<string, unknown>[],
  ): Promise<Record<string, unknown>[] | null> => {
    if (!rows.length) {
      report.push({ table, inserted: 0, skipped: 0 })
      return []
    }

    const { count, error: countErr } = await db
      .from(table)
      .select('*', { count: 'exact', head: true })

    if (countErr) {
      report.push({ table, inserted: 0, skipped: 0, error: countErr.message })
      return null
    }
    if ((count ?? 0) > 0) {
      report.push({ table, inserted: 0, skipped: rows.length })
      return null
    }

    const { data, error } = await db.from(table).insert(rows as never).select('id')
    if (error) {
      report.push({ table, inserted: 0, skipped: rows.length, error: error.message })
      return null
    }

    report.push({ table, inserted: data.length, skipped: 0 })
    return data
  }

  /* ---- profile ---- */
  await insert('profile', [
    {
      name: content.profile.name,
      tagline: content.profile.tagline,
      description: content.profile.description,
      paragraphs: content.profile.paragraphs,
      socials: content.profile.socials,
      email: content.profile.email,
      github_username: content.profile.githubUsername,
    },
  ])

  /* ---- projects (slug is NOT NULL) ---- */
  const usedSlugs = new Set<string>()
  await insert(
    'projects',
    content.projects.map((p, i) => {
      let slug = slugify(p.title)
      while (usedSlugs.has(slug)) slug = `${slug}-${i}`
      usedSlugs.add(slug)
      return {
        slug,
        title: p.title,
        summary: p.summary ?? '',
        badges: p.badges ?? [],
        links: p.links ?? [],
        tags: p.tags ?? [],
        featured_in: p.featuredIn ?? [],
        video_url: p.videoUrl ?? null,
        icon_url: p.icon ?? null,
        published: true,
        sort_order: i,
      }
    }),
  )

  await insert(
    'project_stack',
    content.projectStack.map((r, i) => ({
      name: r.name,
      href: r.href,
      category: r.category,
      description: r.description,
      published: true,
      sort_order: i,
    })),
  )

  /* ---- experience: orgs first, then roles keyed to the real org ids ---- */
  const insertedOrgs = await insert(
    'experience_orgs',
    content.experienceOrgs.map((o, i) => ({
      monogram: o.monogram,
      name: o.name,
      employment: o.employment,
      meta: o.meta,
      location: o.location,
      published: true,
      sort_order: i,
    })),
  )

  if (insertedOrgs) {
    // PostgREST returns rows in insertion order, so index i lines up.
    await insert(
      'experience_roles',
      content.experienceOrgs.flatMap((o, oi) =>
        o.roles.map((r, i) => ({
          org_id: insertedOrgs[oi]?.id ?? null,
          period: r.period,
          title: r.title,
          summary: r.summary ?? '',
          bullets: r.bullets ?? [],
          sort_order: i,
        })),
      ),
    )
  } else {
    report.push({ table: 'experience_roles', inserted: 0, skipped: 0 })
  }

  /* ---- skills: one table, two views ---- */
  const insertedGroups = await insert(
    'skill_groups',
    content.skillGroups.map((g, i) => ({ title: g.title, sort_order: i })),
  )

  if (insertedGroups) {
    const grouped = content.skillGroups.flatMap((g, gi) =>
      g.items.map((name, i) => ({
        group_id: insertedGroups[gi]?.id ?? null,
        name,
        published: true,
        sort_order: i,
      })),
    )
    // Anything only present in the flat chip list becomes an ungrouped row, so
    // the homepage chips and /stack agree.
    const inGroups = new Set(content.skillGroups.flatMap((g) => g.items))
    const extra = content.skills.filter((n) => !inGroups.has(n))

    await insert('skills', [
      ...grouped,
      ...extra.map((name, i) => ({
        group_id: null,
        name,
        published: true,
        sort_order: grouped.length + i,
      })),
    ])
  } else {
    report.push({ table: 'skills', inserted: 0, skipped: 0 })
  }

  /* ---- certifications / affiliations ---- */
  await insert(
    'certifications',
    content.certifications.map((c, i) => ({
      name: c.name,
      issuer: c.issuer,
      logo_url: c.logo ?? null,
      verify_url: c.verifyUrl ?? null,
      group_title: 'Certifications',
      published: true,
      sort_order: i,
    })),
  )

  await insert(
    'affiliations',
    content.affiliations.map((a, i) => ({
      name: a.name,
      role: a.role,
      logo_url: a.logo ?? null,
      emoji: a.emoji ?? null,
      href: a.href,
      summary: '',
      published: true,
      sort_order: i,
    })),
  )

  /* ---- posts ---- */
  await insert(
    'posts',
    content.posts.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? '',
      body: p.body ?? '',
      read_minutes: p.readMinutes ?? 1,
      tags: p.tags ?? [],
      cover_url: p.cover ?? null,
      // Placeholders carry no real publication date; anchor them so the
      // newest-first ordering is stable instead of all landing on "now".
      published_at: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
      published: true,
    })),
  )

  /* ---- resource groups, then links keyed to the real group ids ---- */
  const insertedResGroups = await insert(
    'resource_groups',
    content.resources.map((g, i) => ({ title: g.title, sort_order: i })),
  )

  if (insertedResGroups) {
    await insert(
      'resources',
      content.resources.flatMap((g, gi) =>
        g.links.map((l, i) => ({
          group_id: insertedResGroups[gi]?.id ?? null,
          title: l.title,
          href: l.href,
          description: l.description ?? '',
          sort_order: i,
        })),
      ),
    )
  } else {
    report.push({ table: 'resources', inserted: 0, skipped: 0 })
  }

  const inserted = report.reduce((n, r) => n + r.inserted, 0)
  const skipped = report.reduce((n, r) => n + r.skipped, 0)
  const failed = report.filter((r) => r.error)

  revalidatePath('/admin')
  revalidatePath('/', 'layout')

  if (failed.length && !inserted) {
    return { ok: false, error: failed.map((f) => `${f.table}: ${f.error}`).join('; '), report }
  }

  return {
    ok: true,
    message:
      inserted === 0
        ? `Nothing to do � ${skipped} row${skipped === 1 ? '' : 's'} skipped because the table already had rows.`
        : `Seeded ${inserted} row${inserted === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} already present` : ''}.` +
            (failed.length ? ` ${failed.length} table${failed.length === 1 ? '' : 's'} failed � see the breakdown.` : ''),
    report,
  }
}
