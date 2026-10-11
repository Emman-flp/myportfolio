'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolved: 'light' | 'dark'
  /** `ev` is the click origin for the circular View Transition wipe. */
  setTheme: (t: Theme, ev?: React.MouseEvent) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const KEY = 'theme'

function readPref(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' || v === 'light' || v === 'system' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setThemeState(readPref())
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      const root = document.documentElement
      root.classList.toggle('dark', dark)
      setResolved(dark ? 'dark' : 'light')
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  /**
   * Circular wipe from the click point via the View Transitions API,
   * with a coordinated CSS crossfade as the fallback.
   * Spec §6 / Phase 1 §6.
   */
  const setTheme = useCallback((next: Theme, ev?: React.MouseEvent) => {
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* storage unavailable */
    }
    setThemeState(next)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    const goingDark = next === 'dark' || (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const currentlyDark = root.classList.contains('dark')

    if (goingDark === currentlyDark) return

    const apply = () => root.classList.toggle('dark', goingDark)

    if (reduce || !document.startViewTransition) {
      root.classList.add('theme-anim')
      apply()
      window.setTimeout(() => root.classList.remove('theme-anim'), 520)
      return
    }

    const x = ev?.clientX ?? window.innerWidth
    const y = ev?.clientY ?? window.innerHeight
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const vt = document.startViewTransition(apply)
    vt.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          {
            duration: 540,
            easing: 'cubic-bezier(.32,.08,.24,1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        /* transition interrupted — the class toggle already applied */
      })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
