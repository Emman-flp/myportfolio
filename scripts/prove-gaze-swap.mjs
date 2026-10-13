/**
 * Proves the nine-image gaze path actually works, using obviously-distinct
 * placeholder files rather than real portraits.
 *
 * Why this exists: the reference swaps between nine pre-rendered images, and
 * that code path had never been exercised — `gazeBase` was always undefined,
 * so the component only ever ran its CSS fallback. If the swap logic were
 * broken, nobody would find out until after generating nine real images.
 *
 * Each test image is the real portrait with a bright marker in a different
 * corner, one per direction, so a swap is unmistakable on screen and in the
 * DOM.
 *
 *   node scripts/prove-gaze-swap.mjs          # writes the test set
 *   node scripts/prove-gaze-swap.mjs --clean  # removes it
 */
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const sharp = require('../node_modules/sharp')

const GAZE_DIR = fileURLToPath(new URL('../public/gaze/', import.meta.url))
const SOURCE = fileURLToPath(new URL('../public/portrait.webp', import.meta.url))

const DIRECTIONS = [
  'center',
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
]

if (process.argv.includes('--clean')) {
  rmSync(GAZE_DIR, { recursive: true, force: true })
  console.log(`removed ${GAZE_DIR}`)
  process.exit(0)
}

if (!existsSync(SOURCE)) {
  console.error(`missing ${SOURCE} — run the portrait crop first`)
  process.exit(1)
}

mkdirSync(GAZE_DIR, { recursive: true })

const { width, height } = await sharp(SOURCE).metadata()
const M = 56 // marker size, ~10% of the frame
const PAD = 10

/** Where each direction's marker sits, as a corner of the frame. */
const SPOT = {
  center: [width / 2 - M / 2, height / 2 - M / 2],
  right: [width - M - PAD, height / 2 - M / 2],
  'down-right': [width - M - PAD, height - M - PAD],
  down: [width / 2 - M / 2, height - M - PAD],
  'down-left': [PAD, height - M - PAD],
  left: [PAD, height / 2 - M / 2],
  'up-left': [PAD, PAD],
  up: [width / 2 - M / 2, PAD],
  'up-right': [width - M - PAD, PAD],
}

const COLOUR = '#e11d48'

for (const d of DIRECTIONS) {
  const [x, y] = SPOT[d]
  const svg = Buffer.from(
    `<svg width="${M}" height="${M}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="${M}" height="${M}" rx="8" fill="${COLOUR}"/>` +
      `<text x="${M / 2}" y="${M / 2 + 5}" font-size="13" font-family="monospace" ` +
      `fill="#fff" text-anchor="middle">${d}</text>` +
      `</svg>`,
  )

  await sharp(SOURCE)
    .composite([{ input: svg, left: Math.round(x), top: Math.round(y) }])
    .webp({ quality: 80 })
    .toFile(`${GAZE_DIR}${d}.webp`)
}

console.log(`wrote ${DIRECTIONS.length} test images to public/gaze/`)
console.log('each has a red marker in a different corner, labelled with its direction.')
console.log('to verify in the browser, set gazeBase="/gaze" on <GazePortrait>.')
console.log('remove them again with:  node scripts/prove-gaze-swap.mjs --clean')