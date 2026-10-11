# Phase 2 — UI Specification

Normative spec for recreating bryllim.com. Every value here was measured from the
live reference (see `docs/reference/PHASE-1-ANALYSIS.md`). Deviate only where
marked **[DELIBERATE]**.

---

## 0. Fidelity contract

**Rule 1 — Reference is the source of truth.** No section, component, or flourish
is added that does not exist in the reference. No removal without a recorded reason.

**Rule 2 — Content adapts, structure does not.** Your data replaces his data.
Card sizes, spacing, type scale, and interaction timing stay identical.

**Rule 3 — No fabricated claims.** Sections whose only purpose is social proof he
owns (stats, sponsorships, testimonials) are removed, not filled with invented data.

**Rule 4 — Measure, don't eyeball.** Each component ships with its measured box
values so differences show up as numbers, not opinions.

---

## 1. Layout system

### 1.1 The shell

```
<body class="relative overflow-x-hidden bg-white font-sans text-ink antialiased">
  <div aria-hidden class="pointer-events-none fixed inset-0 z-0">   ← halftone backdrop
  <nav  class="fixed inset-y-0 left-0 z-50 hidden w-56 ... lg:flex">   ← sidebar, ≥1024 only
  <header class="sticky top-0 z-50 ... lg:hidden">                     ← mobile bar, <1024
  <div id="mobileNav" class="fixed inset-0 z-[60] hidden ... lg:hidden">
  <div id="askOverlay"    class="… z-100">                            ← Ask,     z 100
  <div id="chatOverlay"    class="… z-110">                            ← Chat,    z 110
  <div id="typingOverlay" class="… z-115">                            ← Typing,  z 115
  <main id="top" class="relative z-10 lg:pl-56">
  <div id="modal" class="fixed inset-0 z-[100] hidden ...">
  <div id="guideCursor">  <div id="guidePrompt">                      ← z 90 / z 80
```

`main` is the only stacking context above the backdrop (`z-10`).

### 1.2 Content column — **critical**

| Page type | Container class | Width |
|---|---|---|
| Homepage | `mx-auto max-w-2xl px-6` | **672px** |
| `/projects` `/experience` `/affiliations` | `mx-auto max-w-2xl px-6 py-14 sm:py-20` | 672px |
| `/stack` `/collabs` `/consulting` | `… max-w-3xl …` | 768px |
| `/shop` `/gear` `/resources` `/certifications` `/recommendations` | `… max-w-4xl …` | 896px |

Below 1024px the column is `width: 100%` with 24px gutters. Above, `main` is
padded left by exactly 224px (the sidebar) and the column centres in what remains.

### 1.3 Breakpoints

Only two are used. There is no `md`-driven layout.

| Name | Width | Switches |
|---|---|---|
| base | <640 | stacked hero, vertical logo strip, 1-col card grids, full-bleed deck |
| `sm` | ≥640 | hero → `18rem 1fr`; logo strip horizontal; 3-col grids; deck becomes non-full-bleed |
| `lg` | ≥1024 | sidebar appears, `main` gains `pl-56`, mobile header/drawer disappear, guide cursor + playground canvas enabled |

---

## 2. Design tokens

Implement as CSS custom properties on `:root`, with `html.dark` overrides.
Tailwind's palette is then remapped to these triplets so `bg-white`, `text-ink`,
`border-gray-200` etc. resolve to the reference's exact values.

```css
:root {
  --bg: 255 255 255;   --ink: 10 10 10;
  --g50: 250 250 250;  --g100: 245 245 245; --g200: 233 233 233; --g300: 212 212 212;
  --g400: 163 163 163; --g500: 115 115 115; --g600: 82 82 82;   --g700: 64 64 64;
  --g800: 38 38 38;    --g900: 23 23 23;    --g950: 10 10 10;
  --halftone: rgba(10, 10, 10, 0.9);
  --sel-bg: #0a0a0a;   --sel-fg: #ffffff;
}
html.dark {
  --bg: 12 12 15;      --ink: 244 244 245;
  --g50: 24 24 27;     --g100: 30 30 34;  --g200: 42 42 48;   --g300: 58 58 66;
  --g400: 138 138 146; --g500: 160 160 168; --g600: 184 184 192; --g700: 206 206 212;
  --g800: 228 228 232; --g900: 240 240 243; --g950: 250 250 250;
  --halftone: rgba(244, 244, 245, 0.42);
  --sel-bg: #fafafa;   --sel-fg: #0a0a0a;
  color-scheme: dark;
}
html { background-color: rgb(var(--bg)); }
body { background-color: rgb(var(--bg)); color: rgb(var(--ink)); }
::selection { background: var(--sel-bg); color: var(--sel-fg); }
```

**Tailwind config mapping** (`rgb(var(--token) / <alpha-value>)`):

| Tailwind key | Token | | Tailwind key | Token |
|---|---|---|---|---|
| `white` | `--bg` | | `gray-500` | `--g500` |
| `ink` | `--ink` | | `gray-600` | `--g600` |
| `gray-50` | `--g50` | | `gray-700` | `--g700` |
| `gray-100` | `--g100` | | `gray-800` | `--g800` |
| `gray-200` | `--g200` | | `gray-900` | `--g900` |
| `gray-300` | `--g300` | | `gray-950` | `--g950` |
| `gray-400` | `--g400` | | | |

