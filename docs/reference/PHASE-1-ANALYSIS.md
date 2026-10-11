# Phase 1 — Reference Analysis: bryllim.com

Inspected 2026-10-11. All values below were read directly from the live site:
DOM + computed styles, the compiled stylesheet (`/css/site.css`), and the served
HTML/CSS/JS. Items that could not be confirmed are listed in §10.

---

## 1. What the site actually is

- Server-rendered HTML (Laravel-style: `csrf-token` meta, form actions). **Not** Next.js, not an SPA.
- Styling is **Tailwind CSS v3.4.19** compiled to one static file `/css/site.css` (57 KB, utilities only),
  plus **9 inline `<style>` blocks** holding all custom CSS (~36 KB).
- No JS framework. One external script `/js/site-sounds.js`; everything else is ~10 inline vanilla JS IIFEs (~108 KB).
- Fonts: Google Fonts `Geist` (100–900), `Geist Mono` (300–600), `Source Serif 4` (400/500/600).
  One self-hosted pixel display face, **Geist Pixel**, from jsDelivr.

## 2. Design tokens (exact values)

### Colour system
Driven entirely by CSS custom properties on `:root` / `html.dark`. Tailwind colours are remapped to these RGB triplets.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `255 255 255` | `12 12 15` |
| `--ink` | `10 10 10` | `244 244 245` |
| `--g50` | `250 250 250` | `24 24 27` |
| `--g100` | `245 245 245` | `30 30 34` |
| `--g200` | `233 233 233` | `42 42 48` |
| `--g300` | `212 212 212` | `58 58 66` |
| `--g400` | `163 163 163` | `138 138 146` |
| `--g500` | `115 115 115` | `160 160 168` |
| `--g600` | `82 82 82` | `184 184 192` |
| `--g700` | `64 64 64` | `206 206 212` |
| `--g800` | `38 38 38` | `228 228 232` |
| `--g900` | `23 23 23` | `240 240 243` |
| `--g950` | `10 10 10` | `250 250 250` |

Secondary accents present in CSS: `#EDEDEC`, `#A1A09A`, `#1C1C1A`, `#F61500`, `#FF4433`, `#3E3E3A`, `#62605b`.
`::selection` light `#0a0a0a`/`#fff`, dark `#fafafa`/`#0a0a0a`. `theme-color` meta `#0a0a0a`.

### Typography (computed styles)

| Element | Font | Size | Weight | Line-height |
|---|---|---|---|---|
| `h1` hero name | Geist Pixel | `2.6rem` / 41.6px (sm+), `1.875rem` base | 400 | 1.0 |
| Section heading `01 — blog` | Geist Pixel | `0.875rem` / 14px | 400 | 20px |
| Inner-page `h1` | Geist Pixel | `1.5rem` / 24px | 400 | 1 |
| Project card title | Geist Pixel | `1rem` / 16px | 400 | 1.25 |
| Stat number | Geist Pixel | `1.125rem` / 18px | 400 | 1 |
| Nav wordmark | Geist Pixel | 15px desktop / 14px mobile | 400 | 1 |
| Body / blog excerpt | Geist | 14px | 400 | 20px |
| Blog row title | Geist | 15px | 500 | 22.5px |
| Hero paragraph | Geist | 15px | 400 | 1.625 |
| Card description | Geist | 13px | 400 | 1.625 |
| Recommendation quote | Source Serif 4 | 13.5px | 400 | 1.625 |
| Nav links (mono) | Geist Mono | 13px | 400 | 19.5px |
| Meta / labels | Geist Mono | 11px uppercase | 400 | tracking-wider |
| Pills / tags | Geist Mono | 9px uppercase | 400 | 13.5px, ls 0.45px |
| Timestamp | Geist Mono | 12px | 400 | 18px |

### Halftone dot texture — the visual signature (pure CSS, no images)

```css
.halftone       { background-image: radial-gradient(circle at center, rgba(10,10,10,.9) 1px, transparent 1.6px); background-size: 9px 9px; }
.halftone-dense { background-size: 6px 6px; }
.halftone-wide  { background-size: 13px 13px; }
.halftone-fine  { radial-gradient(... 0.8px, transparent 1.3px); background-size: 5px 5px; }
```
Dark mode uses `var(--halftone)` = `rgba(244,244,245,0.42)`.
Masks: `.mask-tr .mask-bl .mask-l .mask-circle .mask-fade-x .mask-up .mask-down .photo-dissolve .photo-fade-bottom .edge-fade-divider`.

### Global background layer

