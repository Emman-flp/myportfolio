'use client'

import { useEffect } from 'react'
import { ShortcutHint } from '@/components/overlays/OverlayHost'

/**
 * Sidebar "Ask anything" and "Typing test" buttons (spec §4.1).
 *
 * The overlays themselves live in `OverlayHost`, which owns their open state.
 * These buttons only need to raise an event the host listens for, so the server
 * component `SidebarNav` can stay a server component.
 */

export const OVERLAY_EVENT = 'portfolio:open-overlay'

export function OverlayTriggers() {
  useEffect(() => {
    // keep module import side-effect-free; the host does the listening
  }, [])

  const fire = (which: 'ask' | 'typing') => {
    window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, { detail: which }))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => fire('ask')}
        className="mt-6 inline-flex w-fit items-center gap-2 text-[12px] text-gray-400 hover:text-ink"
      >
        <span>Ask anything</span>
        <ShortcutHint combo="K" />
      </button>

      <button
        type="button"
        onClick={() => fire('typing')}
        className="mt-2.5 inline-flex w-fit items-center gap-2 text-[12px] text-gray-400 hover:text-ink"
      >
        <span>Typing test</span>
        <ShortcutHint combo="J" />
      </button>
    </>
  )
}
