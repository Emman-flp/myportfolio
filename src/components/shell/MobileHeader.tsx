'use client'

import { PROFILE } from '@/lib/fixtures'

/** Spec §4.2. Measured height 53px. lg only hides this in CSS. */
export function MobileHeader({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/90 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <a href="/" className="font-pixel text-[14px]">
          {PROFILE.name}
        </a>
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open menu"
          className="-mr-1 p-1 text-gray-700 hover:text-ink"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
