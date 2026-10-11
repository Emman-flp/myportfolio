# Phase 2 — Component Map

File tree, component boundaries, props, and data dependencies for the Wave A build.
Design values live in `docs/UI-SPECIFICATION.md`; this document is structure only.

---

## 1. File tree

```
myportfolio/
├─ docs/
│  ├─ UI-SPECIFICATION.md
│  ├─ COMPONENT-MAP.md                       ← this file
│  └─ reference/                             ← Phase 1 captures (do not edit)
│     ├─ PHASE-1-ANALYSIS.md
│     ├─ bryllim-home.html
│     ├─ bryllim-site.css.txt                ← compiled Tailwind, utilities only
│     ├─ bryllim-inline-styles.css.txt       ← the 9 custom <style> blocks
│     ├─ bryllim-inline-scripts.txt
│     └─ ref-*.png                           ← full-page reference screenshots
│
├─ public/
│  ├─ favicon.ico  favicon-32x32.png  favicon-16x16.png  apple-touch-icon.png
│  └─ og-image.png                            1200×630
│
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                          ← <html> class, fonts, providers
│  │  ├─ globals.css                          ← tokens + ported custom CSS (spec §5)
│  │  ├─ page.tsx                             ← /
│  │  ├─ icon.tsx
│  │  ├─ sitemap.ts   robots.ts
│  │  ├─ projects/page.tsx
│  │  ├─ experience/page.tsx
│  │  ├─ stack/page.tsx
│  │  ├─ blog/page.tsx        blog/[slug]/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ certifications/page.tsx
│  │  ├─ affiliations/page.tsx
│  │  ├─ resources/page.tsx
│  │  └─ admin/                              ← separate design, not in this map
│  │
│  ├─ components/
│  │  ├─ shell/
│  │  │  ├─ Shell.tsx                        ← composes everything below
│  │  │  ├─ SidebarNav.tsx                   ← 4.1
│  │  │  ├─ MobileHeader.tsx                 ← 4.2
│  │  │  ├─ MobileNav.tsx                    ← 4.3
│  │  │  ├─ ThemeSwitch.tsx                  ← 4.1 / 5.1
│  │  │  ├─ PresenceBlock.tsx                ← 4.1 / 5.5
│  │  │  └─ SiteFooter.tsx                   ← 4.16
│  │  │
│  │  ├─ primitives/
│  │  │  ├─ HalftoneBackdrop.tsx             ← fixed inset-0 layer
│  │  │  ├─ HalftoneDivider.tsx              ← 4.7
│  │  │  ├─ SectionHeader.tsx                ← 4.8
│  │  │  ├─ Reveal.tsx                       ← .reveal + .d1–.d6
│  │  │  ├─ Kbd.tsx                          ← ⌥/Alt hint chip
│  │  │  ├─ ExternalArrow.tsx                ← the ↗ / ↗-mirrored glyph
│  │  │  ├─ Icon.tsx                         ← 24×24 stroke-1.6 icon set
│  │  │  └─ Modal.tsx                        ← focus-trapped dialog host
│  │  │
│  │  ├─ home/
│  │  │  ├─ Hero.tsx                         ← 4.4
│  │  │  ├─ GazePortrait.tsx                 ← 9-direction swap
│  │  │  ├─ SocialLinks.tsx
│  │  │  ├─ BlogList.tsx                     ← 4.9
│  │  │  ├─ ProjectDeck.tsx                  ← 4.10
│  │  │  ├─ ExperienceList.tsx               ← 4.11
│  │  │  ├─ StackTags.tsx                    ← 4.11 stack block
│  │  │  ├─ CertificationGrid.tsx            ← 4.12
│  │  │  ├─ AffiliationList.tsx              ← 4.14
│  │  │  └─ GithubGraph.tsx                  ← 4.15
│  │  │
│  │  ├─ pages/
│  │  │  ├─ ProjectPage.tsx
│  │  │  ├─ ExperiencePage.tsx
│  │  │  ├─ StackPage.tsx
│  │  │  ├─ BlogIndex.tsx
│  │  │  ├─ BlogPost.tsx
│  │  │  ├─ ContactForm.tsx                  ← matches /collabs form markup
│  │  │  ├─ CertificationsPage.tsx
│  │  │  ├─ AffiliationsPage.tsx
│  │  │  └─ ResourcesPage.tsx
│  │  │
│  │  └─ overlays/                           ← Wave B
│  │     ├─ AskOverlay.tsx                   ← spec §5.8
│  │     ├─ ChatOverlay.tsx
│  │     ├─ TypingTest.tsx
│  │     ├─ GuideTour.tsx                    ← cursor + prompt pill
│  │     └─ ModalPanels.tsx
│  │
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts        server.ts  admin.ts
│  │  ├─ data.ts                          ← typed read helpers
│  │  ├─ types.ts                         ← DB row types
│  │  └─ utils.ts                         ← cn(), formatDate(), timeAgo()
│  │
│  └─ styles/
│     └─ tokens.css                        ← extracted from globals.css (optional)
│
├─ supabase/
│  ├─ migrations/0001_init.sql            ← schema + RLS
│  └─ seed.sql
│
├─ tailwind.config.ts                      ← palette remapped to CSS vars
├─ postcss.config.mjs
├─ next.config.ts
├─ tsconfig.json
├─ .env.local.example
├─ .gitignore
└─ README.md
```

