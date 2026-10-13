'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminIcon, type AdminIconName } from './icons'

export type AdminNavItem = {
  href: string
  label: string
  icon: AdminIconName
  /** Overrides the badge count when the layout already has a better number. */
  badge?: number
}

/**
 * Admin sidebar.
 *
 * A client component for one reason: marking the active page. The server
 * layout cannot know the current path, and an admin with no "you are here"
 * indicator is genuinely hard to navigate once you are inside a record.
 *
 * On narrow screens it becomes a horizontal scroller rather than a sidebar —
 * the previous fixed `w-44` column squeezed the editor to nothing on a phone.
 */
export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav aria-label="Admin sections" className="lg:w-52 lg:shrink-0">
      {/* mobile: horizontal rail */}
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:sticky lg:top-[4.5rem] lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
        {items.map((item) => {
          const active = isActive(item.href)
          return (
            <li key={item.href} className="shrink-0 lg:shrink">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                title={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] whitespace-nowrap transition ${
                  active
                    ? 'bg-white font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-gray-200'
                    : 'text-gray-500 hover:bg-white/60 hover:text-ink'
                }`}
              >
                <AdminIcon
                  name={item.icon}
                  className={`h-4 w-4 ${active ? 'text-ink' : 'text-gray-400'}`}
                />
                {item.label}
                {item.badge ? (
                  <span className="ml-auto rounded-full bg-red-600 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}