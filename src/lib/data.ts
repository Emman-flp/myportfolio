import { existsSync } from 'node:fs'
import path from 'node:path'
import { readContent } from './store'
import { admin, isConfigured } from './supabase/admin'
import {
  PLACEHOLDER_AFFILIATIONS,
  PLACEHOLDER_CERTS,
  PLACEHOLDER_EXPERIENCE,
  PLACEHOLDER_EXPERIENCE_ORGS,
  PLACEHOLDER_POSTS,
  PLACEHOLDER_PROJECT_DETAILS,
  PLACEHOLDER_PROJECT_STACK,
  PLACEHOLDER_PROFILE_FALLBACK,
  PLACEHOLDER_RESOURCE_GROUPS,
  PLACEHOLDER_STACK,
  PLACEHOLDER_STACK_GROUPS,
} from './fixtures'
import type {
  Affiliation,
  Cert,
  ExperienceEntry,
  ExperienceOrg,
  Post,
  Profile,
  Project,
  ProjectDetail,
  ProjectStackRow,
  ResourceGroup,
  StackGroup,
} from './types'

/**
 * Read helpers with a three-tier fallback:
 *
 *   1. Supabase   — when the keys are valid and the schema has been run
 *   2. local JSON — `content/content.json`, written by the admin dashboard
 *   3. fixtures   — `lib/fixtures.ts`, so the layout always renders correctly
 *
 * The public UI therefore never errors, whatever state the backend is in.
 *
 * ⚠️ The tiers are consulted **per collection**, not per backend. A live but
 * empty Supabase table falls through to the local store rather than showing
 * nothing — that is the state right after `0001_init.sql` runs, and silently
 * blanking the site then would look like data loss. See `getSourceSummary()`
 * and the admin Overview, which surface the mismatch.
 */

export type Source = 'supabase' | 'local' | 'fixtures'

let liveCache: boolean | null = null

/** True once a query actually succeeds against Supabase. */
export async function hasLiveData(): Promise<boolean> {
  if (liveCache !== null) return liveCache
  if (!isConfigured()) return (liveCache = false)

  try {
    const { error } = await admin().from('profile').select('id').limit(1)
    liveCache = !error
  } catch {
    liveCache = false
  }
  return liveCache
}

/** Clear the Supabase probe — call after fixing keys. */
export function resetProbe() {
  liveCache = null
}

/** Which backend is serving the most content. */
export async function getSource(): Promise<Source> {
  if (await hasLiveData()) {
    const { data } = await admin().from('profile').select('id').limit(1)
    if (data?.length) return 'supabase'
  }
  return existsSync(path.join(process.cwd(), 'content', 'content.json'))
    ? 'local'
    : 'fixtures'
}

/** Row counts per collection, so the admin can show a half-migrated state. */
export async function getSourceSummary(): Promise<{
  supabase: Record<string, number>
  local: Record<string, number>
}> {
  const local = await readContent()
  const localCounts: Record<string, number> = {}
  for (const [k, v] of Object.entries(local)) {
    if (Array.isArray(v)) localCounts[k] = v.length
  }

  const supabaseCounts: Record<string, number> = {}
  if (await hasLiveData()) {
    const tables = [
      'profile',
      'projects',
      'project_stack',
      'experience_orgs',
      'skills',
      'skill_groups',
      'certifications',
      'affiliations',
      'posts',
      'resource_groups',
      'resources',
    ]
    await Promise.all(
      tables.map(async (t) => {
        try {
          const { count, error } = await admin()
            .from(t as never)
            .select('*', { count: 'exact', head: true })
          if (!error) supabaseCounts[t] = count ?? 0
        } catch {
          /* table may not exist */
        }
      }),
    )
  }

  return { supabase: supabaseCounts, local: localCounts }
}

/**
 * Core of the fallback chain.
 *
 * `live` is whatever Supabase returned (null when unreachable, empty array when
 * the table has no rows). Whichever tier first produces rows wins; otherwise the
 * fixtures do, so a page always has something to lay out.
 */
function pick<T>(live: T[] | null | undefined, local: T[] | null | undefined, fallback: T[]): T[] {
  if (live && live.length) return live
  if (local && local.length) return local
  return fallback
}

