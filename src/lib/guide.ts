/**
 * Guide tour — the reference's signature cursor that walks the page and types.
 *
 * Ported from the reference's SCRIPT 9. The DOM it points at is keyed by
 * `data-guide="…"` hooks; this file owns which page uses which hook and what the
 * cursor says at each stop.
 *
 * Deviation from the reference (UI-SPECIFICATION.md §5.8): the reference walks
 * 12 stops across shop / gear / consulting / collabs / a chat overlay and a
 * stats strip. Four of those pages are out of scope and the stats strip was
 * removed as unverifiable claims, so this tour has 9 stops over the pages that
 * actually exist. The movement model is unchanged — same minimum-jerk glide,
 * same soft spring, same grapheme-by-grapheme typing, same replay pill.
 */

/**
 * Name shown on the cursor's tag.
 *
 * The reference tags its guide "Bryl" — the owner's first name. Ours is
 * therefore "Emmanuel". It is a real name, not a claim about credentials.
 */
export const GUIDE_NAME = 'Emmanuel'

/** Maps a nav href to the `data-guide` value the tour targets. */
export const GUIDE_HOOK: Record<string, string> = {
  '/blog': 'nav-blog',
  '/resources': 'nav-resources',
  '/affiliations': 'nav-affiliations',
  '/contact': 'nav-contact',
  '/projects': 'nav-about',
}

export type GuideStep = {
  /** Elements to point at. Empty (or all off screen) falls back to open space. */
  els: () => Element[]
  /** Where to sit relative to the target. Defaults to 'right'. */
  at?: 'above' | 'below' | 'right'
  /** Allow the step to run in open space even when no target is visible. */
  free?: boolean
  text: string
}

const hooks = (key: string) => Array.from(document.querySelectorAll(`[data-guide="${key}"]`))

const within = (key: string, selector: string) =>
  hooks(key).flatMap((el) => Array.from(el.querySelectorAll(selector)))

/**
 * Ordered stops. Steps whose targets are off screen are skipped; `free` ones
 * fall back to open space to the right of the sidebar.
 */
export const GUIDE_STEPS: GuideStep[] = [
  {
    els: () => hooks('name'),
    at: 'above',
    free: true,
    text: "Hi! I'm the guide. Welcome to my website!",
  },
  {
    els: () => within('socials', 'a'),
    at: 'below',
    text: 'These are my social links.',
  },
  {
    els: () => hooks('stack'),
    at: 'below',
    text: 'The tools I work with day to day.',
  },
  {
    els: () => hooks('nav-blog'),
    text: 'I write about data and engineering here.',
  },
  {
    els: () => hooks('nav-resources'),
    text: 'Hand-picked resources for data folks.',
  },
  {
    els: () => hooks('nav-affiliations'),
    text: 'Communities and affiliations I am part of.',
  },
  {
    els: () => hooks('nav-about'),
    text: 'And the full story: projects, experience and stack.',
  },
  {
    els: () => hooks('email'),
    text: "Here's my email.",
  },
  {
    els: () => [],
    at: 'right',
    free: true,
    text: "That's the tour. Scroll around and enjoy your stay!",
  },
]