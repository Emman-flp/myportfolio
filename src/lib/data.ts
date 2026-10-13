import { readContent } from './store'
import { admin, isConfigured } from './supabase/admin'
import {
  PLACEHOLDER_AFFILIATIONS,
  PLACEHOLDER_CERTS,
  PLACEHOLDER_EXPERIENCE,
  PLACEHOLDER_EXPERIENCE_ORGS,
  PLACEHOLDER_POSTS,
  PLACEHOLDER_PROJECTS,
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

/** Which backend is actually serving content right now. */
export async function getSource(): Promise<Source> {
  if (await hasLiveData()) return 'supabase'

  // A local store exists only after the admin has written to it once.
  const { existsSync } = await import('node:fs')
  const path = await import('node:path')
  return existsSync(path.join(process.cwd(), 'content', 'content.json')) ? 'local' : 'fixtures'
}

/* ---- profile -------------------------------------------------------------- */

export async function getProfile(): Promise<Profile> {
  if (await hasLiveData()) {
    try {
      const { data, error } = await admin().from('profile').select('*').limit(1).maybeSingle()
      if (!error && data) {
        return {
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
  return profile ?? PLACEHOLDER_PROFILE_FALLBACK
}

/* ---- projects ------------------------------------------------------------- */

export async function getProjects(limit?: number): Promise<ProjectDetail[]> {
  let list: ProjectDetail[] = PLACEHOLDER_PROJECTS as ProjectDetail[]

  if (await hasLiveData()) {
    try {
      let q = admin().from('projects').select('*').eq('published', true).order('sort_order')
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (!error && data?.length) {
        return data.map((r) => ({
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
  } else {
    list = (await readContent()).projects
  }

  return limit ? list.slice(0, limit) : list
}

export async function getProjectStack(): Promise<ProjectStackRow[]> {
  if (await hasLiveData()) {
    try {
      const { data, error } = await admin().from('project_stack').select('*').eq('published', true).order('sort_order')
      if (!error && data?.length) return data as ProjectStackRow[]
    } catch {
      /* fall through */
    }
  } else {
    const rows = (await readContent()).projectStack
    if (rows?.length) return rows
  }
  return PLACEHOLDER_PROJECT_STACK
}

/* ---- experience ----------------------------------------------------------- */

export async function getExperienceOrgs(): Promise<ExperienceOrg[]> {
  if (await hasLiveData()) {
    try {
      const { data: orgs, error } = await admin()
        .from('experience_orgs')
        .select('*')
        .eq('published', true)
        .order('sort_order')

      if (!error && orgs?.length) {
        const { data: roles } = await admin().from('experience_roles').select('*').order('sort_order')
        return orgs.map((o) => ({
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
  } else {
    const orgs = (await readContent()).experienceOrgs
    if (orgs?.length) return orgs
  }
  return PLACEHOLDER_EXPERIENCE_ORGS
}

export async function getExperienceEntries(limit = 4): Promise<ExperienceEntry[]> {
  const orgs = await getExperienceOrgs()
  if (orgs === PLACEHOLDER_EXPERIENCE_ORGS) return PLACEHOLDER_EXPERIENCE.slice(0, limit)
  return orgs
    .flatMap((o) => o.roles.map((r) => ({ id: r.id, period: r.period, role: r.title, org: o.name })))
    .slice(0, limit)
}

/* ---- skills --------------------------------------------------------------- */

export async function getStackGroups(): Promise<StackGroup[]> {
  if (await hasLiveData()) {
    try {
      const { data: groups, error } = await admin().from('skill_groups').select('*').order('sort_order')
      if (!error && groups?.length) {
        const { data: skills } = await admin().from('skills').select('*').eq('published', true).order('sort_order')
        return groups.map((g) => ({
          id: g.id,
          title: g.title,
          items: (skills ?? []).filter((s) => s.group_id === g.id).map((s) => s.name),
        }))
      }
    } catch {
      /* fall through */
    }
  } else {
    const groups = (await readContent()).skillGroups
    if (groups?.length) return groups
  }
  return PLACEHOLDER_STACK_GROUPS
}

export async function getStackChips(limit = 10): Promise<string[]> {
  const groups = await getStackGroups()
  if (groups === PLACEHOLDER_STACK_GROUPS) return PLACEHOLDER_STACK.slice(0, limit)
  return groups.flatMap((g) => g.items).slice(0, limit)
}

/* ---- certifications / affiliations ---------------------------------------- */

export async function getCertifications(): Promise<Cert[]> {
  if (await hasLiveData()) {
    try {
      const { data, error } = await admin().from('certifications').select('*').eq('published', true).order('sort_order')
      if (!error && data?.length) {
        return data.map((c) => ({
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
  } else {
    const rows = (await readContent()).certifications
    if (rows?.length) return rows
  }
  return PLACEHOLDER_CERTS
}

export async function getAffiliations(): Promise<Affiliation[]> {
  if (await hasLiveData()) {
    try {
      const { data, error } = await admin().from('affiliations').select('*').eq('published', true).order('sort_order')
      if (!error && data?.length) {
        return data.map((a) => ({
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
  } else {
    const rows = (await readContent()).affiliations
    if (rows?.length) return rows
  }
  return PLACEHOLDER_AFFILIATIONS
}

/* ---- posts ---------------------------------------------------------------- */

export async function getPosts(limit?: number): Promise<Post[]> {
  let list: Post[] = PLACEHOLDER_POSTS

  if (await hasLiveData()) {
    try {
      let q = admin().from('posts').select('*').eq('published', true).order('published_at', { ascending: false })
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (!error && data?.length) {
        list = data.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt ?? '',
          date: new Date(p.published_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
          readMinutes: p.read_minutes ?? 1,
          body: p.body ?? '',
          cover: p.cover_url ?? undefined,
          tags: (p.tags as string[]) ?? [],
        }))
      }
    } catch {
      /* fall through */
    }
  } else {
    const rows = (await readContent()).posts
    if (rows?.length) list = rows
  }

  return limit ? list.slice(0, limit) : list
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await getPosts()
  return posts.find((p) => p.slug === slug) ?? null
}

/* ---- resources ------------------------------------------------------------ */

export async function getResourceGroups(): Promise<ResourceGroup[]> {
  if (await hasLiveData()) {
    try {
      const { data: groups, error } = await admin().from('resource_groups').select('*').order('sort_order')
      if (!error && groups?.length) {
        const { data: links } = await admin().from('resources').select('*').order('sort_order')
        return groups.map((g) => ({
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
  } else {
    const groups = (await readContent()).resources
    if (groups?.length) return groups
  }
  return PLACEHOLDER_RESOURCE_GROUPS
}

export async function getPlaceholderProjects(): Promise<ProjectDetail[]> {
  return PLACEHOLDER_PROJECT_DETAILS
}
