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

> ⚠️ **Never run `npm run build` while `npm run dev` is running.** They share the
> `.next` directory; the build overwrites the dev server's chunks and you get
> `Cannot find module './NNN.js'` and a missing `routes-manifest.json`. Stop the
> dev server (Ctrl+C) first, or build in a separate clone.

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

## Content: where it comes from

Reads fall through three tiers, **per collection**, so the site always has
something to lay out and nothing disappears silently:

```
1. Supabase      — when the keys are valid and the schema has been run
2. content/content.json — written by the admin dashboard
3. src/lib/fixtures.ts  — the built-in placeholders
```

The tiers are consulted *per collection* rather than per backend on purpose:
right after `0001_init.sql` runs, Supabase answers but every table is empty. A
backend-level check would blank the site at exactly that moment. Instead reads
fall through to the local store, and the admin **Overview** shows the mismatch
and offers a one-click seed.

**The `/admin` Overview is the place to look** to see which tier is serving.

### Admin access

`/admin/login` accepts two gates:

| Gate | When | Notes |
|---|---|---|
| Supabase Auth | email supplied | Account must also be a row in `admins` |
| `ADMIN_PASSWORD` | email left blank | Always available, including when the DB is live |

The local password is deliberately kept working after the database comes online.
It is the recovery path: a lost Supabase account, a missing `admins` row, or an
Auth misconfiguration would otherwise lock you out of your own site.

`ADMIN_SESSION_SECRET` signs the session cookie. It is generated for you and you
never need to see it — only `ADMIN_PASSWORD` is something you type.

### Seeding Supabase

When the schema exists but the tables are empty, **Overview → Seed Supabase from
local content** copies `content/content.json` across. Each table is only written
if it is empty, so running it twice is harmless.

It re-mints ids, derives the `projects.slug` the schema requires, and inserts
children *after* their parents so the foreign keys resolve. The payloads are
verified against the live schema by:

```powershell
node scripts/verify-seed.mjs
```

which inserts everything, reports any table that rejects it, then rolls the whole
thing back. Run it after changing the schema or the local content.

### Rendering

Public pages are `force-dynamic` rather than statically generated. The reference
is a static site with no admin; we have a CMS behind these pages, and a
build-time snapshot would be wrong twice over — Vercel does not read
`.env.local` at build, so a static build bakes the placeholder fixtures into the
deployed HTML, and any admin edit would need a redeploy to appear.

---

## What is real vs placeholder

Everything currently renders from `src/lib/fixtures.ts` unless you edit it in
`/admin`. Every placeholder is bracketed **and** carries `data-placeholder`, so
auditing is one command:

```powershell
Select-String -Path src\**\*.tsx -Pattern 'data-placeholder'
```

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

1. Replace the placeholders in `src/lib/fixtures.ts`, or edit them in `/admin`
2. Grant yourself admin in Supabase (below), then seed it
3. Confirm `Alt+K` (Ask) and `Alt+J` (typing test) by hand — the automation
   browser cannot deliver key events
4. Deploy to Vercel

### Granting yourself admin

Supabase → Authentication → Users → **Add user**. Then in the SQL Editor:

```sql
insert into admins (user_id, email) values ('<user-id>', 'you@example.com');
```

`isAdmin()` accepts a Supabase session belonging to a row in `admins`, or the
local `ADMIN_PASSWORD` session. RLS enforces the same rule on every query, and
`requireAdmin()` guards every server action — that is the actual security
boundary, since middleware can be bypassed.

### Before deploying

- Set a real `ADMIN_PASSWORD`
- Rotate the leaked service-role key (below)
- Add the env vars to Vercel; `.env.local` is gitignored and will not deploy

### Rotating the service-role key

The key was pasted into a chat log during setup. **There is no `Reset` button**
— Supabase replaced the old UI. The current keys are the legacy JWT format
(`eyJ…`, expiring 2036) and keep working; rotation is optional but cheap.

1. Open
   `https://supabase.com/dashboard/project/<ref>/settings/api-keys`
   — note `api-keys`, not `api`. There is no longer a separate Settings → API page.
2. Switch to the **Publishable and secret API keys** tab. If your project is
   still on legacy keys only, the legacy tab is fine — create a **secret key**
   there instead.
3. **Create new secret key**, name it, and copy it.
4. Replace `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and restart the dev server.
5. Confirm the site and `/admin` still work.
6. **Only then** delete the old key. Deleting a secret key is irreversible.

Do not paste the new key into chat, and never into a screenshot.

**The code is already compatible with both key formats.** `supabase-js` handles
the new `sb_publishable_…` / `sb_secret_…` keys without configuration — its
Functions client already omits the key from the `Authorization` header, which is
where `Invalid JWT` would otherwise bite, and the data API accepts it there for
migration compatibility. Verify with:

```powershell
node scripts/verify-key-formats.mjs
```

which asserts the headers on both fetch paths for both formats. The explanation
for why no client option is needed lives above `admin()` in
`src/lib/supabase/admin.ts`.