Families:
```ts
fontFamily: {
  sans:  ['var(--font-geist)', 'Inter', 'system-ui', 'sans-serif'],
  mono:  ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
  pixel: ['"Geist Pixel"', '"Geist Mono"', 'monospace'],
  serif: ['var(--font-source-serif-4)', 'Georgia', 'serif'],
}
```

### Fonts
- `Geist`, `Geist Mono`, `Source Serif 4` → `next/font/google`, `display: 'swap'`, CSS variables.
- `Geist Pixel` → `@font-face` pointing at the reference's exact CDN URL
  `https://cdn.jsdelivr.net/gh/vercel/geist-pixel-font@main/fonts/webfonts/GeistPixel-Square.woff2`,
  `font-display: swap`. Do **not** copy the file into `public/` — keep the reference's host model.

---

## 3. Type scale

| Role | Class | Font | Size | Weight | LH | Tracking | Colour |
|---|---|---|---|---|---|---|---|
| Hero name | `font-pixel text-3xl leading-none sm:text-[2.6rem]` | Pixel | 1.875 → 2.6rem | 400 | 1 | normal | `--ink` |
| Page `h1` | `font-pixel text-2xl leading-none` | Pixel | 1.5rem | 400 | 1 | normal | `--ink` |
| Section head | `font-pixel text-sm text-gray-400` | Pixel | 0.875rem | 400 | 20px | normal | `--g400` |
| Card title | `font-pixel text-base leading-tight` | Pixel | 1rem | 400 | 1.25 | normal | `--ink` |
| Stat value | `font-pixel text-lg leading-none` | Pixel | 1.125rem | 400 | 1 | normal | `--ink` |
| Nav wordmark | `font-pixel text-[15px] leading-none` / `[14px]` | Pixel | 15 / 14px | 400 | 1 | normal | `--ink` |
| Blog row title | `text-[15px] font-medium` | Geist | 15px | 500 | 22.5 | normal | `--ink` |
| Hero body | `text-[15px] leading-relaxed` | Geist | 15px | 400 | 1.625 | normal | `--g600` |
| Card body | `text-[13px] leading-relaxed` | Geist | 13px | 400 | 1.625 | normal | `--g600` |
| Excerpt | `text-sm` | Geist | 14px | 400 | 20px | normal | `--g500` |
| Quote | `.rec-quote` | Source Serif 4 | 13.5px | 400 | 1.625 | normal | `--g700` |
| Nav link | `font-mono text-[13px]` | Mono | 13px | 400 | 19.5 | normal | `--g500` |
| Label / meta | `font-mono text-[11px] uppercase tracking-wider` | Mono | 11px | 400 | — | 0.05em | `--g500`/`--g400` |
| Tag / pill | `font-mono text-[12px]` | Mono | 12px | 400 | — | normal | `--g600` |
| In-card pill | `font-mono text-[9px] uppercase tracking-wider` | Mono | 9px | 400 | 13.5 | 0.45px | white/`--g500` |
| Timestamp | `font-mono text-[12px]` | Mono | 12px | 400 | 18 | normal | `--g400` |

Global rule: `html { line-height: 1.5 }`, `body { line-height: inherit }`.

---

## 4. Component specification

Each entry gives the exact DOM/classes and the measured box at **1440px** unless noted.

### 4.1 `SidebarNav` (desktop, ≥1024)

```
fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-gray-200 bg-white px-7 py-8 lg:flex
```
Width **224px**. Padding 28px horizontal / 32px vertical.

| # | Block | Classes / spec |
|---|---|---|
| 1 | Wordmark | `shrink-0 font-pixel text-[15px] leading-none hover:opacity-60` → `/` |
| 2 | Link stack | `mt-9 flex flex-1 flex-col gap-4 overflow-y-auto font-mono text-[13px]` |
| 2a | Group | `flex flex-col gap-2.5` — Shop, Blog, Gear, Resources |
| 2b | Rule | `h-px bg-gray-200` |
| 2c | Group | `flex flex-col gap-2.5` — Collabs, Consulting |
| 2d | Rule | `h-px bg-gray-200` |
| 2e | Group | `flex flex-col gap-2.5` — Projects, Experience, Stack, Certifications, Recommendations, Affiliations *(no icons)* |
| 3 | Ask button | `mt-6 inline-flex w-fit items-center gap-2 text-[12px] text-gray-400 hover:text-ink` + `kbd` hint |
| 4 | Typing button | `mt-2.5 …` + `kbd` hint |
| 5 | Presence | `mt-4 border-y border-gray-200 py-3.5` |
| 6 | Footer | `mt-6 shrink-0` |

**Link** — `relative inline-flex w-fit items-center gap-2.5 text-gray-500 hover:text-ink`
Icon `h-[1.15em] w-[1.15em] shrink-0`, `viewBox="0 0 24 24" fill="none"`, `stroke-width="1.6"`.
**Active** — add `pl-6` (reference indents the current page; it does not recolour).

