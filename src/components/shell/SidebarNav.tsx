import { Fragment } from 'react'
import { Icon } from '@/components/primitives/Icon'
import { ThemeSwitch } from './ThemeSwitch'
import { PresenceBlock } from './PresenceBlock'
import { OverlayTriggers } from './OverlayTriggers'
import { NAV } from '@/lib/nav'
import { PROFILE } from '@/lib/fixtures'
import { NavLinks } from './NavLinks'

/**
 * Fixed left sidebar, lg only. Spec §4.1.
 * w-56 (224px) — main compensates with lg:pl-56.
 *
 * Every flex child is `shrink-0` except the link stack, which is the one
 * element allowed to scroll (that is the reference's design: `overflow-y-auto`).
 */
export function SidebarNav() {
  const homeGroup = { id: 'home', links: [{ href: '/', label: 'Home' }] }

  return (
    <nav
      data-guide="sidebar"
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-gray-200 bg-white px-7 py-8 lg:flex"
    >
      <a
        href="/"
        className="shrink-0 font-pixel text-[15px] leading-none hover:opacity-60"
        data-guide="name"
      >
        {PROFILE.name}
      </a>

      <div className="mt-9 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto font-mono text-[13px]">
        <div className="flex shrink-0 flex-col gap-2.5">
          <NavLinks group={homeGroup} variant="desktop" />
        </div>

        <div className="h-px shrink-0 bg-gray-200" />

        {NAV.map((group, i) => (
          <Fragment key={group.id}>
            <div className="flex shrink-0 flex-col gap-2.5">
              <NavLinks group={group} variant="desktop" />
            </div>
            {i < NAV.length - 1 && <div className="h-px shrink-0 bg-gray-200" />}
          </Fragment>
        ))}
      </div>

      <PresenceBlock
        className="mt-4 border-y border-gray-200 py-3.5"
        chatClass="mt-3.5 font-mono text-[12px] text-gray-500"
        iconClass="h-4 w-4"
      />

      <OverlayTriggers />

      <div className="mt-6 shrink-0">
        <div className="mb-4 flex items-center gap-2">
          <ThemeSwitch />
        </div>
        <p className="text-[12px] leading-relaxed text-gray-400">
          For work, collabs &amp; everything else, reach me at
        </p>
        <a
          href={`mailto:${PROFILE.email}`}
          data-guide="email"
          className="mt-1.5 inline-flex w-fit items-center gap-2 font-mono text-[13px] text-ink hover:text-gray-500"
        >
          <Icon name="mail" className="h-[1.15em] w-[1.15em] shrink-0" />
          {PROFILE.email}
        </a>
      </div>
    </nav>
  )
}
