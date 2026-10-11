'use client'

import { useTheme } from './ThemeProvider'

type Opt = 'system' | 'light' | 'dark'

const OPTIONS: { value: Opt; label: string; path: React.ReactNode }[] = [
  {
    value: 'system',
    label: 'System theme',
    path: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" strokeWidth="1.7" />
        <path d="M9 21h6M12 17v4" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    value: 'light',
    label: 'Light theme',
    path: (
      <>
        <circle cx="12" cy="12" r="4" strokeWidth="1.7" />
        <path
          d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    value: 'dark',
    label: 'Dark theme',
    path: (
      <path d="M20 13.6A8 8 0 1 1 10.4 4a6.2 6.2 0 0 0 9.6 9.6z" strokeWidth="1.7" strokeLinejoin="round" />
    ),
  },
]

/** Spec §4.1 / §5.1. */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="theme-switch" role="group" aria-label="Theme">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-theme-opt={opt.value}
          onClick={(ev) => setTheme(opt.value, ev)}
          className={`theme-opt${theme === opt.value ? ' is-active' : ''}`}
          title={opt.value[0].toUpperCase() + opt.value.slice(1)}
          aria-label={opt.label}
          aria-pressed={theme === opt.value}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {opt.path}
          </svg>
        </button>
      ))}
    </div>
  )
}
