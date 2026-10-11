'use client'

import { useEffect, useRef } from 'react'
import { NAV } from '@/lib/nav'
import { PROFILE } from '@/lib/fixtures'
import { NavLinks } from './NavLinks'
import { ThemeSwitch } from './ThemeSwitch'
import { PresenceBlock } from './PresenceBlock'
import { Icon } from '@/components/primitives/Icon'

/** Spec §4.3. Group stagger: 0.05 / 0.11 / 0.17 / 0.23s. */
const DELAYS = ['0.05s', '0.11s', '0.17s', '0.23s']

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      id="mobileNav"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={`fixed inset-0 z-[60] flex-col bg-white lg:hidden ${open ? 'is-open flex' : 'hidden'}`}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
        <a href="/" className="font-pixel text-[14px]">
          {PROFILE.name}
        </a>
        <button type="button" onClick={onClose} aria-label="Close menu" className="-mr-1 p-1 text-gray-700 hover:text-ink">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-7 py-8 font-mono text-[16px]">
        <div className="mnav-group flex flex-col gap-4" style={{ transitionDelay: DELAYS[0] }}>
          <NavLinks group={{ id: 'home', links: [{ href: '/', label: 'Home' }] }} variant="mobile" />
        </div>

        <div className="my-5 h-px bg-gray-200" />

        {NAV.map((group, i) => (
          <div key={group.id}>
            <div className="mnav-group flex flex-col gap-4" style={{ transitionDelay: DELAYS[i + 1] ?? DELAYS[3] }}>
              <NavLinks group={group} variant="mobile" />
            </div>
            {i < NAV.length - 1 && <div className="my-5 h-px bg-gray-200" />}
          </div>
        ))}

        <div className="my-5 h-px bg-gray-200" />

        <div className="mnav-group flex flex-col gap-5" style={{ transitionDelay: DELAYS[3] }}>
          <PresenceBlock
            className="-mt-1 border-y border-gray-200 py-4"
            labelClass="mt-1 text-[11.5px] text-gray-400"
            chatClass="mt-3.5 text-[14px] text-gray-600"
            iconClass="h-5 w-5"
          />

          <div>
            <div className="mb-4 flex items-center gap-2">
              <ThemeSwitch />
            </div>
            <p className="text-[12px] leading-relaxed text-gray-400">
              For work, collabs &amp; everything else, reach me at
            </p>
            <a
              href={`mailto:${PROFILE.email}`}
              className="mt-1.5 inline-flex w-fit items-center gap-2 text-[14px] text-ink hover:text-gray-500"
            >
              <Icon name="mail" className="h-[1.15em] w-[1.15em] shrink-0" />
              {PROFILE.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
