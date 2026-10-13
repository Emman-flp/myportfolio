/**
 * Throwaway verification of `seedSupabase`'s payloads against the live schema.
 *
 * The uncertain part of seeding is whether the row shapes satisfy the tables'
 * columns, foreign keys and constraints — not the server-action wiring. So this
 * replays the exact rows the action would insert, in the same order, records
 * any error, then removes everything again so the database is left untouched.
 *
 * Run it after changing the schema or the local content:
 *
 *   node scripts/verify-seed.mjs
 *
 * Exits non-zero if any insert fails.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const content = JSON.parse(
  readFileSync(new URL('../content/content.json', import.meta.url), 'utf8'),
)

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item'

const report = []
const inserted = []
let failed = 0

/** Mirrors the action's `insert`: skips non-empty tables, records why. */
async function insert(table, rows) {
  if (!rows.length) {
    report.push({ table, inserted: 0, skipped: 0 })
    return []
  }

  const { count, error: countErr } = await db
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (countErr) {
    failed++
    report.push({ table, inserted: 0, skipped: 0, error: countErr.message })
    return null
  }
  if ((count ?? 0) > 0) {
    console.log(`skip ${table.padEnd(18)} already has ${count} row(s)`)
    return null
  }

  const { data, error } = await db.from(table).insert(rows).select('id')
  if (error) {
    failed++
    console.log(`FAIL ${table.padEnd(18)} ${error.message}`)
    report.push({ table, inserted: 0, skipped: rows.length, error: error.message })
    return null
  }

  inserted.push([table, data.map((r) => r.id)])
  report.push({ table, inserted: data.length, skipped: 0 })
  console.log(`  ok ${table.padEnd(18)} ${data.length} row(s)`)
  return data
}

await insert('profile', [
  {
    name: content.profile.name,
    tagline: content.profile.tagline,
    description: content.profile.description,
    paragraphs: content.profile.paragraphs,
    socials: content.profile.socials,
    email: content.profile.email,
    github_username: content.profile.githubUsername,
  },
])

const usedSlugs = new Set()
await insert(
  'projects',
  content.projects.map((p, i) => {
    let slug = slugify(p.title)
    while (usedSlugs.has(slug)) slug = `${slug}-${i}`
    usedSlugs.add(slug)
    return {
      slug,
      title: p.title,
      summary: p.summary ?? '',
      badges: p.badges ?? [],
      links: p.links ?? [],
      tags: p.tags ?? [],
      featured_in: p.featuredIn ?? [],
      video_url: p.videoUrl ?? null,
      icon_url: p.icon ?? null,
      published: true,
      sort_order: i,
    }
  }),
)

await insert(
  'project_stack',
  content.projectStack.map((r, i) => ({
    name: r.name,
    href: r.href,
    category: r.category,
    description: r.description,
    published: true,
    sort_order: i,
  })),
)

const orgs = await insert(
  'experience_orgs',
  content.experienceOrgs.map((o, i) => ({
    monogram: o.monogram,
    name: o.name,
    employment: o.employment,
    meta: o.meta,
    location: o.location,
    published: true,
    sort_order: i,
  })),
)

if (orgs) {
  await insert(
    'experience_roles',
    content.experienceOrgs.flatMap((o, oi) =>
      o.roles.map((r, i) => ({
        org_id: orgs[oi]?.id ?? null,
        period: r.period,
        title: r.title,
        summary: r.summary ?? '',
        bullets: r.bullets ?? [],
        sort_order: i,
      })),
    ),
  )
}

const groups = await insert(
  'skill_groups',
  content.skillGroups.map((g, i) => ({ title: g.title, sort_order: i })),
)

if (groups) {
  const grouped = content.skillGroups.flatMap((g, gi) =>
    g.items.map((name, i) => ({
      group_id: groups[gi]?.id ?? null,
      name,
      published: true,
      sort_order: i,
    })),
  )
  const inGroups = new Set(content.skillGroups.flatMap((g) => g.items))
  const extra = content.skills.filter((n) => !inGroups.has(n))
  await insert('skills', [
    ...grouped,
    ...extra.map((name, i) => ({
      group_id: null,
      name,
      published: true,
      sort_order: grouped.length + i,
    })),
  ])
}

await insert(
  'certifications',
  content.certifications.map((c, i) => ({
    name: c.name,
    issuer: c.issuer,
    logo_url: c.logo ?? null,
    verify_url: c.verifyUrl ?? null,
    group_title: 'Certifications',
    published: true,
    sort_order: i,
  })),
)

await insert(
  'affiliations',
  content.affiliations.map((a, i) => ({
    name: a.name,
    role: a.role,
    logo_url: a.logo ?? null,
    emoji: a.emoji ?? null,
    href: a.href,
    summary: '',
    published: true,
    sort_order: i,
  })),
)

await insert(
  'posts',
  content.posts.map((p, i) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? '',
    body: p.body ?? '',
    read_minutes: p.readMinutes ?? 1,
    tags: p.tags ?? [],
    cover_url: p.cover ?? null,
    published_at: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
    published: true,
  })),
)

const resGroups = await insert(
  'resource_groups',
  content.resources.map((g, i) => ({ title: g.title, sort_order: i })),
)

if (resGroups) {
  await insert(
    'resources',
    content.resources.flatMap((g, gi) =>
      g.links.map((l, i) => ({
        group_id: resGroups[gi]?.id ?? null,
        title: l.title,
        href: l.href,
        description: l.description ?? '',
        sort_order: i,
      })),
    ),
  )
}

console.log('')
console.log(inserted.length ? 'rolling back…' : 'nothing to roll back')
for (const [table, ids] of inserted) {
  const { error } = await db.from(table).delete().in('id', ids)
  console.log(error ? `ROLLBACK FAILED ${table}: ${error.message}` : `  removed ${table} (${ids.length})`)
}

console.log('\nfinal row counts — every table should be 0:')
const tables = [
  'profile', 'projects', 'project_stack', 'experience_orgs', 'experience_roles',
  'skill_groups', 'skills', 'certifications', 'affiliations', 'posts',
  'resource_groups', 'resources', 'contact_messages', 'admins',
]
for (const t of tables) {
  const { count } = await db.from(t).select('*', { count: 'exact', head: true })
  console.log(`  ${t.padEnd(18)} ${count}`)
}

console.log(`\n${failed ? failed + ' insert(s) FAILED' : 'all inserts accepted by the schema'}`)
process.exit(failed ? 1 : 0)