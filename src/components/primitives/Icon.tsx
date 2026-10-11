/**
 * Inline SVG icon set.
 * Spec: 24x24 viewBox, fill="none", stroke-width 1.6 — the reference's geometry.
 * An icon library ships different shapes; these are hand-matched.
 */

type IconProps = {
  name: string
  className?: string
}

const PATHS: Record<string, React.ReactNode> = {
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 015.5 4H11v15.5H6a2 2 0 00-2 1.2V5.5z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 5.5A1.5 1.5 0 0018.5 4H13v15.5h5a2 2 0 012 1.2V5.5z" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  monitor: (
    <>
      <rect x="5" y="5" width="14" height="10" rx="1.5" strokeWidth="1.6" />
      <path d="M3 19h18M9.5 15h5" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" strokeWidth="1.6" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 6.2a3 3 0 010 5.6M17 19c0-2.2-.8-3.8-2.1-4.8" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="1.6" />
      <path d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7M3 12.5h18" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  box: (
    <>
      <path d="M6 8h12l-1 11a2 2 0 01-2 2H9a2 2 0 01-2-2L6 8z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 016 0V8" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  external: <path d="M7 17L17 7M9 7h8v8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  chat: (
    <>
      <path d="M4 5.5h16v10H10l-4.5 4v-4H4z" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="9" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      {PATHS[name] ?? null}
    </svg>
  )
}
