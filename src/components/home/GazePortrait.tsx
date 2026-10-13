'use client'

import { useEffect, useRef } from 'react'

/**
 * Portrait whose gaze follows the pointer. Spec §4.2.
 *
 * ## The reference's approach
 *
 * It ships nine pre-rendered WebP variants — `center` plus eight compass
 * directions — and swaps `src` by the pointer's angle from the face, in 45°
 * sectors, with a dead zone of 0.18 × width. The maths below is ported
 * verbatim.
 *
 * ## What we do about the missing assets
 *
 * We do not have nine pre-rendered portraits, and the placeholder is a
 * silhouette, not a photograph — pre-rendering nine variants of it would
 * produce nine identical files and a visible pop on every sector change.
 *
 * So this runs two backends behind the same sector calculation:
 *
 *   - `gazeBase` given and its images reachable → swap `src`, exactly like the
 *     reference. Drop nine files at that path and it takes over with no code
 *     change.
 *   - otherwise → nudge the portrait with a small translate + rotate, driven by
 *     the same angle. Works with any single image, including a placeholder, and
 *     reads as the portrait turning to follow you.
 *
 * The fallback is a deviation. It is declared in UI-SPECIFICATION.md §4.2 and is
 * the reason this component takes a `gazeBase` prop at all.
 *
 * ## Cross-feature contract
 *
 * Exposes `window.profileGaze.look(x, y)` / `.release()`. The guide tour calls
 * these so the portrait watches the tour cursor instead of the visitor — see
 * `GuideTour.tsx`.
 */

const DIRECTIONS = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
] as const

type Direction = (typeof DIRECTIONS)[number] | 'center'

declare global {
  interface Window {
    profileGaze?: {
      look(x: number, y: number): void
      release(): void
    }
  }
}

/** Sector → how far the portrait shifts and turns, as a fraction of its box. */
const FALLBACK_NUDGE: Record<Direction, { x: number; y: number; rotate: number }> = {
  center: { x: 0, y: 0, rotate: 0 },
  right: { x: 0.02, y: 0, rotate: 1.4 },
  'down-right': { x: 0.015, y: 0.015, rotate: 1.1 },
  down: { x: 0, y: 0.02, rotate: 0 },
  'down-left': { x: -0.015, y: 0.015, rotate: -1.1 },
  left: { x: -0.02, y: 0, rotate: -1.4 },
  'up-left': { x: -0.015, y: -0.015, rotate: -1.1 },
  up: { x: 0, y: -0.02, rotate: 0 },
  'up-right': { x: 0.015, y: -0.015, rotate: 1.1 },
}

export function GazePortrait({
  gazeBase,
  alt,
  src = '/portrait.svg',
}: {
  /** Directory holding `center.webp` + the eight directions. Enables src-swap. */
  gazeBase?: string
  alt: string
  src?: string
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const box = boxRef.current
    const img = imgRef.current
    const inner = innerRef.current
    if (!box || !img || !inner) return

    // Non-null for the rest of the effect; TS cannot narrow refs into closures.
    const frameEl: HTMLDivElement = box
    const face: HTMLImageElement = img
    const stage: HTMLSpanElement = inner

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

    /** Images proven decodable, so a swap can never flash. */
    const ready = new Map<Direction, HTMLImageElement>()
    /** Set once any variant 404s, so we stop probing on every pointer move. */
    let srcSwapOk = Boolean(gazeBase)

    const portraits = new Map<Direction, HTMLImageElement>()

    function show(direction: Direction) {
      if (face.dataset.direction === direction) return

      if (srcSwapOk && direction !== 'center') {
        const preloaded = portraits.get(direction)
        // The reference waits for `complete && naturalWidth` before swapping,
        // which is what stops the broken-image flash on a slow load.
        if (!preloaded?.complete || !preloaded.naturalWidth) {
          srcSwapOk = false
          return show(direction)
        }
      }

      if (srcSwapOk) face.src = `${gazeBase}/${direction}.webp`
      face.dataset.direction = direction

      // Fallback path: a small shift + turn, using the portrait's own box so it
      // scales with whatever size it renders at.
      const { x, y, rotate } = FALLBACK_NUDGE[direction]
      stage.style.transform = `translate(${(x * 100).toFixed(2)}%, ${(y * 100).toFixed(2)}%) rotate(${rotate}deg)`
    }

    let position: { x: number; y: number } | null = null
    let frame = 0
    let guided = false

    function update() {
      frame = 0
      if (!position || motion.matches) return show('center')

      // Measure the *frame*, not the face: `stage` carries the transform, so
      // reading its rect would feed this move's output back in as the next
      // move's input and the portrait would drift. The frame never moves.
      const rect = frameEl.getBoundingClientRect()
      const dx = position.x - (rect.left + rect.width / 2)
      // 0.45 rather than 0.5: the reference treats the face as sitting slightly
      // above the vertical centre of a square portrait.
      const dy = position.y - (rect.top + rect.height * 0.45)

      // Dead zone, so small wobbles around the face do not flip directions.
      if (Math.hypot(dx, dy) < rect.width * 0.18) return show('center')

      const sector = Math.round(Math.atan2(dy, dx) / (Math.PI / 4))
      show(DIRECTIONS[(sector + 8) % 8])
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    function configure() {
      if (!motion.matches && gazeBase && portraits.size === 0) {
        for (const d of DIRECTIONS) {
          const image = new Image()
          image.onload = schedule
          image.src = `${gazeBase}/${d}.webp`
          portraits.set(d, image)
        }
      }
      schedule()
    }

    function reset() {
      if (guided) return
      position = null
      schedule()
    }

    function follow(e: PointerEvent) {
      if (guided) return
      position = { x: e.clientX, y: e.clientY }
      schedule()
    }

    window.profileGaze = {
      look(x, y) {
        guided = true
        position = { x, y }
        schedule()
      },
      release() {
        guided = false
        position = null
        schedule()
      },
    }

    document.addEventListener('pointerdown', follow, { passive: true })
    document.addEventListener(
      'pointermove',
      (e) => {
        // Touch leaves a pointer behind on lift, so only track real pointing.
        if (e.pointerType !== 'touch') follow(e)
      },
      { passive: true },
    )
    document.documentElement.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'touch') reset()
    })
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    document.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', configure)

    configure()

    return () => {
      document.removeEventListener('pointerdown', follow)
      document.removeEventListener('scroll', schedule)
      window.removeEventListener('blur', reset)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', configure)
      if (frame) cancelAnimationFrame(frame)
      delete window.profileGaze
    }
  }, [gazeBase])

  return (
    <div ref={boxRef} className="relative overflow-hidden">
      <span
        ref={innerRef}
        className="block will-change-transform"
        style={{ transition: 'transform 260ms cubic-bezier(0.3, 1, 0.4, 1)' }}
      >
        <img
          ref={imgRef}
          id="profile-gaze"
          src={src}
          alt={alt}
          width={576}
          height={576}
          data-direction="center"
          className="block h-auto w-full select-none"
        />
      </span>
    </div>
  )
}