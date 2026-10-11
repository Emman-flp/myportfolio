# myportfolio

A recreation of the public UI at **bryllim.com**, with the original owner's
identity-specific content replaced by mine.

> Emmanuel Joshua Felipe — aspiring Data Analyst and Data Engineer.

Built from measured values, not guesswork. See `docs/` for the full trail:

| Document | What it holds |
|---|---|
| `docs/reference/PHASE-1-ANALYSIS.md` | Everything verified about the reference, and what could not be |
| `docs/UI-SPECIFICATION.md` | Normative spec: tokens, type scale, 16 component contracts, CSS port, motion, a11y, acceptance criteria |
| `docs/COMPONENT-MAP.md` | File tree, props, data flow, dependency decisions, gated build sequence |
| `docs/reference/` | Raw captures — HTML, compiled CSS, inline CSS/JS, reference screenshots |
| `docs/screenshots/` | Our implementation at matching viewports |

---

## ⚠️ Read this before running anything

**This project must NOT live inside OneDrive.**

The project was originally created at
`C:\Users\felip\OneDrive\Documents\myportfolio` and had to be moved, because
OneDrive's filesystem does not implement `readlink`. Next.js requires it and dies
with:

```
EINVAL: invalid argument, readlink '...\.next\static\<hash>'
```

It now lives at **`C:\Users\felip\dev\myportfolio`**.

If you ever move it, keep it off OneDrive and off any other cloud-sync folder.

---

## Prerequisites

Installed on this machine during setup:

| Tool | Version | Note |
|---|---|---|
| Node.js | 24.20.0 LTS | installed via `winget`, user scope |
| npm | 11.19.0 | ships with Node |
| Git | 2.55.0 | installed via `winget` |

**PowerShell blocks `npm.ps1` by default on this machine.** Use `npm.cmd`
(`npm.cmd run dev`, `npm.cmd install`) or `npx.cmd`. In the VS Code terminal the
same applies.

Both tools were installed to your **user** scope, so a fresh terminal picks them
up automatically. If `node -v` fails, restart VS Code.

---

## Running it

```powershell
cd C:\Users\felip\dev\myportfolio

npm.cmd run dev          # http://localhost:3000
npm.cmd run build        # production build
npm.cmd run typecheck    # tsc --noEmit
```

---

## Fidelity status

Measured in-browser against the live reference at **1440 / 768 / 390** px.

### Homepage geometry @1440 — exact

| Metric | Reference | Ours | Δ |
|---|---|---|---|
| Content column width | 672 | 672 | 0 |
| Hero section height | 464 | 464 | 0 |
| Hero grid columns | `18rem 1fr` | 288px 296px | 0 |
| Portrait | 288×288 | 288×288 | 0 |
| `h1` size / line-height | 41.6px / 41.6px | 41.6px / 41.6px | 0 |
| `h1` family | Geist Pixel | Geist Pixel | 0 |
| Blog section height | 428 | 428 | 0 |
| Projects section height | 436 | 436 | 0 |
| Deck height | 272 | 272 | 0 |
| Deck card width | 328 | 328 | 0 |
| Experience height | 450 | 450 | 0 |
| Affiliations height | 196 | 196 | 0 |
| Sidebar width | 224 | 224 | 0 |
| Certification grid | 3 × 200px | 3 × 200px | 0 |

### @390 — exact

| Metric | Reference | Ours |
|---|---|---|
| Column x / width | 24 / 327 | 24 / 327 |
| Mobile header height | 53 | 53 |
| Portrait | 288×288 at x 44 | 288×288 at x 44 |
| Deck position / size | x −7, 390×304 | x −7, 390×304 |
| Deck card width | 288 | 288 |
| `h1` size | 30px | 30px |
| Certifications | 1 × 327px | 1 × 327px |
| Horizontal scroll | none | none |

### Known deltas

| Δ | Cause |
|---|---|
| Page 2743px vs reference 3348px | Three sections intentionally removed (see below) |
| Certifications 324 vs 332px | Reference card titles wrap to 2 lines; placeholders are shorter |
| Hero height varies | Longer name wraps to 2 lines; placeholder paragraphs differ in length |

---

## Intentional removals

The reference leads with claims that cannot be honestly reproduced. Structure and
styling are preserved; the claims are not. See `docs/UI-SPECIFICATION.md` §11.

| Removed | Reason |
|---|---|
| Sponsor strip (Cognition / AMD AI / StellarPH) | Third-party sponsorships you do not hold |
| Stats strip (`300K+` / `8+ yrs` / `11x hackathon wins`) | Unverifiable metrics |
| Recommendations section (3 testimonials) | You have no testimonials |
| Playground game | Separate project, not portfolio UI |
| `/shop` `/gear` `/collabs` `/consulting` `/presentation` | Out of Wave A scope |

Sections therefore renumber `01–06`.

**Deliberate additions** (accessibility gaps in the reference): skip link,
visible focus ring, focus trap on dialogs.

**Known a11y deviation:** the reference's `--g400` (`#a3a3a3`) on white fails AA.
We reproduce it for fidelity, as instructed.

---

## What is real vs placeholder

Everything currently renders from `src/lib/fixtures.ts`. Every placeholder is
bracketed **and** carries `data-placeholder`, so auditing is one command:

```powershell
Select-String -Path src\**\*.tsx -Pattern 'data-placeholder'
```

To make a section live, edit its entry in `src/lib/fixtures.ts`. Supabase wiring
replaces this file in Phase 7 — the components already take props.

Unset values: `[EMAIL]`, `[GITHUB_URL]`, `[LINKEDIN_URL]`, `[GITHUB_USERNAME]`.

---

## Tech

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind **3.4.19**

Tailwind is pinned to **v3.4.19 on purpose** — it is the version the reference
compiled with, and the palette remap in `tailwind.config.ts` depends on v3's
`rgb(var(--token) / <alpha-value>)` pattern.

No animation library, no icon library, no UI kit. Every animation is CSS copied
from the reference; every icon is hand-matched inline SVG. Adding either would
change the pixels.

---

## Next steps

1. Replace the placeholders in `src/lib/fixtures.ts`
2. Build the Wave A inner pages (`/projects`, `/experience`, `/stack`, `/blog`, `/contact`)
3. Wave B overlays: Ask, Typing test, guide tour, modals
4. Supabase schema + RLS + admin dashboard
5. Deploy to Vercel