---

## 2. Shell composition

```
Shell (server)                         ← renders <html lang="en"> + fonts + tokens
└─ ThemeProvider (client)              ← localStorage.theme, pre-paint class set
   └─ ShellClient (client)             ← owns drawer/overlay open state
      ├─ SkipLink                      ← "Skip to content" (addition)
      ├─ HalftoneBackdrop              aria-hidden
      ├─ SidebarNav                    lg only
      ├─ MobileHeader                  <lg only
      ├─ MobileNav                     <lg only, portal
      ├─ OverlayHost                   ← Ask / Chat / Typing portals + Alt+K, Alt+J
      ├─ children                      ← page
      ├─ GuideTour                     desktop only
      └─ SiteFooter
```

**State owned by `ShellClient`:** `drawerOpen`, `overlay: null | 'ask' | 'chat' | 'typing' | 'modal'`.
**State owned by `ThemeProvider`:** `theme: 'system' | 'light' | 'dark'`, resolved `isDark`.

### `/` page tree

```
HomePage (server)
└─ main#top.relative.z-10.lg:pl-56
   └─ div.mx-auto.max-w-2xl.px-6
      ├─ Hero
      ├─ HalftoneDivider      (h-6,  opacity .18)
      ├─ BlogList        01 — blog
      ├─ ProjectDeck     02 — projects
      ├─ ExperienceList  03 — experience  └─ StackTags
      ├─ CertificationGrid 04 — certifications
      ├─ AffiliationList   05 — affiliations
      ├─ GithubGraph       06 — github
      └─ HalftoneDivider  (h-10, opacity .15, mb-16)
```

> `SiteFooter` lives inside `Shell`, below `main`, matching the reference's
> `footer.mx-auto.max-w-2xl.px-6.py-10` sibling placement.

---

## 3. Nav model — single source of truth

One array drives sidebar, drawer, mobile header, and the tour. Adding a page here
adds it everywhere; nothing is hardcoded twice.

```ts
// lib/nav.ts
export const NAV: NavGroup[] = [
  {
    id: 'build',
    links: [
      { href: '/projects',       label: 'Projects',       icon: null },
      { href: '/experience',     label: 'Experience',     icon: null },
      { href: '/stack',          label: 'Stack',          icon: null },
    ],
  },
  {
    id: 'learning',
    links: [
      { href: '/certifications', label: 'Certifications', icon: null },
      { href: '/resources',      label: 'Resources',      icon: 'book' },
    ],
  },
  {
    id: 'connect',
    links: [
      { href: '/affiliations',   label: 'Affiliations',   icon: null },
      { href: '/contact',        label: 'Contact',        icon: 'mail' },
    ],
  },
]
```
Active detection: `usePathname()` exact match; the link gets `pl-6` (reference behaviour).

> Reference grouping was *explore → offer → about*. Yours is *build → learning →
> connect*, which fits a data portfolio while keeping the three-group + rule layout
> and the `pl-6` active indent.

---

## 4. Component contracts

### 4.1 `Hero`
```tsx
type HeroProps = { name: string; tagline: string; paragraphs: string[]; socials: Social[] }
```
Server component. Children `GazePortrait` (client, for pointer tracking).

