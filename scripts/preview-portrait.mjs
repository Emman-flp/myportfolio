/**
 * Writes a grid overlay of the portrait crop so the face position can be read
 * off directly, instead of guessed at by a brightness heuristic that also
 * matches the background.
 *
 *   node scripts/preview-portrait.mjs
 */
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const sharp = require('../node_modules/sharp')

const OUT_DIR = process.env.TEMP || process.env.TMP || '.'
const TARGET = fileURLToPath(new URL('../public/portrait.webp', import.meta.url))
const OUT = `${OUT_DIR}/opencode/portrait-grid.png`

mkdirSync(dirname(OUT), { recursive: true })

const SIZE = 576
const lines = Array.from({ length: 11 }, (_, i) => {
  const p = i * 10
  // highlight the two candidate anchor lines
  const hot = p === 30 || p === 40
  const stroke = hot ? '#e11d48' : 'rgba(255,255,255,0.4)'
  const w = hot ? 2 : 1
  return (
    `<line x1="${p}" y1="0" x2="${p}" y2="${SIZE}" stroke="${stroke}" stroke-width="${w}"/>` +
    `<line x1="0" y1="${p}" x2="${SIZE}" y2="${p}" stroke="${stroke}" stroke-width="${w}"/>` +
    (hot ? `<text x="${p + 3}" y="14" fill="#e11d48" font-size="13" font-family="monospace">${p}%</text>` : '')
  )
}).join('')

const svg = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">${lines}</svg>`,
)

await sharp(TARGET).composite([{ input: svg, top: 0, left: 0 }]).png().toFile(OUT)

console.log(`wrote ${OUT}`)