**`kbd`** — `rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-gray-500`.
Label shows `⌥` on Mac, `Alt` elsewhere (`.ask-mod-key` rewritten at runtime).

**Presence** — 3 × `.presence-avatar` (19px circle, `box-shadow: 0 0 0 1.5px bg, 0 0 0 2.5px g200`, −6px overlap) + `.presence-more` pill (`+5`).
`.presence-label` = Geist Pixel `10.5px text-gray-400`, `.presence-num` weight 700 `--ink`.
Chat button: `mt-3.5 inline-flex w-fit items-center gap-2 font-mono text-[12px] text-gray-500 hover:text-ink`.

**Theme switch** — `.theme-switch`: `inline-flex items-center gap-1px p-2 rounded-full border border-gray-200`.
Three `.theme-opt` buttons `1.35rem` square, `rounded-full`, `text-gray-400`, `transition: color .2s, background-color .2s`;
active gets `bg-g100 text-ink`. Icons 13×13, stroke-width 1.7. Order: **system, light, dark**.
Sound toggle: `h-[30px] w-[30px] rounded-full border border-gray-200 text-gray-500`, 14px icon.

Contact block: `text-[12px] leading-relaxed text-gray-400` lead-in, then
`mt-1.5 inline-flex w-fit items-center gap-2 font-mono text-[13px] text-ink hover:text-gray-500` → mailto.

### 4.2 `MobileHeader` (<1024)

```
sticky top-0 z-50 border-b border-gray-200/70 bg-white/90 backdrop-blur-md lg:hidden
└── mx-auto flex max-w-3xl items-center justify-between px-6 py-3
```
Measured height **53px**. Wordmark `font-pixel text-[14px]`. Hamburger `-mr-1 p-1 text-gray-700 hover:text-ink`,
svg `h-5 w-5`, three `M4 7h16 M4 12h16 M4 17h16` paths, `stroke-width="1.6"`, `stroke-linecap="round"`.

### 4.3 `MobileNav` drawer

```
#mobileNav: fixed inset-0 z-[60] hidden flex-col bg-white lg:hidden
  opacity 0 → 1 over .3s ease on .is-open
```
- Header row: `flex items-center justify-between border-b border-gray-200 px-6 py-3` + close `X` icon.
- Body: `flex flex-1 flex-col overflow-y-auto px-7 py-8 font-mono text-[16px]`.
- Groups: `.mnav-group flex flex-col gap-4`, staggered `transition-delay` **0.05 / 0.11 / 0.17 / 0.23s**;
  each animates `opacity 0→1` + `translateY(12px)→0`, `0.45s ease` / `cubic-bezier(.16,1,.3,1)`.
- Separators `my-5 h-px bg-gray-200`.
- Links `relative inline-flex w-fit items-center gap-3 text-gray-700 hover:text-ink`.
- Final group `gap-5`: Ask (`text-[14px] text-gray-500`), presence block
  (`-mt-1 border-y border-gray-200 py-4`, label `text-[11.5px]`), theme + sound, email `text-[14px]`.
- Opening Ask/Chat from here closes the drawer then waits **330ms** before opening the overlay.

### 4.4 `Hero`

```
section.relative.pt-20.pb-16.sm:pt-28           → y 53, h 464
└── grid gap-9 sm:grid-cols-[18rem_1fr] sm:items-start sm:gap-10   → y 165, h 288
    ├── div.reveal.d1.mx-auto.w-full.max-w-[18rem].sm:mx-0   → 288×288 at x 81
    │   └── div.relative > img#profile-gaze.block.h-auto.w-full.select-none
    └── div                                       → x 409, w 296
        ├── h1.reveal.d2.font-pixel…             → y 165, h 42
        ├── p.reveal.d3.mt-6…                     → y 231 (66px gap below h1)
        ├── p.reveal.d4.mt-5…                     → y 324
        └── div.reveal.d5.mt-7.flex.flex-wrap…   → y 425
```
Padding-top 80px base / **112px** at `sm+`. Grid gap 36px base / **40px** at `sm+`.
Social row: `mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[12px] text-gray-500`,
each `hover:text-ink`, label + `↗`, gap-x 12px.
Bottom padding 64px.

### 4.5 `LogoStrip` **[DELIBERATE — omitted]**

Reference renders Cognition / AMD AI / StellarPH ambassadorships. Removed — these are
third-party sponsorships you do not hold. Measured for reference only:
`section.border-t.border-gray-200.py-5` (y 517, h 73), inner
`grid grid-cols-3 divide-x divide-gray-200`, each cell `flex min-w-0 flex-col items-start gap-2 pr-3 sm:flex-row sm:items-center sm:gap-3 sm:pr-5`.
Name `block text-[12px] font-semibold`; sub `mt-1 block whitespace-nowrap text-[9px] uppercase tracking-wider text-gray-500 sm:text-[10px]`.

### 4.6 `StatStrip` **[DELIBERATE — omitted]**

