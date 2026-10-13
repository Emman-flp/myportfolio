'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Typing test — Alt+J. Spec §5.8.
 *
 * Word bank, 3-row on-screen keyboard, live WPM/ACC/time, and a results screen.
 * The reference compares against its owner's 140 WPM; this one has no benchmark
 * to compare against, so the verdict line is omitted rather than invented.
 */

const WORDS = (
  'the be of and a to in he have it that for they with as not on she at by this we you do but from or which one would all will there say who make when can more if no out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still hand old life tell write become here show house both between need mean call under last right move thing school never same begin while number part turn real leave might want point form off child few small since against ask late home large person end open public follow during without again hold around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand early course change help line'
).split(' ')

const KB_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const N_WORDS = 26

function makeWords() {
  const out: string[] = []
  for (let i = 0; i < N_WORDS; i++) out.push(WORDS[Math.floor(Math.random() * WORDS.length)])
  return out
}

export function TypingTest({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const [words, setWords] = useState<string[]>([])
  const [typed, setTyped] = useState('')
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [acc, setAcc] = useState(100)
  const [elapsed, setElapsed] = useState(0)
  const [finalWpm, setFinalWpm] = useState(0)
  const [finalAcc, setFinalAcc] = useState(0)
  const [finalRaw, setFinalRaw] = useState(0)

  const timer = useRef<number | undefined>(undefined)

  /* open/close with the reference's two-stage exit */
  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
      const t = window.setTimeout(() => setWords(makeWords()), 30)
      return () => window.clearTimeout(t)
    }
    setClosing(true)
    const t = window.setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, 220)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => () => window.clearInterval(timer.current), [])

  const restart = useCallback(() => {
    setWords(makeWords())
    setTyped('')
    setStarted(false)
    setWpm(0)
    setAcc(100)
    setElapsed(0)
    setShowResults(false)
    setConfirming(false)
    window.clearInterval(timer.current)
  }, [])

  const finish = useCallback(() => {
    window.clearInterval(timer.current)
    const secs = Math.max(1, (Date.now() - startTime) / 1000)
    const correctChars = words.join('').split('').filter((c, i) => typed[i] === c).length
    const grossWpm = (typed.length / 5 / secs) * 60
    const accuracy = typed.length ? (correctChars / typed.length) * 100 : 0
    const netWpm = grossWpm * (accuracy / 100)

    setFinalWpm(Math.round(netWpm))
    setFinalAcc(Math.round(accuracy))
    setFinalRaw(Math.round(grossWpm))
    setShowResults(true)
  }, [typed, words, startTime])

  /* live clock */
  useEffect(() => {
    if (!started || showResults) return
    timer.current = window.setInterval(() => {
      const secs = (Date.now() - startTime) / 1000
      setElapsed(Math.floor(secs))

      const correctChars = words.join('').split('').filter((c, i) => typed[i] === c).length
      const accuracy = typed.length ? (correctChars / typed.length) * 100 : 100
      const net = secs > 0 ? (typed.length / 5 / secs) * 60 * (accuracy / 100) : 0
      setWpm(Math.round(net))
      setAcc(Math.round(accuracy))

      if (words.join(' ').length <= typed.length) finish()
    }, 120)
    return () => window.clearInterval(timer.current)
  }, [started, typed, words, startTime, showResults, finish])

  function onKey(e: React.KeyboardEvent) {
    if (!open) return

    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (started && !showResults) setConfirming(true)
      return
    }
    if (confirming) {
      if (e.key === 'Enter') restart()
      if (e.key === 'Escape') setConfirming(false)
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      setTyped((t) => t.slice(0, -1))
      return
    }
    if (e.key === ' ') {
      const nextWord = words[typed.split(' ').length]
      if (nextWord !== undefined && typed.length > 0 && !typed.endsWith(' ')) {
        e.preventDefault()
        setTyped((t) => t + ' ')
        return
      }
    }
    if (e.key.length === 1) {
      e.preventDefault()
      if (!started) {
        setStarted(true)
        setStartTime(Date.now())
      }
      setTyped((t) => t + e.key)
    }
  }

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  /* per-character colouring, matching the reference's three states */
  const target = words.join(' ')
  const chars = target.split('').map((c, i) => {
    const typedChar = typed[i]
    let cls = ''
    if (typedChar === undefined) cls = ''
    else if (typedChar === c) cls = 'correct'
    else if (i >= typed.length) cls = ''
    else cls = 'incorrect'
    return { c, cls, extra: i >= typed.length && typed[i] !== undefined && typed[i] !== c }
  })

  return (
    <div
      id="typingOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Typing test"
      className={`${mounted ? 'is-visible' : ''}${mounted && !closing ? ' is-open' : ''}${
        closing ? ' is-closing' : ''
      }${showResults ? ' show-results' : ''}${confirming ? ' is-confirming' : ''}`}
      aria-hidden={!open}
    >
      <div className="tt-backdrop" onClick={onClose} />

      {mounted && (
        <div className="tt-content" tabIndex={0} onKeyDown={onKey} ref={(el) => el?.focus()}>
          <div className="tt-stats">
            <Stat value={wpm} unit="" label="wpm" />
            <Stat value={acc} unit="%" label="acc" />
            <Stat value={elapsed} unit="s" label="time" />
          </div>

          <div className="tt-words-wrap">
            <div className="tt-words">
              {chars.map((ch, i) => (
                <span key={i} className={`tt-char ${ch.cls}${ch.extra ? ' extra' : ''}`}>
                  {ch.c}
                </span>
              ))}
            </div>
          </div>

          <div className="tt-keyboard">
            {KB_ROWS.map((row, ri) => (
              <div key={ri} className="tt-krow">
                {row.split('').map((k) => (
                  <span
                    key={k}
                    className={`tt-key${nextExpected() === k ? ' next' : ''}${
                      typed.endsWith(k) ? ' active' : ''
                    }`}
                  >
                    {k}
                  </span>
                ))}
              </div>
            ))}
            <div className="tt-krow">
              <span className="tt-key space">space</span>
            </div>
          </div>

          <div className="tt-hint">
            <span>
              <kbd>tab</kbd> restart
            </span>
            <span>
              <kbd>esc</kbd> close
            </span>
          </div>

          <div className="tt-confirm">
            restart test? <kbd>↵</kbd> to confirm · <kbd>esc</kbd> cancel
          </div>

          <div className="tt-results">
            <div className="tt-res-main">
              <span className="tt-res-wpm">{finalWpm}</span>
              <span className="tt-res-cap">words per minute</span>
            </div>
            <div className="tt-res-grid">
              <div>
                <b>
                  {finalAcc}
                  <i>%</i>
                </b>
                <label>accuracy</label>
              </div>
              <div>
                <b>{finalRaw}</b>
                <label>raw</label>
              </div>
              <div>
                <b>
                  {elapsed}
                  <i>s</i>
                </b>
                <label>time</label>
              </div>
            </div>
            <button type="button" className="tt-restart" onClick={restart}>
              ↺ try again
            </button>
          </div>
        </div>
      )}
    </div>
  )

  function nextExpected() {
    return target[typed.length]
  }
}

function Stat({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <div className="tt-stat">
      <span className="tt-stat-val">
        <span className="tt-num">{value}</span>
        {unit && <i>{unit}</i>}
      </span>
      <span className="tt-stat-label">{label}</span>
    </div>
  )
}
