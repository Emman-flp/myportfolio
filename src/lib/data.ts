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
 * Read helpers.
 *
 * Every function degrades to the placeholder fixtures when Supabase is missing,
 * unreachable, or simply has no rows yet. The public UI therefore always renders
 * in its real shape rather than erroring — which is also why the site still
 * works today with invalid keys in `.env.local`.
 *
 * `source` is exposed so the admin UI can tell you whether you are looking at
 * live data or placeholders.
 */

let liveCache: boolean | null = null

/** True once a query has actually succeeded against Supabase. */
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

/** Only for tests / after changing keys — clears the probe cache. */
export function resetProbe() {
  liveCache = null
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isConfigured()) return fallback
  try {
    return await fn()
  } catch {
    return fallback
  }
}

/* ---- profile -------------------------------------------------------------- */

export async function getProfile(): Promise<Profile> {
  return safe(async () => {
    const { data, error } = await admin().from('profile').select('*').limit(1).maybeSingle()
    if (error || !data) return PLACEHOLDER_PROFILE_FALLBACK

    return {
      name: data.name,
      tagline: data.tagline ?? '',
      description: data.description ?? '',
      paragraphs: (data.paragraphs as string[]) ?? [],
      email: data.email ?? '',
      socials: (data.socials as Profile['socials']) ?? [],
      githubUsername: data.github_username ?? '',
    }
  }, PLACEHOLDER_PROFILE_FALLBACK)
}

/* ---- projects ------------------------------------------------------------- */

export async function getProjects(limit?: number): Promise<ProjectDetail[]> {
  return safe(async () => {
    let q = admin()
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('sort_order')
    if (limit) q = q.limit(limit)

    const { data, error } = await q
    if (error || !data?.length) return PLACEHOLDER_PROJECT_DETAILS

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
  }, limit ? PLACEHOLDER_PROJECTS : PLACEHOLDER_PROJECT_DETAILS)
}

export async function getProjectStack(): Promise<ProjectStackRow[]> {
  return safe(async () => {
    const { data, error } = await admin().from('project_stack').select('*').order('sort_order')
    if (error || !data?.length) return PLACEHOLDER_PROJECT_STACK
    return data as ProjectStackRow[]
  }, PLACEHOLDER_PROJECT_STACK)
}

/* ---- experience ----------------------------------------------------------- */

export async function getExperienceOrgs(): Promise<ExperienceOrg[]> {
  return safe(async () => {
    const { data: orgs, error } = await admin()
      .from('experience_orgs')
      .select('*')
      .eq('published', true)
      .order('sort_order')

    if (error || !orgs?.length) return PLACEHOLDER_EXPERIENCE_ORGS

    const { data: roles } = await admin()
      .from('experience_roles')
      .select('*')
      .order('sort_order')

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
  }, PLACEHOLDER_EXPERIENCE_ORGS)
}

/** Flattened, newest-first rows for the homepage list. */
export async function getExperienceEntries(limit = 4): Promise<ExperienceEntry[]> {
  const orgs = await getExperienceOrgs()
  if (orgs === PLACEHOLDER_EXPERIENCE_ORGS) return PLACEHOLDER_EXPERIENCE.slice(0, limit)

  return orgs
    .flatMap((o) => o.roles.map((r) => ({ id: r.id, period: r.period, role: r.title, org: o.name })))
    .slice(0, limit)
}

/* ---- skills / stack ------------------------------------------------------- */

export async function getStackGroups(): Promise<StackGroup[]> {
  return safe(async () => {
    const { data: groups, error } = await admin()
      .from('skill_groups')
      .select('*')
      .order('sort_order')

    if (error || !groups?.length) return PLACEHOLDER_STACK_GROUPS

    const { data: skills } = await admin()
      .from('skills')
      .select('*')
      .eq('published', true)
      .order('sort_order')

    return groups.map((g) => ({
      id: g.id,
      title: g.title,
      items: (skills ?? []).filter((s) => s.group_id === g.id).map((s) => s.name),
    }))
  }, PLACEHOLDER_STACK_GROUPS)
}

/** Flat chip list for the homepage, capped so it fills two rows like the reference. */
export async function getStackChips(limit = 10): Promise<string[]> {
  const groups = await getStackGroups()
  if (groups === PLACEHOLDER_STACK_GROUPS) return PLACEHOLDER_STACK.slice(0, limit)
  return groups.flatMap((g) => g.items).slice(0, limit)
}

/* ---- certifications / affiliations ---------------------------------------- */

export async function getCertifications(): Promise<Cert[]> {
  return safe(async () => {
    const { data, error } = await admin()
      .from('certifications')
      .select('*')
      .eq('published', true)
      .order('sort_order')
    if (error || !data?.length) return PLACEHOLDER_CERTS
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer ?? '',
      logo: c.logo_url ?? undefined,
      verifyUrl: c.verify_url ?? undefined,
    }))
  }, PLACEHOLDER_CERTS)
}

export async function getAffiliations(): Promise<Affiliation[]> {
  return safe(async () => {
    const { data, error } = await admin()
      .from('affiliations')
      .select('*')
      .eq('published', true)
      .order('sort_order')
    if (error || !data?.length) return PLACEHOLDER_AFFILIATIONS
    return data.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role ?? '',
      logo: a.logo_url ?? undefined,
      emoji: a.emoji ?? undefined,
      href: a.href ?? '#',
    }))
  }, PLACEHOLDER_AFFILIATIONS)
}

/* ---- posts ---------------------------------------------------------------- */

export async function getPosts(limit?: number): Promise<Post[]> {
  return safe(async () => {
    let q = admin()
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
    if (limit) q = q.limit(limit)

    const { data, error } = await q
    if (error || !data?.length) return PLACEHOLDER_POSTS

    return data.map((p) => ({
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
  }, limit ? PLACEHOLDER_POSTS.slice(0, limit) : PLACEHOLDER_POSTS)
}

export async function getPost(slug: string): Promise<Post | null> {
  const posts = await getPosts()
  return posts.find((p) => p.slug === slug) ?? null
}

/* ---- resources ------------------------------------------------------------ */

export async function getResourceGroups(): Promise<ResourceGroup[]> {
  return safe(async () => {
    const { data: groups, error } = await admin()
      .from('resource_groups')
      .select('*')
      .order('sort_order')
    if (error || !groups?.length) return PLACEHOLDER_RESOURCE_GROUPS

    const { data: links } = await admin().from('resources').select('*').order('sort_order')

    return groups.map((g) => ({
      id: g.id,
      title: g.title,
      links: (links ?? [])
        .filter((l) => l.group_id === g.id)
        .map((l) => ({ id: l.id, title: l.title, href: l.href, description: l.description ?? '' })),
    }))
  }, PLACEHOLDER_RESOURCE_GROUPS)
}
