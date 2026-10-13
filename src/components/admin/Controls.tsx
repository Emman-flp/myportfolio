'use client'

import type { ReactNode } from 'react'

/**
 * Admin form controls.
 *
 * Deliberately a plain, dense, practical interface — the admin is not part of
 * the public reference design, so it borrows nothing from the portfolio's
 * halftone/pixel aesthetic beyond the shared colour tokens.
 */

export function Field({
  label,
  name,
  defaultValue = '',
  type = 'text',
  placeholder,
  hint,
  required,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  placeholder?: string
  hint?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      />
      {hint && <span className="mt-1 block text-[11px] text-neutral-500">{hint}</span>}
    </label>
  )
}

export function TextArea({
  label,
  name,
  defaultValue = '',
  rows = 4,
  hint,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  rows?: number
  hint?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-700">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      />
      {hint && <span className="mt-1 block text-[11px] text-neutral-500">{hint}</span>}
    </label>
  )
}

/** For jsonb array columns. One entry per line. */
export function LinesField({
  label,
  name,
  values = [],
  hint,
  placeholder,
}: {
  label: string
  name: string
  values?: string[]
  hint?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-700">{label}</span>
      <textarea
        name={`${name}[]`}
        rows={Math.max(3, values.length + 1)}
        defaultValue={values.join('\n')}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 font-mono text-xs outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      />
      {hint && <span className="mt-1 block text-[11px] text-neutral-500">{hint}</span>}
    </label>
  )
}

export function Checkbox({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-neutral-300" />
      {label}
    </label>
  )
}

export function Button({
  children,
  variant = 'primary',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-700',
    ghost: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50',
    danger: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
  }
  return (
    <button
      {...rest}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white">
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-2.5">
          {title && <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

export function Status({ state }: { state?: { ok: boolean; error?: string; message?: string } }) {
  if (!state) return null
  return (
    <p
      role="status"
      className={`text-xs ${state.ok ? 'text-emerald-700' : 'text-red-700'}`}
    >
      {state.ok ? state.message : state.error}
    </p>
  )
}
