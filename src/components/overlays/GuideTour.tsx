'use client'

import { useEffect, useRef, useState } from 'react'
import { GUIDE_STEPS, type GuideStep } from '@/lib/guide'

/**
 * The guide tour.
 *
 * Everything runs off one rAF loop so the whole tour pauses when the tab is
 * hidden or an overlay opens — which is what the reference does, and why the
 * cursor never keeps moving behind the Ask dialog.
 *
 * Physics, verbatim from the reference:
 *   - `goal` is where the hand means to be; `shown` chases it on a soft spring
 *     (SPRING 190, damping 0.82 of critical) so nothing ever snaps
 *   - travel uses a minimum-jerk curve on a randomly bowed path, so two runs
 *     never trace the same path
 *   - longer reaches overshoot or undershoot, then correct — a human reach
 *   - the bubble types grapheme by grapheme, with pauses at punctuation
 */

/* ---- layout types -------------------------------------------------------- */

type Point = { x: number; y: number }
type Move = {
  from: Point
  to: () => Point
  t0: number
  dur: number
  skew: number
  nx: number
  ny: number
  b1: number
  b2: number
  done: () => void
}

type Layout = {
  parts: string[]
  chars: HTMLSpanElement[]
  boxes: { right: number; top: number; bottom: number }[]
  width: number
  height: number
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
const rand = (min: number, max: number) => min + Math.random() * (max - min)

const SEEN = 'guideTourSeen'
const PROMPT = 'guideTourPrompt'

/* ---- markup -------------------------------------------------------------- */

export function GuideTour({ name }: { name: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const [present, setPresent] = useState(false)

  // Mounted only once we know we are on a desktop pointer device, so the DOM is
  // absent everywhere the reference would hide it anyway.
  useEffect(() => {
    const desktop = matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    if (desktop.matches) setPresent(true)
  }, [])

  useEffect(() => {
    if (!present) return
    const root = rootRef.current
    const prompt = promptRef.current
    if (!root || !prompt) return

    // Non-null for the rest of the effect; TS cannot narrow these into closures.
    const cursorEl: HTMLDivElement = root
    const promptEl: HTMLDivElement = prompt

    const tag = cursorEl.querySelector<HTMLElement>('.gc-tag')!
    const nameEl = cursorEl.querySelector<HTMLElement>('.gc-name')!
    const clip = cursorEl.querySelector<HTMLElement>('.gc-clip')!
    const inner = cursorEl.querySelector<HTMLElement>('[data-gc-text]')!
    const measure = cursorEl.querySelector<HTMLElement>('[data-gc-measure]')!
    const caret = cursorEl.querySelector<HTMLElement>('.gc-caret')!
    const sidebar = document.querySelector('[data-guide="sidebar"]')

    const desktop = matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    const overlays = ['askOverlay', 'typingOverlay'].map((id) => document.getElementById(id))
    const graphemes =
      'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null

    const store = {
      get(key: string) {
        try {
          return sessionStorage.getItem(key)
        } catch {
          return null
        }
      },
      set(key: string, value: string) {
        try {
          sessionStorage.setItem(key, value)
        } catch {
          /* private mode */
        }
      },
    }

    /* ---- clock + spring ---- */

    const goal: Point = { x: 0, y: 0 }
    const shown = { x: 0, y: 0, vx: 0, vy: 0 }
    const SPRING = 190
    const DAMPING = 2 * Math.sqrt(SPRING) * 0.82
    const waiters: { at: number; done: () => void }[] = []

    let clock = 0
    let last = 0
    let running = false
    let away = false
    let move: Move | null = null
    let rest: (() => Point) | null = null
    let hovered: Element | null = null
    let typing = false
    let tremor = 1

    const sleep = (ms: number) =>
      new Promise<void>((done) => {
        waiters.push({ at: clock + ms, done })
      })

    const isAway = () =>
      !desktop.matches || overlays.some((el) => el && el.classList.contains('is-visible'))

    function frame(now: number) {
      if (!running) return
      const dt = Math.min(now - last, 50)
      last = now

      const nowAway = isAway()
      if (nowAway !== away) {
        away = nowAway
        cursorEl.classList.toggle('is-away', away)
      }

      if (!away) {
        clock += dt

        if (move) {
          const p = Math.min((clock - move.t0) / move.dur, 1)
          const u = Math.pow(p, move.skew) // quick launch, long settle
          const e = u * u * u * (u * (u * 6 - 15) + 10) // minimum-jerk
          const to = move.to()
          // bowed (sometimes S-shaped) path
          const side =
            3 * (1 - e) * (1 - e) * e * move.b1 + 3 * (1 - e) * e * e * move.b2
          goal.x = move.from.x + (to.x - move.from.x) * e + move.nx * side
          goal.y = move.from.y + (to.y - move.from.y) * e + move.ny * side
          if (p === 1) {
            const done = move.done
            rest = move.to
            move = null
            done()
          }
        } else if (rest) {
          // stay pinned to the target while the page scrolls
          const to = rest()
          goal.x = to.x
          goal.y = to.y
        }

        // fixed-step integration keeps the spring stable across frame drops
        const hops = Math.ceil(dt / 12)
        const h = dt / hops / 1000
        for (let i = 0; i < hops; i++) {
          shown.vx += (SPRING * (goal.x - shown.x) - DAMPING * shown.vx) * h
          shown.vy += (SPRING * (goal.y - shown.y) - DAMPING * shown.vy) * h
          shown.x += shown.vx * h
          shown.y += shown.vy * h
        }

        // A resting hand is never perfectly still, but it lets go of the mouse
        // to type.
        tremor += ((typing ? 0 : 1) - tremor) * Math.min(dt / 280, 1)
        const x =
          shown.x +
          (Math.sin(clock / 830 + 1.3) * 1.5 +
            Math.sin(clock / 310 + 4.1) * 0.6 +
            Math.sin(clock / 127) * 0.22) *
            tremor
        const y =
          shown.y +
          (Math.cos(clock / 1010 + 0.4) * 1.3 +
            Math.sin(clock / 370 + 2.2) * 0.55 +
            Math.cos(clock / 141 + 5) * 0.2) *
            tremor
        cursorEl.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`

        for (let i = waiters.length - 1; i >= 0; i--) {
          if (waiters[i].at <= clock) waiters.splice(i, 1)[0].done()
        }
      }

      requestAnimationFrame(frame)
    }

    /* ---- travel ---- */

    function glide(to: () => Point, dur: number) {
      return new Promise<void>((done) => {
        const from = { x: goal.x, y: goal.y }
        const target = to()
        const dx = target.x - from.x
        const dy = target.y - from.y
        const dist = Math.hypot(dx, dy) || 1
        const b1 = Math.min(dist * rand(0.08, 0.28), 64) * (Math.random() < 0.5 ? -1 : 1)
        const b2 = Math.random() < 0.3 ? -b1 * rand(0.3, 0.8) : b1 * rand(0.4, 1.1)
        move = {
          from,
          to,
          t0: clock,
          dur,
          skew: rand(0.72, 0.94),
          nx: -dy / dist,
          ny: dx / dist,
          b1,
          b2,
          done,
        }
      })
    }

    async function moveTo(to: () => Point, opts: { direct?: boolean; dur?: number } = {}) {
      const off = { x: rand(-2.5, 2.5), y: rand(-1.5, 1.5) }
      const aim = opts.direct
        ? to
        : () => {
            const t = to()
            return { x: t.x + off.x, y: t.y + off.y }
          }
      const target = aim()
      const dx = target.x - goal.x
      const dy = target.y - goal.y
      const dist = Math.hypot(dx, dy) || 1
      const dur =
        (opts.dur || clamp(210 + Math.sqrt(dist) * 25, 330, 1000)) * rand(0.88, 1.15)
      const roll = Math.random()

      if (opts.direct || dist < 160 || roll > 0.65) return glide(aim, dur)

      // past it, or short of it, then a small corrective nudge
      const miss = clamp(dist * rand(0.025, 0.06), 5, 22) * (roll < 0.4 ? 1 : -1)
      const drift = rand(-0.5, 0.5) * miss
      const ox = (dx / dist) * miss - (dy / dist) * drift
      const oy = (dy / dist) * miss + (dx / dist) * drift
      await glide(() => {
        const t = aim()
        return { x: t.x + ox, y: t.y + oy }
      }, dur)
      await sleep(rand(40, 110))
      await glide(aim, rand(140, 230))
    }

    /* ---- targets ---- */

    function visible(el: Element) {
      const r = el.getBoundingClientRect()
      if (!r.width || r.top < 0 || r.bottom > innerHeight) return false
      const scroller = el.closest('.overflow-y-auto')
      if (!scroller) return true
      const s = scroller.getBoundingClientRect()
      return r.top >= s.top && r.bottom <= s.bottom
    }

    function anchor(el: Element, at: GuideStep['at']) {
      return () => {
        const r = el.getBoundingClientRect()
        if (at === 'above') return { x: r.left + 6, y: r.top - 24 }
        if (at === 'below') return { x: r.left + r.width / 2, y: r.bottom + 2 }
        return { x: r.right + 5, y: r.top + r.height / 2 }
      }
    }

    function openSpace(fx: number, fy: number) {
      const left = sidebar ? sidebar.getBoundingClientRect().right : 0
      const point = { x: left + (innerWidth - left) * fx, y: innerHeight * fy }
      return () => point
    }

    function setHover(el: Element | null) {
      if (hovered) hovered.classList.remove('gc-hover')
      hovered = el
      if (hovered) hovered.classList.add('gc-hover')
    }

    /* ---- bubble ---- */

    // Lay the whole message out up front (hidden) so the bubble can grow with
    // the typing without words jumping between lines.
    function compose(text: string): Layout {
      const parts = graphemes
        ? Array.from(graphemes.segment(text), (s) => s.segment)
        : Array.from(text)

      const chars = parts.map((part) => {
        const span = document.createElement('span')
        span.className = 'gc-ch'
        span.textContent = part
        return span
      })

      measure.replaceChildren(...chars)
      const boxes = chars.map((span) => ({
        right: span.offsetLeft + span.offsetWidth,
        top: span.offsetTop,
        bottom: span.offsetTop + span.offsetHeight,
      }))

      // round the width up: a fraction of a pixel short and the last word
      // wraps differently in the bubble
      return {
        parts,
        chars,
        boxes,
        width: Math.ceil(measure.getBoundingClientRect().width),
        height: measure.offsetHeight,
      }
    }

    // Flip the bubble above / left of the arrow when it would run off screen.
    function place(point: Point, layout: Layout, prefer: GuideStep['at'] | null) {
      const w = Math.max(nameEl.offsetWidth, layout.width) + 22
      const h = nameEl.offsetHeight + layout.height + 10
      const fitsBelow = point.y + 19 + h + 10 <= innerHeight
      const fitsAbove = point.y - h - 10 >= 0
      cursorEl.classList.toggle('is-up', fitsAbove && (prefer === 'above' || !fitsBelow))
      cursorEl.classList.toggle('is-left', point.x + 16 + w + 10 > innerWidth)
    }

    async function type(layout: Layout) {
      inner.style.width = `${layout.width}px`
      inner.replaceChildren(...layout.chars, caret)
      tag.classList.add('is-talking', 'is-typing')
      typing = true

      const pace = rand(0.85, 1.25) // everyone types some sentences faster
      let width = 0

      for (let i = 0; i < layout.chars.length; i++) {
        const box = layout.boxes[i]
        const part = layout.parts[i]
        layout.chars[i].classList.add('is-on')
        width = Math.max(width, box.right)
        clip.style.width = `${Math.ceil(width) + 2}px`
        clip.style.height = `${box.bottom}px`
        caret.style.transform = `translate(${box.right}px,${box.top}px)`

        let wait = rand(7, 20) * pace
        if (/[.!?]/.test(part)) wait = rand(80, 150)
        else if (/[,:]/.test(part)) wait = rand(45, 90)
        else if (part === ' ' && Math.random() < 0.12) wait += rand(60, 150) // thinking
        else if (Math.random() < 0.07) wait += rand(30, 80) // a small stumble

        await sleep(wait)
      }

      typing = false
      tag.classList.remove('is-typing')
    }

    function hush() {
      clip.style.width = '0px'
      clip.style.height = '0px'
      tag.classList.remove('is-talking', 'is-typing')
    }

    /* ---- script ---- */

    async function say(step: GuideStep) {
      const els = step.els().filter(visible)
      if (!els.length && !step.free) return

      const points = els.length
        ? els.map((el) => anchor(el, step.at))
        : [openSpace(rand(0.44, 0.56), rand(0.4, 0.5))]

      const layout = compose(step.text)
      hush()
      place(points[0](), layout, els.length ? step.at : null)
      setHover(els[0])
      await moveTo(points[0])
      await sleep(rand(60, 140))
      await type(layout)

      if (points.length > 1) {
        await sleep(rand(550, 800)) // let the line land before moving on
        for (let i = 1; i < points.length; i++) {
          await sleep(rand(90, 190))
          setHover(els[i])
          await moveTo(points[i], { dur: rand(240, 340) })
        }
        await sleep(rand(550, 750))
      } else {
        await sleep((850 + layout.chars.length * 20) * rand(0.95, 1.15))
      }

      setHover(null)
    }

    /* ---- replay prompt ---- */

    function showPrompt() {
      if (store.get(PROMPT) !== 'off') promptEl.classList.add('is-on')
    }

    promptEl.querySelector('[data-guide-replay]')?.addEventListener('click', () => {
      promptEl.classList.remove('is-on')
      start()
    })

    promptEl.querySelector('[data-guide-dismiss]')?.addEventListener('click', () => {
      promptEl.classList.remove('is-on')
      store.set(PROMPT, 'off')
    })

    async function run() {
      await sleep(500)
      cursorEl.classList.add('is-here')
      store.set(SEEN, '1')
      for (const step of GUIDE_STEPS) await say(step)

      // Wander off the edge of the screen and hand the gaze back to the visitor.
      hush()
      await sleep(rand(300, 500))
      const exit = { x: innerWidth + 90, y: innerHeight * rand(0.18, 0.42) }
      await moveTo(() => exit, { direct: true })
      cursorEl.classList.remove('is-here')
      await sleep(500)
      running = false
      showPrompt()
    }

    // The guide comes in from off the right edge.
    function start() {
      if (running) return
      running = true
      move = rest = null
      goal.x = shown.x = innerWidth + 40
      goal.y = shown.y = innerHeight * rand(0.5, 0.7)
      shown.vx = shown.vy = 0
      cursorEl.classList.remove('is-up', 'is-left')
      cursorEl.style.transform = `translate3d(${goal.x}px,${goal.y}px,0)`
      requestAnimationFrame((now) => {
        last = now
        frame(now)
      })
      void run()
    }

    // Plays itself once per browser session (or with ?tour); after that, on request.
    if (store.get(SEEN) !== '1' || new URLSearchParams(location.search).has('tour')) {
      start()
    } else {
      showPrompt()
    }

    return () => {
      running = false
      waiters.length = 0
      setHover(null)
    }
  }, [present])

  if (!present) return null

  return (
    <>
      <div id="guideCursor" ref={rootRef} aria-hidden="true">
        <svg className="gc-arrow" viewBox="0 0 24 24" fill="none">
          <path className="gc-rim" d="M5.5 5.5l3.9 11.7 2.2-5.6 5.6-2.2-11.7-3.9z" />
          <path className="gc-body" d="M5.5 5.5l3.9 11.7 2.2-5.6 5.6-2.2-11.7-3.9z" />
        </svg>
        <div className="gc-tag">
          <span className="gc-name">{name}</span>
          <div className="gc-clip">
            <div className="gc-text" data-gc-text />
          </div>
          <div className="gc-text gc-measure" data-gc-measure />
          <span className="gc-caret" />
        </div>
      </div>

      <div id="guidePrompt" ref={promptRef}>
        <button type="button" className="gp-replay" data-guide-replay>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M13 8a5 5 0 11-1.6-3.7M13 2.5v2.6h-2.6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          take the tour again
        </button>
        <button type="button" className="gp-dismiss" data-guide-dismiss aria-label="Dismiss">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  )
}