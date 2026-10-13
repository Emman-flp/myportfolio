'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { HalftoneBackdrop } from '@/components/primitives/HalftoneBackdrop'
import { SidebarNav } from './SidebarNav'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import { SiteFooter } from './SiteFooter'
import { OverlayHost } from '@/components/overlays/OverlayHost'
import { GuideTour } from '@/components/overlays/GuideTour'
import { GUIDE_NAME } from '@/lib/guide'

/** The reference tags its guide with the owner's first name. */

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // /admin has its own layout and must not inherit the portfolio chrome.
  if (pathname.startsWith('/admin')) return <>{children}</>

  return (
    <>
      {/* ADDITION (spec §7): the reference has no skip link. WCAG 2.4.1 requires one. */}
      <a href="#top" className="skip-link">
        Skip to content
      </a>

      <HalftoneBackdrop />
      <SidebarNav />
      <MobileHeader onOpen={() => setDrawerOpen(true)} />
      <MobileNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <OverlayHost />
      <GuideTour name={GUIDE_NAME} />

      {children}

      <SiteFooter />
    </>
  )
}