`300K+ community` / `8+ yrs shipping` / `11x hackathon wins`. Removed — unverifiable claims.
If real metrics exist later, rebuild as:
```
section.grid.grid-cols-3.divide-x.divide-gray-200.border-t.border-gray-200   → y 590, h 92
└── div.py-6.pr-3.sm:pr-5 | .py-6.px-3.sm:px-5 | .py-6.pl-3.sm:pl-5
    └── button|a.group.block[.text-left]
        ├── div.flex.items-center.gap-1 > span.font-pixel.text-lg.leading-none + svg (12×12 ↗)
        └── div.mt-2.font-mono.text-[11px].uppercase.tracking-wider.text-gray-500.group-hover:text-ink
```

### 4.7 `HalftoneDivider`

Two instances. Between hero/stats and blog: `halftone halftone-wide mask-fade-x my-2 h-6 w-full opacity-[0.18]` (h 24px).
Before footer: `halftone halftone-wide mask-fade-x mb-16 mt-2 h-10 w-full opacity-[0.15]` (h 40px).

### 4.8 `SectionHeader`

```
div.mb-8.flex.items-baseline.justify-between      (blog/projects/certs/recs/affiliations)
div.mb-6.flex.items-baseline.justify-between      (experience/github)
  ├── h2.font-pixel.text-sm.text-gray-400         "01 — blog"
  └── a.font-mono.text-[11px].uppercase.tracking-wider.text-gray-500.hover:text-ink
```
Note `items-baseline` — the link sits on the heading's baseline, not centred.

### 4.9 `BlogList` — `section#blog.relative.py-14`

y 722 · h 428 · header y 778 · list y 830 h 264

```
div.divide-y.divide-gray-200.border-y.border-gray-200
└── a.group.flex.items-baseline.justify-between.gap-6.py-5.hover:bg-gray-50/80     h 87–88
    ├── div.min-w-0                                                        w 542
    │   ├── h3.truncate.text-[15px].font-medium.text-ink.group-hover:text-gray-500   h 23
    │   └── p.mt-1.truncate.text-sm.text-gray-500                                     h 20
    └── time.shrink-0.font-mono.text-[12px].text-gray-400                   w 58
```
Decorative: `halftone mask-circle pointer-events-none absolute -left-10 bottom-6 h-32 w-32 opacity-20`
(sits at x −16, bleeds outside the column; harmless because `body` is `overflow-x-hidden`).
Row padding 20px; title→excerpt gap 4px; gap to time 24px.

### 4.10 `ProjectDeck` — `section#projects.py-14`

y 1149 · h 436 · header y 1205 · deck y 1257 h 272

```
div.deck[data-deck]              ← custom CSS, see §5.2
└── article.deck-card.is-{center|left|right}.rounded-2xl.border.border-gray-200.bg-white.p-5
```
Card internals:
```
div.flex.flex-wrap.items-center.gap-1.5                          pills row
  ├── span.inline-flex.items-center.gap-1.5.rounded-full.bg-ink.px-2.5.py-0.5
  │         .font-mono.text-[9px].uppercase.tracking-wider.text-white   ← filled "primary"
  └── span.rounded-full.border.border-gray-300.px-2.py-0.5
            .font-mono.text-[9px].uppercase.tracking-wider.text-gray-500 ← outlined
div.mt-4.flex.items-center.gap-3.5                                gap 14px
  ├── img.h-12.w-12.shrink-0.rounded-xl.border.border-gray-200.shadow-sm      48×48
  └── h3.font-pixel.text-base.leading-tight.text-ink
p.mt-3.text-[13px].leading-relaxed.text-gray-600
div.mt-4.flex.items-center.gap-2                                  store badges
  └── a.transition-opacity.hover:opacity-80 > img.h-8.w-auto | img.h-[2.65rem].w-auto
```

**Behaviour** — click a side card: it becomes `is-center`, the old centre takes that
side's slot. Only the centre card's links are clickable (`.deck-card:not(.is-center) a { pointer-events: none }`).
Card dims via an `::after` overlay `rgb(var(--bg) / .4)`, removed on hover.

### 4.11 `ExperienceList` — `section#experience.py-14`

y 1585 · h 450 · header y 1641 (`mb-6`) · rows y 1685 h 169 · stack block y 1882

```
div.divide-y.divide-gray-200.border-y.border-gray-200
└── div.group.grid.grid-cols-12.items-baseline.gap-3.py-2.5.hover:bg-gray-50/80   h 41–42
    ├── div.col-span-2.font-mono.text-[11px].text-gray-400     "2025"      w 94
    ├── div.col-span-10.sm:col-span-6.text-[14px].font-medium.text-ink        w 306
    └── div.col-span-12.sm:col-span-4.text-[13px].text-gray-500.sm:text-right w 200
```
**Below `sm`** the company wraps to its own full-width row (`col-span-12`) — this is
the reference's mobile behaviour, keep it.

**Stack block** (`mt-7`):
```
div.mb-4.flex.items-baseline.justify-between
  ├── h3.font-mono.text-[11px].uppercase.tracking-wider.text-gray-400   "Stack"
  └── a… "view all →"
div.flex.flex-wrap.gap-2                                             gap 8px
  ├── span.rounded-md.border.border-gray-200.bg-white.px-2.5.py-1
  │         .font-mono.text-[12px].text-gray-600                       h 28
  └── a.rounded-md.border.border-dashed.border-gray-300.px-2.5.py-1
            .font-mono.text-[12px].text-gray-500.hover:border-gray-500.hover:text-ink
```

