/**
 * Icons for the admin.
 *
 * Kept separate from `components/primitives/Icon.tsx` on purpose: that set is
 * part of the public reference design and its geometry is matched to the
 * reference pixel for pixel. These serve the admin, which borrows the
 * reference's *stroke language* — 24-box, 1.6 stroke, round caps — without
 * being constrained by it, and adding to the shared set would couple two things
 * that change for different reasons.
 */

export type AdminIconName =
  | 'overview'
  | 'messages'
  | 'profile'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'certifications'
  | 'affiliations'
  | 'posts'
  | 'resources'
  | 'plus'
  | 'pencil'
  | 'trash'
  | 'search'
  | 'check'
  | 'alert'
  | 'external'
  | 'chevron'
  | 'database'
  | 'inbox'

const PATHS: Record<AdminIconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="8" rx="1.5" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" strokeWidth="1.6" />
      <rect x="3" y="15" width="7" height="6" rx="1.5" strokeWidth="1.6" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" strokeWidth="1.6" />
    </>
  ),
  messages: (
    <>
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V16h-1A.5.5 0 0 1 4 15.5z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" strokeWidth="1.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  projects: (
    <>
      <path d="M12 3.5 20.5 8l-8.5 4.5L3.5 8z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5M3.5 16l8.5 4.5 8.5-4.5" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  experience: (
    <>
      <rect x="2.5" y="7" width="19" height="13" rx="2" strokeWidth="1.6" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M2.5 12.5h19" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  skills: (
    <>
      <path d="m9 3.5 1.2 2.6 2.8.4-2 2 .5 2.8L9 9.9l-2.5 1.4.5-2.8-2-2 2.8-.4z" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m17 13 .9 2 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1L14 15.3l2.1-.3z" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  certifications: (
    <>
      <circle cx="12" cy="9.5" r="5.5" strokeWidth="1.6" />
      <path d="m8.5 14-1 7 4.5-2.4 4.5 2.4-1-7" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  affiliations: (
    <>
      <circle cx="9" cy="8.5" r="3" strokeWidth="1.6" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14.4A5.5 5.5 0 0 1 20.5 19" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  posts: (
    <>
      <path d="M5 4.5h9.5L19 9v10.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 4.5V9h4.5M7.5 13h8M7.5 16.5h5" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  resources: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1v14a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2.5 2.5 0 0 0-2 1v14a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" strokeWidth="1.8" strokeLinecap="round" />,
  pencil: (
    <>
      <path d="M4.5 19.5h3.2L18 9.2a2.1 2.1 0 0 0-3-3L4.5 16.5z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m14 7 3 3" strokeWidth="1.6" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.5 6.5 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12.5" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10.5 10v6.5M13.5 10v6.5" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" strokeWidth="1.6" />
      <path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" strokeWidth="1.6" />
      <path d="M12 7.5v5.5" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 5-7.5 7.5" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 14.5v3.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18V7a1.5 1.5 0 0 1 1.5-1.5H9" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" strokeWidth="1.6" />
      <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" strokeWidth="1.6" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" strokeWidth="1.6" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.5 13.5 6 5.5h12l2.5 8" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.5 13.5V18a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5v-4.5H15a3 3 0 0 1-6 0z" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
}

export function AdminIcon({
  name,
  className = 'h-4 w-4',
}: {
  name: AdminIconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

/** Tailwind classes for inline "as you type" feedback on inputs. */
export const FIELD_CLASS =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-ink ' +
  'outline-none transition placeholder:text-gray-400 ' +
  'focus:border-gray-900 focus:ring-2 focus:ring-gray-900/15 ' +
  'aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-400/20'