'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/primitives/Icon'
import { GUIDE_HOOK } from '@/lib/guide'
import type { NavGroup } from '@/lib/nav'

/**
 * Renders one nav group. The reference marks the active page by indenting it
 * (`pl-6`) rather than recolouring — keep that, it is a distinctive detail.
 */
export function NavLinks({
  group,
  variant,
}: {
  group: NavGroup
  variant: 'desktop' | 'mobile'
}) {
  const pathname = usePathname()

  const isDesktop = variant === 'desktop'
  const base = isDesktop
    ? 'relative inline-flex w-fit items-center gap-2.5 text-gray-500 hover:text-ink'
    : 'relative inline-flex w-fit items-center gap-3 text-gray-700 hover:text-ink'

  return (
    <>
      {group.links.map((link) => {
        const active =
          link.href === '/' ? pathname === '/' : pathname === link.href || pathname.startsWith(`${link.href}/`)

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`${base}${active ? ' pl-6' : ''}`}
            data-guide={GUIDE_HOOK[link.href]}
          >
            {link.icon && <Icon name={link.icon} className="h-[1.15em] w-[1.15em] shrink-0" />}
            {link.label}
          </Link>
        )
      })}
    </>
  )
}
