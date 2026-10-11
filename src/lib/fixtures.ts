import { NAV } from '@/lib/nav'
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
} from '@/lib/types'

/**
 * Placeholder content used until Supabase is wired (Phase 7).
 * Every placeholder value is bracketed and carries `placeholder: true`,
 * so a final audit is a single grep for `data-placeholder`.
 *
 * ⚠️ Nothing here is a real claim. Replace with your own before publishing.
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

/**
 * Fallback returned by `getProfile()` when Supabase has no profile row yet.
 * Aliased to PROFILE so the homepage components and the data layer agree.
 */
export const PLACEHOLDER_PROFILE_FALLBACK: Profile = PROFILE

/* ---- homepage ----------------------------------------------------------- */

export const PLACEHOLDER_POSTS: Post[] = [
  {
    id: 'p1',
    slug: 'post-one',
    title: '[Post title — placeholder]',
    excerpt: '[One-sentence excerpt shown under the title, truncated to one line.]',
    date: 'Jan 2026',
    readMinutes: 4,
    body: '[Post body — placeholder]',
    placeholder: true,
  },
  {
    id: 'p2',
    slug: 'post-two',
    title: '[Post title — placeholder]',
    excerpt: '[One-sentence excerpt shown under the title, truncated to one line.]',
    date: 'Jan 2026',
    readMinutes: 4,
    body: '[Post body — placeholder]',
    placeholder: true,
  },
  {
    id: 'p3',
    slug: 'post-three',
    title: '[Post title — placeholder]',
    excerpt: '[One-sentence excerpt shown under the title, truncated to one line.]',
    date: 'Jan 2026',
    readMinutes: 4,
    body: '[Post body — placeholder]',
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

/* ---- /projects ---------------------------------------------------------- */

export const PLACEHOLDER_PROJECT_DETAILS: ProjectDetail[] = [
  {
    ...PLACEHOLDER_PROJECTS[0],
    featuredIn: [
      { label: '[Publication name]', href: '#' },
      { label: '[Publication name]', href: '#' },
    ],
  },
  { ...PLACEHOLDER_PROJECTS[1], featuredIn: [] },
  { ...PLACEHOLDER_PROJECTS[2], featuredIn: [] },
]

export const PLACEHOLDER_PROJECT_STACK: ProjectStackRow[] = [
  { id: 'ps1', name: '[Project]', href: '#', category: '[Category]', description: '[One sentence.]' },
  { id: 'ps2', name: '[Project]', href: '#', category: '[Category]', description: '[One sentence.]' },
  { id: 'ps3', name: '[Project]', href: '#', category: '[Category]', description: '[One sentence.]' },
  { id: 'ps4', name: '[Project]', href: '#', category: '[Category]', description: '[One sentence.]' },
  { id: 'ps5', name: '[Project]', href: '#', category: '[Category]', description: '[One sentence.]' },
  { id: 'ps6', name: '[Project]', href: '#', category: '[Category]', description: '[One sentence.]' },
]

/* ---- /experience -------------------------------------------------------- */

export const PLACEHOLDER_EXPERIENCE_ORGS: ExperienceOrg[] = [
  {
    id: 'eo1',
    monogram: '[X]',
    name: '[Organisation — placeholder]',
    employment: '[Employment type]',
    meta: '[Duration]',
    location: '[Location · Work mode]',
    roles: [
      {
        id: 'er1',
        period: '[Period]',
        title: '[Role title]',
        summary: '[One sentence on what you did.]',
        bullets: ['[Achievement — keep it measurable]', '[Achievement]'],
      },
    ],
  },
  {
    id: 'eo2',
    monogram: '[Y]',
    name: '[Organisation — placeholder]',
    employment: '[Employment type]',
    meta: '[Duration]',
    location: '[Location · Work mode]',
    roles: [
      {
        id: 'er2',
        period: '[Period]',
        title: '[Role title]',
        summary: '[One sentence on what you did.]',
      },
    ],
  },
  {
    id: 'eo3',
    monogram: '[Z]',
    name: '[Organisation — placeholder]',
    employment: '[Education]',
    meta: '[Duration]',
    location: '[Institution]',
    roles: [
      {
        id: 'er3',
        period: '[Period]',
        title: '[Course or programme]',
        summary: '[One sentence.]',
      },
    ],
  },
]

/* ---- /stack ------------------------------------------------------------- */

export const PLACEHOLDER_STACK_GROUPS: StackGroup[] = [
  {
    id: 'langs',
    title: 'Languages & Query',
    items: ['Python', 'SQL', 'JavaScript', 'TypeScript', 'Bash'],
  },
  {
    id: 'data',
    title: 'Data & Modelling',
    items: ['PostgreSQL', 'MySQL', 'dbt', 'pandas', 'NumPy', 'scikit-learn'],
  },
  {
    id: 'bi',
    title: 'Analytics & BI',
    items: ['Power BI', 'Tableau', 'Looker Studio', 'Excel', 'Google Sheets'],
  },
  {
    id: 'pipeline',
    title: 'Pipelines & Infrastructure',
    items: ['Airflow', 'dbt Cloud', 'Docker', 'Git', 'GitHub Actions', 'Linux'],
  },
  {
    id: 'cloud',
    title: 'Cloud & Tools',
    items: ['Google BigQuery', 'Supabase', 'Vercel', 'Figma', 'Notion'],
  },
]

/* ---- /resources --------------------------------------------------------- */

export const PLACEHOLDER_RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: 'sql',
    title: 'SQL',
    links: [
      { id: 'r1', title: '[Resource]', href: '#', description: '[Why it is useful.]' },
      { id: 'r2', title: '[Resource]', href: '#', description: '[Why it is useful.]' },
      { id: 'r3', title: '[Resource]', href: '#', description: '[Why it is useful.]' },
    ],
  },
  {
    id: 'python',
    title: 'Python & Analytics',
    links: [
      { id: 'r4', title: '[Resource]', href: '#', description: '[Why it is useful.]' },
      { id: 'r5', title: '[Resource]', href: '#', description: '[Why it is useful.]' },
    ],
  },
  {
    id: 'bi',
    title: 'Dashboards & BI',
    links: [
      { id: 'r6', title: '[Resource]', href: '#', description: '[Why it is useful.]' },
    ],
  },
]

/* ---- /contact ----------------------------------------------------------- */

export const CONTACT_BUDGET_OPTIONS = [
  '[Budget range — placeholder]',
  'Under 1 hour',
  'A few days',
  'A couple of weeks',
  'Ongoing',
]

export const CONTACT_TIMELINE_OPTIONS = [
  '[Timeline — placeholder]',
  'ASAP',
  'Within a month',
  'Just exploring',
]

export const EMPTY_CONTACT_MESSAGE: ContactMessage = {
  name: '',
  email: '',
  organisation: '',
  role: '',
  budget: CONTACT_BUDGET_OPTIONS[0],
  timeline: CONTACT_TIMELINE_OPTIONS[0],
  details: '',
}
