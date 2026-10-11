export type Social = {
  label: string
  href: string
}

export type Profile = {
  name: string
  tagline: string
  description: string
  paragraphs: string[]
  email: string
  socials: Social[]
  githubUsername: string
}

export type ProjectLink = {
  label: string
  image: string
  href: string
}

/** Compact project shape used by the homepage deck. */
export type Project = {
  id: string
  title: string
  summary: string
  badges: string[]
  icon?: string
  links: ProjectLink[]
}

/** Full project card used by /projects. */
export type ProjectDetail = Project & {
  featuredIn?: FeaturedLink[]
  tags?: string[]
  videoUrl?: string
}

export type FeaturedLink = { label: string; href: string }

/** A row in the compact "project stack" list at the bottom of /projects. */
export type ProjectStackRow = {
  id: string
  name: string
  href: string
  category: string
  description: string
}

/** Compact experience row used by the homepage. */
export type ExperienceEntry = {
  id: string
  period: string
  role: string
  org: string
  href?: string
}

export type ExperienceRole = {
  id: string
  period: string
  title: string
  summary?: string
  bullets?: string[]
}

/** One employer on the /experience timeline. */
export type ExperienceOrg = {
  id: string
  monogram: string
  name: string
  employment: string
  meta?: string
  location?: string
  roles: ExperienceRole[]
}

export type StackGroup = {
  id: string
  title: string
  items: string[]
}

export type Cert = {
  id: string
  name: string
  issuer: string
  logo?: string
  verifyUrl?: string
}

export type Affiliation = {
  id: string
  name: string
  role: string
  logo?: string
  emoji?: string
  href: string
}

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  readMinutes: number
  body: string
  cover?: string
  tags?: string[]
  placeholder?: boolean
}

export type ResourceLink = {
  id: string
  title: string
  href: string
  description?: string
}

export type ResourceGroup = {
  id: string
  title: string
  links: ResourceLink[]
}

export type ContactMessage = {
  name: string
  email: string
  organisation?: string
  role?: string
  budget?: string
  timeline?: string
  details?: string
}
