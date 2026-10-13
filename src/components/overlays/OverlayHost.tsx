'use client'

import { useCallback, useEffect, useState } from 'react'
import { AskOverlay } from './AskOverlay'
import { TypingTest } from './TypingTest'

type Overlay = 'ask' | 'typing' | null

/**
 * Overlay host.
 *
 * Owns which overlay is open and binds the shortcuts. Mounted once in the shell
 * so the overlays survive client-side navigation.
 *
 * Shortcut modifiers follow the platform: Cmd on macOS, Alt elsewhere — the
 * reference does the same and swaps the kbd hint text to match.
 */

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

export function OverlayHost() {
  const [overlay, setOverlay] = useState<Overlay>(null)

  const open = useCallback((which: Exclude<Overlay, null>) => setOverlay(which), [])
  const close = useCallback(() => setOverlay(null), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.altKey
      if (!mod || e.ctrlKey) return

      if (e.code === 'KeyK') {
        e.preventDefault()
        setOverlay((o) => (o === 'ask' ? null : 'ask'))
      }
      if (e.code === 'KeyJ') {
        e.preventDefault()
        setOverlay((o) => (o === 'typing' ? null : 'typing'))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* Esc closes whatever is open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  /* Sidebar buttons dispatch this rather than sharing state across the
     server/client boundary. */
  useEffect(() => {
    const onOpen = (e: Event) => {
      const which = (e as CustomEvent<'ask' | 'typing'>).detail
      if (which === 'ask' || which === 'typing') setOverlay(which)
    }
    window.addEventListener('portfolio:open-overlay', onOpen)
    return () => window.removeEventListener('portfolio:open-overlay', onOpen)
  }, [])

  return (
    <>
      <AskOverlay open={overlay === 'ask'} onClose={close} />
      <TypingTest open={overlay === 'typing'} onClose={close} />
    </>
  )
}

/** Keyboard-hint chip, shown next to the sidebar buttons. */
export function ShortcutHint({ combo }: { combo: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="ask-mod-key rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-gray-500">
        {isMac ? '⌘' : 'Alt'}
      </kbd>
      <span className="font-mono text-[10px] text-gray-400">+</span>
      <kbd className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-gray-500">
        {combo}
      </kbd>
    </span>
  )
}

/** Bridge so the server-rendered sidebar can trigger the overlays. */
export function useOverlay() {
  const [overlay, setOverlay] = useState<Overlay>(null)
  return {
    overlay,
    open,
    close,
    trigger: (which: Exclude<Overlay, null>) => setOverlay(which),
  }
}
