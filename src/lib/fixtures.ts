import { NAV } from '@/lib/nav'
import type { Affiliation, Cert, ExperienceEntry, Post, Profile, Project } from '@/lib/types'

/**
 * Placeholder content used until Supabase is wired (Phase 4, steps 4–10).
 * Every placeholder value is bracketed and carries `placeholder: true`,
 * so a final audit is a single grep for `data-placeholder`.
 */

export const PROFILE: Profile = {
  name: 'Emmanuel Joshua Felipe',
  tagline: 'Data Analyst & Data Engineer',
  description:
    'Emmanuel Joshua Felipe — aspiring data analyst and data engineer. Projects, notes and resources.',
  paragraphs: [
    '[Hero paragraph 1 — one sentence on what you analyse and build]',
    '[Hero paragraph 2 — what you are learning and looking for]',
  ],
  email: '[EMAIL]',
  socials: [
    { label: 'github', href: '[GITHUB_URL]' },
    { label: 'linkedin', href: '[LINKEDIN_URL]' },
    { label: 'email', href: '[EMAIL]' },
  ],
  githubUsername: '[GITHUB_USERNAME]',
}

export const NAV_GROUPS = NAV

export const PLACEHOLDER_POSTS: Post[] = [
  {
    id: 'p1',
    slug: 'post-one',
    title: '[Post title — placeholder]',
    excerpt: '[One-sentence excerpt shown under the title, truncated to one line.]',
    date: 'Jan 2026',
    placeholder: true,
  },
  {
    id: 'p2',
    slug: 'post-two',
    title: '[Post title — placeholder]',
    excerpt: '[One-sentence excerpt shown under the title, truncated to one line.]',
    date: 'Jan 2026',
    placeholder: true,
  },
  {
    id: 'p3',
    slug: 'post-three',
    title: '[Post title — placeholder]',
    excerpt: '[One-sentence excerpt shown under the title, truncated to one line.]',
    date: 'Jan 2026',
    placeholder: true,
  },
]

export const PLACEHOLDER_PROJECTS: Project[] = [
  {
    id: 'pr1',
    title: '[Project name — placeholder]',
    summary: '[One sentence: what the project does and what it proved.]',
    badges: ['[Primary badge]', 'Secondary badge', 'Third badge'],
    links: [],
  },
  {
    id: 'pr2',
    title: '[Project name — placeholder]',
    summary: '[One sentence: what the project does and what it proved.]',
    badges: ['[Primary badge]'],
    links: [],
  },
  {
    id: 'pr3',
    title: '[Project name — placeholder]',
    summary: '[One sentence: what the project does and what it proved.]',
    badges: ['[Primary badge]'],
    links: [],
  },
]

export const PLACEHOLDER_EXPERIENCE: ExperienceEntry[] = [
  { id: 'e1', period: '[Year]', role: '[Role — placeholder]', org: '[Organisation — placeholder]' },
  { id: 'e2', period: '[Year]', role: '[Role — placeholder]', org: '[Organisation — placeholder]' },
  { id: 'e3', period: '[Year]', role: '[Role — placeholder]', org: '[Organisation — placeholder]' },
  { id: 'e4', period: '[Year]', role: '[Role — placeholder]', org: '[Organisation — placeholder]' },
]

export const PLACEHOLDER_STACK: string[] = [
  'Python', 'SQL', 'PostgreSQL', 'dbt', 'pandas',
  'Power BI', 'Tableau', 'Airflow', 'Docker', 'Git',
]

export const PLACEHOLDER_CERTS: Cert[] = [
  { id: 'c1', name: '[Certification name]', issuer: 'Issuer' },
  { id: 'c2', name: '[Certification name]', issuer: 'Issuer' },
  { id: 'c3', name: '[Certification name]', issuer: 'Issuer' },
]

export const PLACEHOLDER_AFFILIATIONS: Affiliation[] = [
  { id: 'a1', name: '[Organisation]', role: 'Member', emoji: '🏛️', href: '#' },
  { id: 'a2', name: '[Organisation]', role: 'Member', emoji: '📊', href: '#' },
  { id: 'a3', name: '[Organisation]', role: 'Member', emoji: '🎓', href: '#' },
]
