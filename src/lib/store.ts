import { promises as fs } from 'node:fs'
import path from 'node:path'
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
  ContactMessage,
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
 * Local JSON content store.
 *
 * Lets the admin dashboard work with no database and no external account.
 * Read order is: Supabase -> this file -> fixtures, so the site always has
 * content and Supabase can be switched on later without changing any component.
 *
 * ⚠️ This writes to the local filesystem. That works in `npm run dev` but NOT
 * on Vercel, where the filesystem is read-only. Supabase remains the real
 * target for deployment — see README "Storage backends".
 */

const FILE = path.join(process.cwd(), 'content', 'content.json')

export type Content = {
  profile: Profile
  projects: ProjectDetail[]
  projectStack: ProjectStackRow[]
  experienceOrgs: ExperienceOrg[]
  experienceEntries: ExperienceEntry[]
  skills: string[]
  skillGroups: StackGroup[]
  certifications: Cert[]
  affiliations: Affiliation[]
  posts: Post[]
  resources: ResourceGroup[]
  messages: (ContactMessage & { id: string; is_read: boolean; created_at: string })[]
}

/** Seed used the first time the store is written. */
export function seedContent(): Content {
  return {
    profile: PLACEHOLDER_PROFILE_FALLBACK,
    projects: PLACEHOLDER_PROJECT_DETAILS,
    projectStack: PLACEHOLDER_PROJECT_STACK,
    experienceOrgs: PLACEHOLDER_EXPERIENCE_ORGS,
    experienceEntries: PLACEHOLDER_EXPERIENCE,
    skills: PLACEHOLDER_STACK,
    skillGroups: PLACEHOLDER_STACK_GROUPS,
    certifications: PLACEHOLDER_CERTS,
    affiliations: PLACEHOLDER_AFFILIATIONS,
    posts: PLACEHOLDER_POSTS,
    resources: PLACEHOLDER_RESOURCE_GROUPS,
    messages: [],
  }
}

let cache: Content | null = null

/** Read the store, creating it from the fixtures on first run. */
export async function readContent(): Promise<Content> {
  if (cache) return cache

  try {
    const raw = await fs.readFile(FILE, 'utf8')
    cache = { ...seedContent(), ...(JSON.parse(raw) as Partial<Content>) }
  } catch {
    cache = seedContent()
  }
  return cache
}

/**
 * Merge a patch and persist. Writes are best-effort: on a read-only filesystem
 * the in-memory copy still updates, so the session stays coherent.
 */
export async function writeContent(patch: Partial<Content>): Promise<Content> {
  const current = await readContent()
  const next = { ...current, ...patch }
  cache = next

  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true })
    await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8')
  } catch {
    // Read-only filesystem (e.g. Vercel). Keep the in-memory state and move on.
  }

  return next
}

/** Only for tests. */
export function resetCache() {
  cache = null
}