/** Same chain for a single row. */
function pickOne<T>(live: T | null | undefined, local: T | null | undefined, fallback: T): T {
  return live ?? local ?? fallback
}

/* ---- profile -------------------------------------------------------------- */

export async function getProfile(): Promise<Profile> {
  let live: Profile | null = null

  if (await hasLiveData()) {
    try {
      const { data, error } = await admin().from('profile').select('*').limit(1).maybeSingle()
      if (!error && data) {
        live = {
          name: data.name,
          tagline: data.tagline ?? '',
          description: data.description ?? '',
          paragraphs: (data.paragraphs as string[]) ?? [],
          email: data.email ?? '',
          socials: (data.socials as Profile['socials']) ?? [],
          githubUsername: data.github_username ?? '',
        }
      }
    } catch {
      /* fall through */
    }
  }

  const { profile } = await readContent()
  return pickOne(live, profile, PLACEHOLDER_PROFILE_FALLBACK)
}

/* ---- projects ------------------------------------------------------------- */

export async function getProjects(limit?: number): Promise<ProjectDetail[]> {
  let live: ProjectDetail[] | null = null

  if (await hasLiveData()) {
    try {
      let q = admin().from('projects').select('*').eq('published', true).order('sort_order')
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (!error && data) {
        live = data.map((r) => ({
          id: r.id,
          title: r.title,
          summary: r.summary ?? '',
          badges: (r.badges as string[]) ?? [],
          icon: r.icon_url ?? undefined,
          links: (r.links as Project['links']) ?? [],
          featuredIn: (r.featured_in as { label: string; href: string }[]) ?? [],
          tags: (r.tags as string[]) ?? [],
          videoUrl: r.video_url ?? undefined,
        }))
      }
    } catch {
      /* fall through */
    }
  }

  const list = pick(live, (await readContent()).projects, PLACEHOLDER_PROJECT_DETAILS)
  return limit ? list.slice(0, limit) : list
}

export async function getProjectStack(): Promise<ProjectStackRow[]> {
  let live: ProjectStackRow[] | null = null

  if (await hasLiveData()) {
    try {
      const { data, error } = await admin()
        .from('project_stack')
        .select('*')
        .eq('published', true)
        .order('sort_order')
      if (!error && data) live = data as ProjectStackRow[]
    } catch {
      /* fall through */
    }
  }

  return pick(live, (await readContent()).projectStack, PLACEHOLDER_PROJECT_STACK)
}

/* ---- experience ----------------------------------------------------------- */

export async function getExperienceOrgs(): Promise<ExperienceOrg[]> {
  let live: ExperienceOrg[] | null = null

  if (await hasLiveData()) {
    try {
      const { data: orgs, error } = await admin()
        .from('experience_orgs')
        .select('*')
        .eq('published', true)
        .order('sort_order')

      if (!error && orgs) {
        const { data: roles } = await admin().from('experience_roles').select('*').order('sort_order')
        live = orgs.map((o) => ({
          id: o.id,
          monogram: o.monogram ?? '',
          name: o.name,
          employment: o.employment ?? '',
          meta: o.meta ?? '',
          location: o.location ?? '',
          roles: (roles ?? [])
            .filter((r) => r.org_id === o.id)
            .map((r) => ({
              id: r.id,
              period: r.period ?? '',
              title: r.title,
              summary: r.summary ?? '',
              bullets: (r.bullets as string[]) ?? [],
            })),
        }))
      }
    } catch {
      /* fall through */
    }
  }

  return pick(live, (await readContent()).experienceOrgs, PLACEHOLDER_EXPERIENCE_ORGS)
}

export async function getExperienceEntries(limit = 4): Promise<ExperienceEntry[]> {
  const orgs = await getExperienceOrgs()
  return orgs
    .flatMap((o) => o.roles.map((r) => ({ id: r.id, period: r.period, role: r.title, org: o.name })))
    .slice(0, limit)
}

/* ---- skills --------------------------------------------------------------- */

