'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PROFILE } from '@/lib/fixtures'

/**
 * Ask overlay — Alt+K / Cmd+K. Spec §5.8.
 *
 * Same terminal aesthetic as the reference: a hidden 1x1 input captures typing,
 * the text is echoed with a blinking caret, and answers "type on".
 *
 * Answers are drawn only from data that actually exists. The reference's version
 * gathers browser + OS and returns personal facts; this one answers from the
 * profile and fixture data, and says so plainly when it does not know.
 */

type Answer = { title?: string; lines: string[]; edu?: string }

const ANSWERS: { test: RegExp; answer: Answer }[] = [
  {
    test: /\b(who|about|yourself|name)\b/i,
    answer: {
      lines: [
        `${PROFILE.name} — ${PROFILE.tagline}.`,
        'Replace this in the admin dashboard under Profile.',
      ],
    },
  },
  {
    test: /\b(stack|tools|tech|language|skills)\b/i,
    answer: {
      lines: [
        'Python · SQL · PostgreSQL · dbt · pandas',
        'Power BI · Tableau · Airflow · Docker · Git',
        'Full list lives on /stack.',
      ],
    },
  },
  {
    test: /\b(project|built|build|work)\b/i,
    answer: {
      lines: ['Projects are listed on /projects.', 'Add yours in the admin dashboard.'],
    },
  },
  {
    test: /\b(contact|email|reach|hire|available)\b/i,
    answer: {
      lines: [`Email: ${PROFILE.email}`, 'Or use the form on /contact.'],
    },
  },
  {
    test: /\b(where|location|based)\b/i,
    answer: { lines: ['Add your location on the contact page.'] },
  },
]

const FALLBACK: Answer = {
  lines: [
    "I don't have an answer for that yet.",
    'Try: who are you · what is your stack · what have you built · how do I contact you',
  ],
}

export function AskOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const [busy, setBusy] = useState(false)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const t1 = useRef<number | undefined>(undefined)
  const t2 = useRef<number | undefined>(undefined)

  const reset = useCallback(() => {
    setText('')
    setShowBubble(false)
    setBusy(false)
    setAnswer(null)
  }, [])

  useEffect(() => {
    if (open) {
      reset()
      t1.current = window.setTimeout(() => inputRef.current?.focus(), 80)
    }
    return () => {
      window.clearTimeout(t1.current)
      window.clearTimeout(t2.current)
    }
  }, [open, reset])

  const close = useCallback(() => {
    window.clearTimeout(t2.current)
    onClose()
  }, [onClose])

  function submit() {
    const q = text.trim()
    if (!q || busy) return

    setBusy(true)
    setShowBubble(true)

    // Loader shimmer, then the typed-on answer.
    t2.current = window.setTimeout(() => {
      const match = ANSWERS.find((a) => a.test.test(q))
      setAnswer(match?.answer ?? FALLBACK)
      setBusy(false)
    }, 620)
  }

  return (
    <div
      id="askOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Ask"
      className={open ? 'is-visible' : ''}
      aria-hidden={!open}
    >
      <div className="ask-backdrop" onClick={close} />

      <div className={`ask-content${open ? ' is-open' : ''}`} onClick={() => inputRef.current?.focus()}>
        {showBubble && (
          <div className="ask-bubble is-on">
            <span>{text}</span>
          </div>
        )}

        {!answer && (
          <div className={`ask-head${busy ? ' is-shimmer' : ''}`}>
            <div className={`loader${busy ? ' is-on' : ''}`} id="askLoader" />
            <h2 className="ask-title">what do you want to ask?</h2>
          </div>
        )}

        {answer && (
          <div className="ask-reveal" style={{ display: 'flex' }}>
            {answer.title && <div className="reveal-title reveal-item show">{answer.title}</div>}
            {answer.lines.map((line, i) => (
              <div
                key={i}
                className={`reveal-line${i === 0 ? '' : ' gap'} reveal-item show`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                {line}
              </div>
            ))}
            {answer.edu && <div className="reveal-edu reveal-item show">{answer.edu}</div>}
          </div>
        )}

        <div className="ask-field">
          <span id="askText">{text}</span>
          <span className="ask-caret" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          id="askInput"
          className="ask-hidden-input"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Type your question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
      </div>
    </div>
  )
}