### 4.2 `GazePortrait` *(client)*
```tsx
type Props = { basePath: string; alt: string; fallback: string }
```
Nine `<Image>` sources at `${basePath}/{center,up,up-right,right,down-right,down,down-left,left,up-left}.webp`.
Pointer → `atan2(dy, dx)` → 45° sector; dead zone `0.18 × width`; `rAF`-throttled;
`prefers-reduced-motion` → `center`; blur-in on direction change; preload via `new Image()`.
Fallback: single image, gaze stays dormant. Container: `relative > img#profile-gaze.block.h-auto.w-full.select-none`.

### 4.3 `ProjectDeck` *(client)*
```tsx
type Card = {
  id: string; title: string; summary: string
  badges: string[]           // first = filled, rest = outlined
  icon: string
  links: { label: string; image: string; href: string }[]
}
type Props = { cards: Card[]; initial?: number }
```
Owns `centerIndex`. `activateCard(i)` swaps slots exactly as the reference does.
Cards render `is-center` / `is-left` / `is-right` by index distance — recomputed, not
stored, so slot changes are pure render.
Keyboard: cards focusable; `←/→` moves centre; only centre exposes links.

### 4.4 `ExperienceList`
```tsx
type Entry = { id: string; period: string; role: string; org: string; href?: string }
type Props = { entries: Entry[]; stack: string[]; stackHref: string }
```
Pure server component. Matches the mobile stack (company wraps to its own row).

### 4.5 `CertificationGrid`
```tsx
type Cert = { id: string; name: string; issuer: string; logo: string; verifyUrl?: string }
type Props = { certs: Cert[] }
```
Card markup incl. the `inset-[5px]` inner border and the mirrored `-scale-x-100` arrow.

### 4.6 `AffiliationList`
```tsx
type Affiliation = { id: string; name: string; role: string; logo?: string; emoji?: string; href: string }
```
Exactly one of `logo` / `emoji`.

### 4.7 `GithubGraph` *(server)*
```tsx
type Props = { username: string; fallbackTotal?: number }
```
Fetches contributions server-side. On failure renders header row only — **never** a
fake grid. `revoke`/timeout so a slow GitHub can't stall the page.

### 4.8 `ContactForm` *(client)*
```tsx
type Props = { action: string }   // server action
```
Fields matching `/collabs`: name, email, organisation, role, budget, timeline, details.
`grid gap-5 sm:grid-cols-2`; submit row `sm:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between`.
Writes to Supabase; server action validates; `revalidatePath` not needed.

### 4.9 `Modal` *(client)*
```tsx
type Props = { open: boolean; onClose: () => void; label: string; children: ReactNode }
```
**Addition to the reference:** real focus trap, `Esc` to close, restore focus to trigger.
Backdrop `bg-ink/30 backdrop-blur-md`, panel `scale-95→1` over 200ms.

### 4.10 `Reveal`
```tsx
type Props = { delay?: 1|2|3|4|5|6; as?: keyof JSX.IntrinsicElements; children: ReactNode }
```
Renders `className={\`reveal d${delay}\`}`. CSS-only; no JS, no IntersectionObserver —
the reference animates on load only, and matching that matters more than
"smarter" scroll triggering.

### 4.11 `GuideTour` *(client, Wave B)*
```tsx
type Steps = { target: string; at: 'above'|'below'|'left'|'right'; text: string; free?: boolean }[]
```
Twelve steps over `data-guide` hooks, same order as the reference. Spring follow
(`SPRING 190`, `DAMPING 2√190 × 0.82`), types via `Intl.Segmenter`, `sessionStorage`
gate, `?tour` override. Disabled below 1024px / coarse pointer / reduced motion.

---

## 5. Data flow

```
Supabase (Postgres)
  └─ lib/supabase/server.ts   (service-role, RLS-bypassing — server only)
     └─ lib/data.ts
        ├─ getProfile()        → Hero, SiteFooter
        ├─ getNav()            → lib/nav.ts is static; profile is dynamic
        ├─ getPosts(limit)     → BlogList
        ├─ getProjects()        → ProjectDeck, ProjectPage
        ├─ getExperience()      → ExperienceList, ExperiencePage
        ├─ getStack()           → StackTags, StackPage
        ├─ getCertifications()  → CertificationGrid
        ├─ getAffiliations()    → AffiliationList
        └─ getContactMessages() → admin only
```

Every helper returns `[]` / `null` when Supabase is unreachable, so the layout
renders in its real shape with placeholder content instead of erroring.

**Admin writes go through the service role after an auth check.** Public reads use
the anon key and rely on RLS.

---

## 6. Dependency decisions

