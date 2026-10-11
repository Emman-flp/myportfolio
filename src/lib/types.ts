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

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  date: string
  placeholder?: boolean
}

export type ProjectLink = {
  label: string
  image: string
  href: string
}

export type Project = {
  id: string
  title: string
  summary: string
  badges: string[]
  icon?: string
  links: ProjectLink[]
}

export type ExperienceEntry = {
  id: string
  period: string
  role: string
  org: string
  href?: string
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