```html
<div aria-hidden class="pointer-events-none fixed inset-0 z-0">
  <div class="halftone halftone-wide mask-tr absolute right-0 top-0 h-[70vh] w-[65vw] opacity-[0.16]"></div>
  <div class="halftone mask-bl absolute bottom-0 left-0 h-[60vh] w-[55vw] opacity-[0.13]"></div>
</div>
```

## 3. Homepage structure (exact order)

```
body.relative.overflow-x-hidden.bg-white.font-sans.text-ink.antialiased
main#top.relative.z-10.lg:pl-56
└── div.mx-auto.max-w-2xl.px-6                     ← 672px content column
    ├── section.relative.pt-20.pb-16.sm:pt-28            HERO
    ├── section.border-t.border-gray-200.py-5            LOGOS
    ├── section.grid.grid-cols-3.divide-x.border-t       STATS
    ├── div.halftone.halftone-wide.mask-fade-x.h-6       divider
    ├── section#blog.py-14                               01 — blog
    ├── section#projects.py-14                            02 — projects (card deck)
    ├── section#experience.py-14                          03 — experience (+ Stack)
    ├── section#certifications.py-14                      04 — certifications
    ├── section#recommendations.py-14                     05 — recommendations
    ├── section#affiliations.py-14                        06 — affiliations
    ├── section#github.py-14                              07 — github
    └── div.halftone.halftone-wide.mask-fade-x.mb-16      footer halftone
```

Page height: **3348px** @1440, **4658px** @390.
Section y-offsets @1440: hero 53 · logos 517 · stats 590 · blog 722 · projects 1149 ·
experience 1585 · certifications 2035 · recommendations 2367 · affiliations 2769 ·
github 2965 · footer 3244.

### Hero

```html
<section class="relative pt-20 pb-16 sm:pt-28">
  <div class="grid gap-9 sm:grid-cols-[18rem_1fr] sm:items-start sm:gap-10">
    <div class="reveal d1 mx-auto w-full max-w-[18rem] sm:mx-0">
      <div class="relative"><img id="profile-gaze" class="block h-auto w-full select-none"></div>
    </div>
    <div>
      <h1 class="reveal d2 font-pixel text-3xl leading-none sm:text-[2.6rem]">Bryl Lim</h1>
      <p class="reveal d3 mt-6 text-[15px] leading-relaxed text-gray-600">…</p>
      <p class="reveal d4 mt-5 text-[15px] leading-relaxed text-gray-600">…</p>
      <div class="reveal d5 mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[12px] text-gray-500">
        <a class="hover:text-ink">github ↗</a> …
      </div>
    </div>
  </div>
</section>
```
Portrait is 288×288 square, `max-w-[18rem]`; centred below `sm`, fixed `18rem` column at `sm+` with 40px gap.

## 4. Navigation & chrome

### Desktop sidebar (`lg:` only, ≥1024px)

```html
<nav data-guide="sidebar"
     class="fixed inset-y-0 left-0 z-50 hidden w-56 flex-col border-r border-gray-200 bg-white px-7 py-8 lg:flex">
```
`w-56` = **224px**, compensated by `lg:pl-56` on main. Padding 28px / 32px.

1. Wordmark (Geist Pixel 15px, `leading-none`) → `/`
2. `mt-9 flex flex-1 flex-col gap-4 overflow-y-auto font-mono text-[13px]`, split by `h-px bg-gray-200` into 3 groups (`gap-2.5`):
   - Group 1: Shop (bag), Blog (rect-lines), Gear (monitor), Resources (open book)
   - Group 2: Collabs (people), Consulting (briefcase)
   - Group 3 (no icons): Projects, Experience, Stack, Certifications, Recommendations, Affiliations
   - Link: `relative inline-flex w-fit items-center gap-2.5 text-gray-500 hover:text-ink`, icon `h-[1.15em] w-[1.15em]`, stroke-width 1.6
   - **Active page adds `pl-6`** (verified on every inner page)
3. `Ask anything` + `Alt`+`K` kbd hint
4. `Typing test` + `Alt`+`J` kbd hint
5. Presence `mt-4 border-y border-gray-200 py-3.5`: 3 DiceBear avatars 19px (−6px overlap) + `+5` pill; `N people viewing now`; `community chat` button
6. Footer `mt-6 shrink-0`: theme switch (system/light/dark pill) + sound toggle (30px round), then `For work, collabs & everything else, reach me at` / mailto

### Mobile header (below `lg`)

```html
<header class="sticky top-0 z-50 border-b border-gray-200/70 bg-white/90 backdrop-blur-md lg:hidden">
  <div class="mx-auto flex max-w-3xl items-center justify-between px-6 py-3"> … hamburger h-5 w-5, stroke 1.6
```
Measured height **53px**. Calls `openMobileNav()`.