### 4.12 `CertificationGrid` — `section#certifications.py-14`

y 2035 · h 332 · header y 2091 · grid y 2143 h 168 · 3 cols, 200px each, gap 12px

```
a.group.relative.flex.flex-col.items-center.rounded-xl
   .bg-gradient-to-b.from-gray-50.to-white.px-4.py-5.text-center
   .shadow-[0_8px_22px_-14px_rgba(10,10,10,0.25)].transition
   .hover:-translate-y-0.5.hover:shadow-[0_18px_36px_-20px_rgba(10,10,10,0.4)]
  ├── span.pointer-events-none.absolute.inset-[5px].rounded-lg.border.border-gray-200/70
  ├── img.relative.h-9.w-9.rounded-md.border.border-gray-200.bg-white.object-contain.p-1   36×36
  ├── h3.relative.mt-3.text-[13px].font-semibold.leading-snug.text-ink
  ├── p.relative.mt-1.font-mono.text-[9.5px].uppercase.tracking-wider.text-gray-400
  └── div.relative.mt-3.flex.items-center.gap-1.5.text-gray-300.group-hover:text-ink
        ├── svg 8×14 (external-link)
        ├── span.font-mono.text-[9px].uppercase.tracking-[0.16em].text-gray-400
        └── span.inline-flex.-scale-x-100   ← mirrored arrow glyph
```
The `inset-[5px]` inner border is a "card within card" detail — easy to miss, keep it.

### 4.13 `RecommendationGrid` **[DELIBERATE — omitted]**

Reference renders 3 named testimonials. Removed — you have none, and inventing quotes
would be dishonest. Rebuild only with real, attributed testimonials.
Card spec if used: `group flex flex-col rounded-xl bg-gradient-to-b from-gray-50 to-white p-5
shadow-[0_8px_22px_-16px_rgba(10,10,10,.2)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-20px_rgba(10,10,10,.35)]`,
200×239, quote `rec-quote mt-2 line-clamp-5 text-[13.5px] leading-relaxed text-gray-700`,
footer `mt-4 flex items-center gap-2.5 border-t border-gray-100 pt-3` with a
`h-8 w-8 rounded-full bg-gray-100 font-mono text-[10px] font-medium text-gray-600` initials avatar.

### 4.14 `AffiliationList` — `section#affiliations.py-14`

y 2769 · h 196 · header y 2825 (`mb-7`) · row y 2873 h 36

```
div.flex.flex-wrap.items-center.gap-x-8.gap-y-4          gap-x 32, gap-y 16
└── a.group.inline-flex.items-center.gap-3
    ├── img.h-9.w-9.shrink-0.rounded-lg.border.border-gray-200.bg-white.object-contain.p-1.5   36×36
    │   (or div.flex.h-9.w-9…rounded-lg…text-[18px].leading-none   for the emoji placeholder)
    └── div
        ├── div.text-[13px].font-medium.leading-snug.text-ink.group-hover:text-gray-500
        └── div.font-mono.text-[10px].uppercase.tracking-wider.text-gray-400
```

### 4.15 `GithubGraph` — `section#github.py-14`

y 2965 · h 271 · header y 3021 (`mb-6`) · graph y 3065 h 82 · caption y 3164

```
a.group.block > svg                               w 624, 7 rows, 12px pitch
p.mt-4.font-mono.text-[11px].uppercase.tracking-wider.text-gray-400
  "2,723 contributions in the last year"
```
Render server-side from the GitHub contributions API; on failure render the header row only.

### 4.16 `Footer`

```
footer.mx-auto.max-w-2xl.px-6.py-10
└── div.flex.items-center.justify-between.border-t.border-gray-200.pt-6
    ├── p.font-mono.text-[11px].text-gray-400        © 2026 <Your Name>
    └── a.font-mono.text-[11px].text-gray-400.hover:text-ink   ← back to site
```

---

## 5. Custom CSS port

All of the following ships in `globals.css`. These are **not** Tailwind utilities and
have no Tailwind equivalent — port them verbatim.

### 5.1 Theme switch
```css
.theme-switch { display:inline-flex; align-items:center; gap:1px; padding:2px;
                border:1px solid rgb(var(--g200)); border-radius:9999px; }
.theme-opt    { display:inline-flex; align-items:center; justify-content:center;
                width:1.35rem; height:1.35rem; border-radius:9999px;
                color:rgb(var(--g400)); transition:color .2s, background-color .2s; }
.theme-opt:hover      { color:rgb(var(--ink)); }
.theme-opt.is-active  { background:rgb(var(--g100)); color:rgb(var(--ink)); }
.theme-opt svg        { width:13px; height:13px; }
```

