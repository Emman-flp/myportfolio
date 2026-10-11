'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Portrait that follows the pointer with its gaze. Spec §4.2.
 *
 * The reference ships 9 pre-rendered WebP variants and swaps `src` by pointer
 * angle in 45-degree sectors, with a dead zone of 0.18 x width.
 * Until real photos exist this renders a single static image and the gaze
 * logic stays dormant rather than broken.
 */

const DIRECTIONS = ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'] as const
type Direction = (typeof DIRECTIONS)[number]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function GazePortrait({
  basePath,
  alt,
  fallback = '/portrait.svg',
  hasGazeSet = false,
}: {
  basePath?: string
  alt: string
  fallback?: string
  hasGazeSet?: boolean
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [direction, setDirection] = useState<string>('center')
  const pos = useRef<{ x: number; y: number } | null>(null)
  const frame = useRef(0)

  useEffect(() => {
    if (!hasGazeSet || !basePath) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const portraits = new Map<string, HTMLImageElement>()
    DIRECTIONS.forEach((d) => {
      const img = new Image()
      img.src = `${basePath}/${d}.webp`
      portraits.set(d, img)
    })

    const apply = async () => {
      const img = imgRef.current
      if (!img) return
      const next = direction === 'center' ? `${basePath}/center.webp` : `${basePath}/${direction}.webp`
      if (img.dataset.direction === direction) return

      img.dataset.preload = next
      // preload before swapping so the swap does not flash
      const pre = new Image()
      pre.src = next
      try {
        await pre.decode()
      } catch {
        /* not decoded yet — skip the swap */
        return
      }
      img.src = next
      img.dataset.direction = direction
    }

    apply()

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (!frame.current) frame.current = requestAnimationFrame(update)
    }

    function update() {
      frame.current = 0
      const img = imgRef.current
      if (!img || !pos.current || motion.matches) return setDirection('center')

      const rect = img.getBoundingClientRect()
      const dx = pos.current.x - (rect.left + rect.width / 2)
      const dy = pos.current.y - (rect.top + rect.height * 0.45)
      if (Math.hypot(dx, dy) < rect.width * 0.18) return setDirection('center')

      const sector = Math.round(Math.atan2(dy, dx) / (Math.PI / 4))
      setDirection(DIRECTIONS[(sector + 8) % 8])
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', () => setDirection('center'))
    return () => {
      document.removeEventListener('pointermove', onMove)
      if (frame.current) cancelAnimationFrame(frame.current)
      void sleep
      void portraits
    }
  }, [basePath, direction, hasGazeSet])

  return (
    <div className="relative">
      <img
        ref={imgRef}
        id="profile-gaze"
        src={fallback}
        alt={alt}
        width={576}
        height={576}
        className="block h-auto w-full select-none"
      />
    </div>
  )
}