### Mobile drawer
`#mobileNav` — `fixed inset-0 z-[60] hidden flex-col bg-white lg:hidden`, fade `.is-open` 0.3s.
`font-mono text-[16px]`, `gap-4`, `text-gray-700`, `px-7 py-8`, `my-5` separators,
`.mnav-group` staggered `transition-delay` 0.05 / 0.11 / 0.17 / 0.23s.

### Footer

```html
<footer class="mx-auto max-w-2xl px-6 py-10">
  <div class="flex items-center justify-between border-t border-gray-200 pt-6">
    <p class="font-mono text-[11px] text-gray-400">© 2026 Bryl Lim</p>
    <a href="/" class="font-mono text-[11px] text-gray-400 hover:text-ink">← back to site</a>
```

## 5. Responsive behaviour (measured at 390 / 904 / 1440)

Only two breakpoints in use: `sm` = 640px, `lg` = 1024px. No `md`-driven homepage layout.

| Element | <640 | 640–1023 | ≥1024 |
|---|---|---|---|
| Sidebar | hidden | hidden | fixed 224px |
| Mobile header | sticky 53px | sticky 53px | hidden |
| Content | `px-6` gutters | same | `lg:pl-56` + centred 672px |
| Hero | stacked, portrait centred | `18rem` + `1fr`, 40px gap | same |
| Logo strip | 3 cols, icon above text | 3 cols, horizontal | same |
| Logo sub-label | `9px` | `10px` | `10px` |
| Experience row | stacked `col-span-2/10/12` | 2/6/4, company right | same |
| Certifications | 1 col | 3 cols | 3 cols |
| Recommendations | 1 col | 3 cols | 3 cols |
| Card deck | full-bleed `margin-inline: calc(50% - 50vw)`, `overflow-x: clip`, height `19rem`, card `18rem` | height `17rem`, card `20.5rem` | `margin-inline: 0`, `overflow: visible` |
| Guide cursor | off | off | on (fine pointer + no reduced-motion) |
| Playground canvas | off | off | on (≥1024px) |

## 6. Animations (exact values)

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
.reveal { opacity:0; animation: fadeUp .7s cubic-bezier(.16,1,.3,1) forwards; }
.d1 .05s  .d2 .12s  .d3 .19s  .d4 .26s  .d5 .33s  .d6 .40s

a, button { transition: color .2s, background-color .2s, border-color .2s, opacity .2s, transform .2s; }

@keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.25} }
.pulse-dot { animation: blink 1.8s ease-in-out infinite; }
```

### Card deck

```css
.deck { position:relative; height:19rem; margin-inline:calc(50% - 50vw); overflow-x:clip; overflow-y:visible }
.deck-card { position:absolute; top:.75rem; left:50%; width:18rem; margin-left:-9rem;
             transform-origin:center bottom;
             transition: transform .5s cubic-bezier(.22,1,.36,1), box-shadow .35s ease }
.is-center { transform:translateY(0) rotate(0) scale(1);   z-index:30; box-shadow:0 26px 55px -22px rgba(10,10,10,.30) }
.is-left   { transform:translateX(-40%) translateY(14px) rotate(-16deg) scale(.88); z-index:10; cursor:pointer }
.is-right  { transform:translateX(40%)  translateY(14px) rotate(16deg)  scale(.88); z-index:20; cursor:pointer }
.is-left:hover  { transform:translateX(-45%) translateY(2px) rotate(-12deg) scale(.92); z-index:25 }
.is-right:hover { transform:translateX(45%)  translateY(2px) rotate(12deg)  scale(.92);  z-index:25 }
.is-center:hover{ transform:translateY(-7px) scale(1.015); box-shadow:0 34px 65px -22px rgba(10,10,10,.34) }
.deck-card:not(.is-center) a { pointer-events:none; }
```
Clicking a side card swaps `is-center` with that slot.

### Theme switch
View Transitions API — circular wipe from click point:
```js
root.animate({ clipPath: ['circle(0px at Xpx Ypx)', 'circle(Rpx at Xpx Ypx)'] },
             { duration: 540, easing: 'cubic-bezier(.32,.08,.24,1)', pseudoElement: '::view-transition-new(root)' })
```
Fallback = `.theme-anim` crossfade, 0.5s on bg/border/color/fill/stroke/box-shadow, removed after 520ms.
Pref in `localStorage.theme` = `system|light|dark`, applied pre-paint (no FOUC).

### Hero portrait gaze tracking
`#profile-gaze` swaps `src` between 9 pre-rendered WebP variants (`center`, `up`, `up-right`, `right`, `down-right`, `down`, `down-left`, `left`, `up-left`) by pointer angle from face centre, 45° sectors, dead zone `0.18 × width`.