### 5.2 Halftone + masks
```css
.halftone       { background-image: radial-gradient(circle at center, rgba(10,10,10,.9) 1px, transparent 1.6px);
                  background-size: 9px 9px; }
.halftone-dense { background-size: 6px 6px; }
.halftone-wide  { background-size: 13px 13px; }
.halftone-fine  { background-image: radial-gradient(circle at center, rgba(10,10,10,.9) .8px, transparent 1.3px);
                  background-size: 5px 5px; }
.mask-tr       { mask-image: radial-gradient(ellipse 80% 80% at 100% 0%, #000 0%, transparent 65%); }
.mask-bl       { mask-image: radial-gradient(ellipse 80% 80% at 0% 100%, #000 0%, transparent 65%); }
.mask-l        { mask-image: radial-gradient(ellipse 70% 60% at 0% 50%, #000 0%, transparent 70%); }
.mask-circle   { mask-image: radial-gradient(circle at center, #000 35%, transparent 70%); }
.mask-fade-x   { mask-image: linear-gradient(to right, transparent, #000 30%, #000 70%, transparent); }
.mask-up       { mask-image: linear-gradient(to top, #000, transparent 80%); }
.mask-down     { mask-image: linear-gradient(to bottom, #000, transparent); }
.photo-dissolve      { mask-image: linear-gradient(to top, transparent 1%, #000 33%); }
.photo-fade-bottom   { mask-image: linear-gradient(to top, transparent 0%, #000 45%); }
/* + -webkit-mask-image duplicates for Safari */
html.dark .halftone, html.dark .halftone-dense, html.dark .halftone-wide {
  background-image: radial-gradient(circle at center, var(--halftone) 1px, transparent 1.6px); }
html.dark .halftone-fine { background-image: radial-gradient(circle at center, var(--halftone) .8px, transparent 1.3px); }
html.dark .dither-corner { filter: invert(1); }
```

### 5.3 Entrance
```css
@keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
.reveal { opacity:0; animation: fadeUp .7s cubic-bezier(.16,1,.3,1) forwards; }
.d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.19s}
.d4{animation-delay:.26s}.d5{animation-delay:.33s}.d6{animation-delay:.40s}
@media (prefers-reduced-motion: reduce) { .reveal { opacity:1 !important; animation:none !important } }

@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
.pulse-dot { animation: blink 1.8s ease-in-out infinite; }

a, button { transition: color .2s, background-color .2s, border-color .2s, opacity .2s, transform .2s; }
.rec-quote { font-family: var(--font-source-serif-4), Georgia, 'Times New Roman', serif; }
```

### 5.4 Card deck
```css
.deck { position:relative; height:19rem; margin-inline:calc(50% - 50vw);
        overflow-x:clip; overflow-y:visible; }
@supports not (overflow-x: clip) { .deck { overflow-x:hidden } }
@media (min-width:640px)  { .deck { height:17rem } }
@media (min-width:768px)  { .deck { margin-inline:0; overflow:visible } }

.deck-card { position:absolute; top:.75rem; left:50%; width:18rem; margin-left:-9rem;
             transform-origin:center bottom;
             transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .35s ease;
             will-change:transform; outline:none; }
@media (min-width:640px) { .deck-card { width:20.5rem; margin-left:-10.25rem } }

.deck-card.is-center { transform:translateY(0) rotate(0deg) scale(1); z-index:30;
                       box-shadow:0 26px 55px -22px rgba(10,10,10,.30); }
.deck-card.is-left   { transform:translateX(-40%) translateY(14px) rotate(-16deg) scale(.88); z-index:10;
                       box-shadow:0 16px 32px -18px rgba(10,10,10,.25); cursor:pointer; }
.deck-card.is-right  { transform:translateX(40%)  translateY(14px) rotate(16deg)  scale(.88); z-index:20;
                       box-shadow:0 16px 32px -18px rgba(10,10,10,.25); cursor:pointer; }
.deck-card.is-left::after, .deck-card.is-right::after {
  content:''; position:absolute; inset:0; border-radius:inherit;
  background:rgb(var(--bg) / .4); transition:background .35s ease; pointer-events:none; }
.deck-card.is-left:hover::after, .deck-card.is-right:hover::after { background:rgb(var(--bg) / 0) }
.deck-card.is-center:hover { transform:translateY(-7px) scale(1.015);
                             box-shadow:0 34px 65px -22px rgba(10,10,10,.34); }
.deck-card.is-left:hover   { transform:translateX(-45%) translateY(2px) rotate(-12deg) scale(.92); z-index:25 }
.deck-card.is-right:hover  { transform:translateX(45%)  translateY(2px) rotate(12deg)  scale(.92);  z-index:25 }
.deck-card:not(.is-center) a { pointer-events:none }
```

### 5.5 Presence (drawer + sidebar)
```css
.presence-avatar { width:19px; height:19px; border-radius:50%; flex:none;
                   background:rgb(var(--g100));
                   box-shadow:0 0 0 1.5px rgb(var(--bg)), 0 0 0 2.5px rgb(var(--g200)); }
.presence-icons > .presence-avatar + .presence-avatar { margin-left:-6px }
.presence-more { display:inline-flex; align-items:center; justify-content:center;
                 min-width:19px; height:19px; margin-left:-6px; padding:0 5px;
                 border-radius:999px; background:rgb(var(--g200));
                 box-shadow:0 0 0 1.5px rgb(var(--bg)), 0 0 0 2.5px rgb(var(--g300));
                 color:rgb(var(--g500)); font-size:9px; font-weight:600; line-height:1; }
.presence-label { font-family: var(--font-geist-pixel), var(--font-geist-mono), monospace; }
.presence-num   { font-weight:700; color:rgb(var(--ink)) }

#mobileNav { opacity:0; transition:opacity .3s ease }
#mobileNav.is-open { opacity:1 }
#mobileNav .mnav-group { opacity:0; transform:translateY(12px);
                         transition:opacity .45s ease, transform .45s cubic-bezier(.16,1,.3,1); }
#mobileNav.is-open .mnav-group { opacity:1; transform:none }
```