| Need | Library | Why / why not |
|---|---|---|
| Framework | Next.js 15 App Router | Required |
| Styling | Tailwind v3.4.19 + `globals.css` | **Must be v3, not v4.** v4 changed the config format and the `rgb(var(--x) / <alpha-value>)` pattern the reference relies on. Matching v3 keeps class names identical. |
| Fonts | `next/font/google` + one `@font-face` | Self-hosts 3 fonts; Geist Pixel from the reference's CDN |
| DB | Supabase Postgres | Required |
| Auth | Supabase Auth (email + GitHub OAuth) | Required |
| Storage | Supabase Storage (`project-images`, `resumes`) | Required |
| Icons | **Inline SVG components** | The reference uses 24×24 `stroke-width 1.6` icons. A library ships different geometry. |
| Animations | **CSS only** | Every reference animation is CSS. Adding Framer Motion would change timing and add weight. |
| Deck / tour | Plain React + `requestAnimationFrame` | No dependency needed |
| Rich text | **Markdown + `rehype-raw`** | `gray-700/15px font-serif` for prose. Skip a WYSIWYG in admin; plain Markdown keeps output predictable. |
| Forms | Server Actions | Native; the reference's `/collabs` form is a plain POST |
| Charts | **None** | Explicitly out of scope — the reference has no charts and you asked for no additions |

Rejected: Framer Motion, shadcn/ui, react-icons, MDX (heavier than needed), next-auth (Supabase Auth is required).

---

## 7. Build sequence

Each step ends with a screenshot diff against `docs/reference/ref-*.png`.

| # | Step | Gate |
|---|---|---|
| 1 | Repo + `tailwind.config.ts` + `globals.css` tokens | Tokens render; `--g200` = `rgb(233,233,233)` |
| 2 | `Shell` + `SidebarNav` + `MobileHeader` + `MobileNav` + `ThemeSwitch` | Sidebar 224px; header 53px; drawer toggles |
| 3 | `HalftoneBackdrop` + `HalftoneDivider` | Dot field matches at 390/1440 |
| 4 | `Hero` + `GazePortrait` + `SocialLinks` | Hero box matches; portrait 288×288 |
| 5 | `BlogList` | Row heights 87–88px; `truncate` working |
| 6 | `ProjectDeck` | 272px deck @1440; card 328px; transforms match |
| 7 | `ExperienceList` + `StackTags` | Row 41–42px; mobile stacking correct |
| 8 | `CertificationGrid` + `AffiliationList` + `GithubGraph` | Card sizes; hover lifts |
| 9 | `SiteFooter` | Full page height within ±40px of 3348px |
| 10 | **Wave A inner pages** | Each container width correct |
| 11 | **Wave B overlays** | Timings match §6 |
| 12 | Supabase schema + RLS | — |

---

## 8. Content fixtures

`src/lib/fixtures.ts` — used until Supabase is wired (steps 4–10). Every entry
carries `placeholder: true` so the audit is a single grep.

```ts
export const PLACEHOLDER_PROFILE = {
  name: 'Emmanuel Joshua Felipe',
  tagline: 'Aspiring Data Analyst and Data Engineer',
  paragraphs: [
    '[Hero paragraph 1 — one sentence on what you analyse and build]',
    '[Hero paragraph 2 — what you are learning and looking for]',
  ],
  socials: [
    { label: 'github',   href: '[GITHUB_URL]' },
    { label: 'linkedin', href: '[LINKEDIN_URL]' },
    { label: 'email',    href: '[EMAIL]' },
  ],
  placeholder: true,
}
```
Same shape for `PLACEHOLDER_POSTS`, `PLACEHOLDER_PROJECTS`, `PLACEHOLDER_EXPERIENCE`,
`PLACEHOLDER_STACK`, `PLACEHOLDER_CERTS`, `PLACEHOLDER_AFFILIATIONS`.

---

## 9. Decisions needing your input

| # | Question | Default if you don't answer |
|---|---|---|
| 1 | Nav labels/groups — keep reference names (`Shop Blog Gear Resources` / `Projects Experience Stack Certifications Recommendations Affiliations`) or my three-group proposal? | My proposal |
| 2 | Tailwind **v3.4.19** (matches reference exactly) vs **v4** (newer)? | v3.4.19 |
| 3 | Blog — plain Markdown, or MDX? | Plain Markdown |
| 4 | Portrait image — supply your own, or use a generated placeholder avatar? | Generated placeholder |
