/**
 * Single source of truth for navigation.
 * Drives the sidebar, the mobile drawer, and the tour targets.
 *
 * Deviation #3 from the reference (UI-SPECIFICATION.md §11): the reference's
 * groups were explore -> offer -> about. These are build -> learning -> connect,
 * which fits a data portfolio. The three-group layout, the `h-px` rules, and the
 * `pl-6` active indent are all preserved.
 */

export type NavIcon = 'book' | 'mail' | 'monitor' | 'people' | 'briefcase' | 'box'

export type NavLink = {
  href: string
  label: string
  icon?: NavIcon
}

export type NavGroup = {
  id: string
  links: NavLink[]
}

export const NAV: NavGroup[] = [
  {
    id: 'build',
    links: [
      { href: '/projects', label: 'Projects' },
      { href: '/experience', label: 'Experience' },
      { href: '/stack', label: 'Stack' },
    ],
  },
  {
    id: 'learning',
    links: [
      { href: '/certifications', label: 'Certifications' },
      { href: '/resources', label: 'Resources', icon: 'book' },
    ],
  },
  {
    id: 'connect',
    links: [
      { href: '/affiliations', label: 'Affiliations' },
      { href: '/contact', label: 'Contact', icon: 'mail' },
    ],
  },
]

export const BLOG_LINK: NavLink = { href: '/blog', label: 'Blog' }
