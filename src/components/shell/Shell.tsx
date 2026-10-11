'use client'

import { useState } from 'react'
import { HalftoneBackdrop } from '@/components/primitives/HalftoneBackdrop'
import { SidebarNav } from './SidebarNav'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import { SiteFooter } from './SiteFooter'

export function Shell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

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

      {children}

      <SiteFooter />
    </>
  )
}