### 5.6 Theme transition
```css
html.theme-anim, html.theme-anim *, html.theme-anim *::before, html.theme-anim *::after {
  transition: background-color .5s ease, border-color .5s ease, color .5s ease,
              fill .5s ease, stroke .5s ease, box-shadow .5s ease, outline-color .5s ease !important; }
::view-transition-old(root), ::view-transition-new(root) { animation:none; mix-blend-mode:normal }
@media (prefers-reduced-motion: reduce) {
  html.theme-anim, html.theme-anim * { transition:none !important } }
```

### 5.7 Page enter (inner pages)
```css
@keyframes pageEnterFadeUp { from { transform:translateY(10px) } to { transform:none } }
@media (prefers-reduced-motion: no-preference) {
  .page-enter-motion { animation: pageEnterFadeUp 420ms cubic-bezier(.2,0,0,1) both !important } }
```

### 5.8 Overlays — Ask, Chat, Typing, Guide cursor
Port from `docs/reference/bryllim-inline-styles.css.txt` (STYLE 3–6, 8). Full values
already captured; reproduce unchanged. Key anchors:

| Overlay | z | Backdrop | Content | Open transition |
|---|---|---|---|---|
| Ask | 100 | `rgb(g50/.82)` + `blur(12px)` | `max-w:760px`, `padding-left: clamp(1.5rem,9vw,8rem)`, left-aligned | `opacity .45s ease .1s` + `translateY(12px)→0` `.55s cubic-bezier(.16,1,.3,1) .1s` |
| Chat | 110 | `rgb(g50/.82)` + `blur(12px)` | `max-w:640px`, same padding-left | `opacity .4s ease .05s` + `translateY(12px)→0` `.5s … .05s` |
| Typing | 115 | `rgb(g50/.82)` + `blur(13px)`; dark `rgb(bg/.92)` | `max-w:880px`, centred | `opacity .45s ease .05s` + `translateY(16px) scale(.99)→none` `.55s … .05s` |
| Guide | 90 / 80 | — | spring-followed cursor | `SPRING 190`, `DAMPING 2√190×0.82` |

All four close with a distinct reverse: `.is-closing` → `opacity .26s ease`, `transform .3s cubic-bezier(.4,0,1,1)`.

---

## 6. Motion & interaction inventory

| Interaction | Trigger | Spec |
|---|---|---|
| Reveal on load | above-fold | `fadeUp .7s cubic-bezier(.16,1,.3,1)`, delays `.05→.40s` |
| Page enter | route change | `pageEnterFadeUp 420ms cubic-bezier(.2,0,0,1)` |
| Link/button hover | pointer | `color/bg/border/opacity/transform .2s` |
| Blog row hover | pointer | `bg-gray-50/80` + title → `text-gray-500` |
| Tag hover | pointer | `border-gray-500` + `text-ink` |
| Cert / rec card hover | pointer | `translateY(-0.5)` + bigger shadow (`.transition` = 150ms default) |
| Deck slot change | click side card | `transform .5s cubic-bezier(.22,1,.36,1)`, `box-shadow .35s ease` |
| Deck hover lift | pointer | transforms above; side cards also `z-index: 25` |
| Theme switch | click | View Transition circle 540ms `cubic-bezier(.32,.08,.24,1)`; fallback crossfade 500ms |
| Drawer open | hamburger | `opacity .3s ease`; groups stagger 0.05–0.23s |
| Modal | stat click / esc | backdrop `opacity .2s`, panel `scale-95→1` + `opacity 200ms` |
| Gaze portrait | pointermove | 9-way swap, `0.18×width` dead zone, rAF-throttled, reduced-motion → `center` |
| Guide tour | load / `?tour` | rAF spring, types via `Intl.Segmenter` |
| Caret blink | typing | `caretBlink 1.06s step-end infinite` / `tt-blink 1.05s ease-in-out` |

**Global reduced-motion contract:** every animated path must have a no-motion
equivalent. The reference enforces it via `@media (prefers-reduced-motion: reduce)`
overrides, not JS detection. Mirror that.

---

## 7. Accessibility requirements

Derived from the reference's actual semantics, not invented:

