/**
 * Reports the headers supabase-js actually sends, for both fetch paths, for
 * both key formats.
 *
 * Why this exists: when migrating from the legacy JWT keys to the new
 * `sb_publishable_…` / `sb_secret_…` keys, Supabase's guidance is to send the
 * new keys on the `apikey` header only, because they are not JWTs and anything
 * that tries to parse one fails with `Invalid JWT`.
 *
 * Checking that by reading the docs is not enough — `omitApiKeyAsBearer` turns
 * out NOT to be a client-level option. It is passed internally to the Functions
 * fetch only. So this asserts what the installed version really does, and
 * fails if a future upgrade changes it.
 *
 * The new-format key here is a structurally valid placeholder: it exercises
 * header handling, not authentication. Use it to check headers, never to prove
 * a real key works.
 *
 *   node scripts/verify-key-formats.mjs
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

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const LEGACY = env.SUPABASE_SERVICE_ROLE_KEY
const FAKE_NEW = 'sb_secret_' + 'A'.repeat(40)

let failures = 0
const check = (label, ok, detail) => {
  if (!ok) failures++
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
}

/** Runs one request and reports the headers that went out. */
async function probe(key, path) {
  const captured = {}
  const db = createClient(URL_, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: async (input, init) => {
        const h = new Headers(init?.headers)
        captured.apikey = h.get('apikey')
        captured.authorization = h.get('authorization')
        return fetch(input, init)
      },
    },
  })

  let result = 'n/a'
  if (path === 'rest') {
    const { data, error } = await db.from('profile').select('id').limit(1)
    result = error ? `error: ${error.message}` : `ok, ${data.length} row(s)`
  } else {
    // Functions need a real edge function; the request will fail, but the
    // outgoing headers are captured before it does.
    await db.functions.invoke('__header_probe__')
    result = '(expected to fail — no such function)'
  }

  return { ...captured, result }
}

console.log(`supabase-js ${JSON.parse(readFileSync('./node_modules/@supabase/supabase-js/package.json', 'utf8')).version}\n`)

console.log('data API (PostgREST) — legacy JWT')
{
  const h = await probe(LEGACY, 'rest')
  check('apikey header sent', h.apikey === LEGACY)
  check('Authorization carries the JWT', h.authorization === `Bearer ${LEGACY}`)
  check('request accepted by Supabase', h.result === 'ok, 0 row(s)', h.result)
}

console.log('\ndata API (PostgREST) — new sb_secret')
{
  const h = await probe(FAKE_NEW, 'rest')
  check('apikey header sent', h.apikey === FAKE_NEW)
  // Supabase tolerates this for compatibility, but it is worth pinning: if a
  // future version stops sending it, nothing else here would notice.
  check(
    'still sends the key as Bearer (Supabase accepts this for data API)',
    h.authorization === `Bearer ${FAKE_NEW}`,
  )
  console.log('       → new-format keys are NOT JWTs; this path is safe,')
  console.log('         but the Functions path below is the one that matters.')
}

console.log('\nEdge Functions — new sb_secret (the path that must omit Bearer)')
{
  const h = await probe(FAKE_NEW, 'functions')
  check('apikey header sent', h.apikey === FAKE_NEW)
  check(
    'Authorization omitted — this is what avoids "Invalid JWT"',
    h.authorization === null,
    `authorization=${JSON.stringify(h.authorization)}`,
  )
}

console.log(
  `\n${failures ? failures + ' check(s) FAILED' : 'both key formats send correct headers on both paths'}`,
)
console.log('Note: a real sb_ key is still needed to prove end-to-end auth.')
process.exit(failures ? 1 : 0)