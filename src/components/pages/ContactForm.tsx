'use client'

import { useState } from 'react'
import { CONTACT_BUDGET_OPTIONS, CONTACT_TIMELINE_OPTIONS } from '@/lib/fixtures'

/**
 * Spec §8 — the reference hosts its contact form on /collabs; we have no
 * collabs page, so /contact carries it. Field set and markup match the
 * reference's form exactly.
 */
export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    setState('sending')
    // Phase 7: POST to a server action that writes to Supabase `messages`.
    // Until then we log and confirm, so the interaction is testable.
    console.log('[contact: not yet wired to Supabase]', data)
    setTimeout(() => {
      setState('sent')
      form.reset()
    }, 500)
  }

  return (
    <section className="reveal mt-10 scroll-mt-24 overflow-hidden rounded-2xl border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="font-pixel text-lg leading-none">get in touch</h2>
            <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-gray-600">
              Questions about data work, a project, or collaboration — send a note and I will reply.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-7 sm:px-8 sm:py-8">
        <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
          <Field label="name" htmlFor="c-name">
            <input
              id="c-name"
              name="name"
              required
              autoComplete="name"
              placeholder="Your name"
              className={input}
            />
          </Field>

          <Field label="email" htmlFor="c-email">
            <input
              id="c-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className={input}
            />
          </Field>

          <Field label="organisation" htmlFor="c-org">
            <input
              id="c-org"
              name="organisation"
              autoComplete="organization"
              placeholder="Company or school"
              className={input}
            />
          </Field>

          <Field label="role" htmlFor="c-role">
            <input
              id="c-role"
              name="role"
              placeholder="Your role"
              className={input}
            />
          </Field>

          <Field label="scope" htmlFor="c-budget">
            <select id="c-budget" name="budget" defaultValue={CONTACT_BUDGET_OPTIONS[0]} className={input}>
              {CONTACT_BUDGET_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <Field label="timeline" htmlFor="c-timeline">
            <select
              id="c-timeline"
              name="timeline"
              defaultValue={CONTACT_TIMELINE_OPTIONS[0]}
              className={input}
            >
              {CONTACT_TIMELINE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <label htmlFor="c-details" className={label}>
              details
            </label>
            <textarea
              id="c-details"
              name="details"
              rows={5}
              placeholder="What are you working on, and what would help?"
              className={`${input} resize-y`}
            />
          </div>

          <div className="flex flex-col items-start justify-between gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            <p className="font-mono text-[11px] text-gray-400" role="status" aria-live="polite">
              {state === 'sent' ? 'Thanks — your message has been recorded.' : null}
              {state === 'sending' ? 'Sending…' : null}
              {state === 'error' ? 'Something went wrong. Please try again.' : null}
            </p>
            <button
              type="submit"
              disabled={state === 'sending'}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-[13px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {state === 'sending' ? 'Sending…' : 'Send message'}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

const label = 'mb-2 block font-mono text-[11px] uppercase tracking-wider text-gray-400'

const input =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-gray-400 focus:border-gray-400'

function Field({
  label: l,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={label}>
        {l}
      </label>
      {children}
    </div>
  )
}