## 7. Interactive systems

| Feature | Trigger | Behaviour |
|---|---|---|
| **Guide tour** | once per browser session (`sessionStorage.guideTourSeen`) or `?tour` | Arrow cursor + typing name tag walks 12 `data-guide` targets. Desktop-only. Text types via `Intl.Segmenter` graphemes. |
| **Ask overlay** | `Alt+K` / `⌘K` | Blurred backdrop, Geist Pixel prompt `what do you want to ask?`, loader, hidden 1×1 input, typed echo, blinking caret, blur-reveal data dump. |
| **Community chat** | Sidebar / mobile nav | Live multi-visitor chat. Asks name first, then messages. DiceBear avatars. Blocks links + offensive words. 60-message cap, edge fades, inline edit/delete. 4s poll. |
| **Typing test** | `Alt+J` | 26 words, on-screen keyboard, live WPM/ACC/time, results vs. owner's 140 WPM. `Tab` restart, `Esc` close. |
| **Playground game** | after joining chat | Canvas pixel game, 460×380, 18×18 map, sprites from `/images/game/`, WASD/arrows, other visitors as NPCs at 0.6 alpha. |
| **Stat modals** | click stat tiles | `#modal`, 3 panels: `email` (copy), `community`, `hackathons`. Backdrop `bg-ink/30 backdrop-blur-md`, panel `scale-95 → 1` over 200ms. |
| **Interface sounds** | sound toggle | `site-sounds.js`, off by default. Buttons carry `data-cuelume-hover/press/release`. |
| **GitHub graph** | `#github` | Server-rendered SVG contribution grid → `@bryllim`. |

## 8. Inner pages

Shared shell: `div.relative.z-10.mx-auto.{max-w-*}.px-6.py-14.sm:py-20` inside `div.lg:pl-56`.
Header pattern: `h1.font-pixel.text-2xl.leading-none` (lowercase) + `p` 15px relaxed `text-gray-600` `max-w-xl`.

| Page | Container | Structure |
|---|---|---|
| `/projects` | `max-w-2xl` | 3 app cards (64px icon, store badges, `edge-fade-divider` "Featured in"), 1 video case study (`aspect-video` iframe), `project-stack` list rows |
| `/blog` | default | h1 + list/grid toggle; rows: ~132px thumbnail, date, title, excerpt, `Read · N min`; pagination `prev / 1 2 / next` |
| `/experience` | `max-w-2xl` | Vertical timeline: 48px monogram + connector, company 16px semibold, mono meta, location, nested roles with `border-l pl-6` |
| `/stack` | `max-w-3xl` | Grouped sections, `.tag` pills |
| `/certifications` | `max-w-4xl` | Grouped sections, `.cert-card` grid 2/3/4 cols |
| `/recommendations` | `max-w-4xl` | Masonry `columns-1 sm:columns-2 lg:columns-3`, serif blockquotes |
| `/affiliations` | `max-w-2xl` | Gradient cards, giant 64px Geist Pixel watermark bleeding bottom-right + `mask-tr` halftone |
| `/gear` | `max-w-4xl` | Sections, 2–3 col grid, square image tiles + bordered caption |
| `/shop` | `max-w-4xl` | 2–3 col `.shop-card`, `aspect-[4/3]` cover, "Free" badge |
| `/resources` | `max-w-4xl` | Grouped link lists, 2 cols |
| `/consulting` | `max-w-3xl` | 5 service cards, 2 cols, `dither-corner` + icon watermark |
| `/collabs` | `max-w-3xl` | Grayscale→colour logo wall, world map, **contact form** |
| `/presentation` | full-bleed | 16 full-screen slides, own `main.presentation` |

The **contact form exists only on `/collabs`**.

## 9. Head / SEO

`og:type=website`, `og:image` 1200×630, `twitter:card=summary_large_image`, canonical.
JSON-LD `@graph` (Person / WebSite / ProfilePage with `hasPart` BlogPostings).
`llms.txt`, `feed.json`, `feed.xml`, `sitemap.xml`, `robots.txt`, favicons `?v=2`.

## 10. Unverified — needs input

1. **Geist Pixel licence** — served from a public GitHub CDN. Redemption terms unconfirmed.
2. **Portrait gaze images** — 9 directionally-matched photos of the original owner.
3. **Overlay motion curves** — CSS values read from source; guide-cursor spring (`SPRING=190`, `DAMPING=2√SPRING×0.82`) and type-on speed inferred from source, not confirmed frame-by-frame.
4. **Chat / playground multiplayer feel** — read from source, not exercised with a second real visitor.
5. **Lengths of the 14 blog posts and `/presentation` slides** — not individually measured.