- Skip-to-content link (add — the reference lacks one; required for WCAG 2.4.1).
- Sidebar `<nav>`; mobile drawer is a labelled `<div>` → convert to `<nav aria-label="Mobile">`.
- Hamburger `aria-label="Open menu"`; close `aria-label="Close menu"`.
- Theme switch `role="group" aria-label="Theme"`; each option `aria-label="System theme"` etc.
- Sound toggle `aria-pressed` + `aria-label="Enable interface sounds"`.
- Overlays: `role="dialog" aria-modal="true"` + `aria-label`. **The reference does not trap focus — you must.**
- `Esc` closes Ask, Chat, Typing, and the modal.
- Decorative halftone layers carry `aria-hidden="true"`.
- Focus rings: reference has almost none. Add a consistent `:focus-visible` ring — a deliberate, documented improvement.
- Colour contrast: `--g400` (`#a3a3a3`) on white fails AA for body text. Use `--g500`+ for anything under 14px, or accept it to match the reference. **Decision: match the reference**, note as a known deviation from AA.
- Target size: nav links are ~19.5px tall — below the 44px AA target. Add `padding-block` in the drawer only, where there is room.

---

## 8. Content mapping — reference → you

| Reference slot | Your content | Rule |
|---|---|---|
| Name | Emmanuel Joshua Felipe | — |
| Role | Aspiring Data Analyst and Data Engineer | — |
| Hero ¶1 | One sentence: what you analyse/build | No tool-name salad |
| Hero ¶2 | What you're learning / looking for | Honest framing |
| Socials | GitHub, LinkedIn, email | 3 items, same `↗` treatment |
| LogoStrip | *(omitted)* | — |
| StatStrip | *(omitted)* | — |
| Blog rows | Your notes / write-ups | Real titles, or `[Post title — placeholder]` |
| Project cards | Your real projects | 3 for the deck; add icon + 1–2 store/repo links |
| Experience rows | Your real roles | If no work history, use education/coursework in this slot — keep 4 rows so the layout matches |
| Stack chips | Python, SQL, PostgreSQL, dbt, pandas, Power BI, Airflow, Docker, Git | ~11 chips + `+ more` |
| Certification cards | Your real certs | 3 cards; `[Certification name]` until then |
| Affiliations | Your orgs / communities | Real ones only |
| GitHub | Your `@handle` | Live graph; hide section if unavailable |
| Recommendations | *(omitted)* | — |
| Footer | © 2026 Emmanuel Joshua Felipe | — |
| Tour lines | 12 lines in your voice | Same 12 targets, same order |
| Ask overlay | Answers about your data work | Same terminal aesthetic |
| Contact form | `/contact` | New page — see §9 |

### Placeholder convention
Every placeholder is **visually obvious**: bracketed title, muted `--g400`,
and a `data-placeholder` attribute so a final audit can find them all:
```tsx
<span data-placeholder class="text-gray-400">[Post title — placeholder]</span>
```

---

## 9. Page inventory for Wave A

| Route | Container | Status |
|---|---|---|
| `/` | `max-w-2xl` | Build first |
| `/projects` | `max-w-2xl` | Wave A |
| `/experience` | `max-w-2xl` | Wave A |
| `/stack` | `max-w-3xl` | Wave A |
| `/blog` | default | Wave A |
| `/blog/[slug]` | default | Wave A |
| `/contact` | `max-w-3xl` | Wave A — **new**; the reference puts this on `/collabs`; you have no collabs page, so a dedicated `/contact` is the honest equivalent. Match `/collabs`' form markup exactly. |
| `/certifications` | `max-w-4xl` | Wave C |
| `/affiliations` | `max-w-2xl` | Wave C |
| `/resources` | `max-w-4xl` | Wave C (optional — data/learning resources fit a data portfolio) |
| `/admin/*` | — | Wave C, separate design |

**Excluded:** `/shop`, `/gear`, `/collabs`, `/consulting`, `/recommendations`, `/presentation`.
Remove these from the sidebar nav rather than leaving dead links.

---

## 10. Acceptance criteria

A component is done when all hold:

1. Measured box matches §4 to **±2px** at the reference's viewport.
2. Computed font family, size, weight, line-height, and colour match §3 exactly.
3. Dark mode swaps via the token set only — no component-level colour overrides.
4. Layout correct at **390 / 640 / 904 / 1440**.
5. Every animation matches §6 timing, and has a reduced-motion fallback.
6. Keyboard reachable, `:focus-visible` ring visible, `Esc` closes overlays.
7. No horizontal scrollbar at 390px.
8. Placeholders all carry `data-placeholder`.
9. Lighthouse a11y ≥ 95, CLS = 0.
10. Screenshot diff vs. `docs/reference/*.png` reviewed and signed off.

---

## 11. Known deviations from the reference

| # | Deviation | Reason |
|---|---|---|
| 1 | LogoStrip, StatStrip, RecommendationGrid omitted | Claims you cannot substantiate |
| 2 | Sections renumbered 01–06 | Consequence of #1 |
| 3 | Sidebar links reduced to Wave A + Wave C | No dead links |
| 4 | Skip link, focus rings, focus trap added | WCAG; reference lacks them |
| 5 | `/contact` instead of `/collabs` form | No collabs page to host it |
| 6 | AA contrast failures reproduced | Fidelity over compliance, as instructed |
| 7 | Guide tour copy rewritten | His words are not yours |
| 8 | Community chat simplified to a Supabase-backed list | No fake multiplayer |
| 9 | Playground game omitted | Separate project, not portfolio UI |