export async function getStackGroups(): Promise<StackGroup[]> {
  let live: StackGroup[] | null = null

  if (await hasLiveData()) {
    try {
      const { data: groups, error } = await admin().from('skill_groups').select('*').order('sort_order')
      if (!error && groups) {
        const { data: skills } = await admin()
          .from('skills')
          .select('*')
          .eq('published', true)
          .order('sort_order')
        live = groups.map((g) => ({
          id: g.id,
          title: g.title,
          items: (skills ?? []).filter((s) => s.group_id === g.id).map((s) => s.name),
        }))
      }
    } catch {
      /* fall through */
    }
  }

  return pick(live, (await readContent()).skillGroups, PLACEHOLDER_STACK_GROUPS)
}

export async function getStackChips(limit = 10): Promise<string[]> {
  const groups = await getStackGroups()
  const chips = groups.flatMap((g) => g.items)
  return chips.length ? chips.slice(0, limit) : PLACEHOLDER_STACK.slice(0, limit)
}

/* ---- certifications / affiliations ---------------------------------------- */

export async function getCertifications(): Promise<Cert[]> {
  let live: Cert[] | null = null

  if (await hasLiveData()) {
    try {
      const { data, error } = await admin()
        .from('certifications')
        .select('*')
        .eq('published', true)
        .order('sort_order')
      if (!error && data) {
        live = data.map((c) => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer ?? '',
          logo: c.logo_url ?? undefined,
          verifyUrl: c.verify_url ?? undefined,
        }))
      }
    } catch {
      /* fall through */
    }
  }

  return pick(live, (await readContent()).certifications, PLACEHOLDER_CERTS)
}

export async function getAffiliations(): Promise<Affiliation[]> {
  let live: Affiliation[] | null = null

  if (await hasLiveData()) {
    try {
      const { data, error } = await admin()
        .from('affiliations')
        .select('*')
        .eq('published', true)
        .order('sort_order')
      if (!error && data) {
        live = data.map((a) => ({
          id: a.id,
          name: a.name,
          role: a.role ?? '',
          logo: a.logo_url ?? undefined,
          emoji: a.emoji ?? undefined,
          href: a.href ?? '#',
        }))
      }
    } catch {
      /* fall through */
    }
  }

  return pick(live, (await readContent()).affiliations, PLACEHOLDER_AFFILIATIONS)
}

/* ---- posts ---------------------------------------------------------------- */

export async function getPosts(limit?: number): Promise<Post[]> {
  let live: Post[] | null = null

  if (await hasLiveData()) {
    try {
      let q = admin().from('posts').select('*').eq('published', true).order('published_at', { ascending: false })
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (!error && data) {
        live = data.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt ?? '',
          date: new Date(p.published_at).toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
          }),
          readMinutes: p.read_minutes ?? 1,
          body: p.body ?? '',
          cover: p.cover_url ?? undefined,
          tags: (p.tags as string[]) ?? [],
        }))
      }
    } catch {
      /* fall through */
    }
  }

  const list = pick(live, (await readContent()).posts, PLACEHOLDER_POSTS)
  return limit ? list.slice(0, limit) : list
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await getPosts()
  return posts.find((p) => p.slug === slug) ?? null
}

/* ---- resources ------------------------------------------------------------ */

export async function getResourceGroups(): Promise<ResourceGroup[]> {
  let live: ResourceGroup[] | null = null

  if (await hasLiveData()) {
    try {
      const { data: groups, error } = await admin().from('resource_groups').select('*').order('sort_order')
      if (!error && groups) {
        const { data: links } = await admin().from('resources').select('*').order('sort_order')
        live = groups.map((g) => ({
          id: g.id,
          title: g.title,
          links: (links ?? [])
            .filter((l) => l.group_id === g.id)
            .map((l) => ({ id: l.id, title: l.title, href: l.href, description: l.description ?? '' })),
        }))
      }
    } catch {
      /* fall through */
    }
  }

  return pick(live, (await readContent()).resources, PLACEHOLDER_RESOURCE_GROUPS)
}

export async function getPlaceholderProjects(): Promise<ProjectDetail[]> {
  return PLACEHOLDER_PROJECT_DETAILS
}