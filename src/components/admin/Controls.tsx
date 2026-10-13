'use client'

import type { ReactNode } from 'react'
import { AdminIcon, FIELD_CLASS, type AdminIconName } from './icons'

/**
 * Admin form controls.
 *
 * Two deliberate departures from the previous version:
 *
 * 1. **Colour tokens, not `neutral-*`.** The Tailwind palette is remapped onto
 *    the site's CSS variables (`gray-500` → `--g500`, `white` → `--bg`,
 *    `ink` → `--ink`), and `html.dark` flips those variables. The old admin used
 *    `neutral-*`, which is not in the remap and therefore never darkened — the
 *    admin stayed white-on-white in dark mode. Swapping the tokens gives it
 *    dark mode for free and makes it match the portfolio.
 *
 * 2. **Controls are real controls.** Deleting asks first, saves show pending
 *    state, long lists can be filtered. Those are functional, not decoration.
 *
 * The admin is not part of the public reference design, so it borrows the
 * reference's type and stroke language without being bound by its layout.
 */

/* ---- text inputs --------------------------------------------------------- */

export function Field({
  label,
  name,
  defaultValue = '',
  type = 'text',
  placeholder,
  hint,
  required,
  mono,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  placeholder?: string
  hint?: string
  required?: boolean
  /** Use the mono stack — for slugs, URLs, ids. */
  mono?: boolean
}) {
  const id = `f-${name}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${FIELD_CLASS} ${mono ? 'font-mono text-[13px]' : ''}`}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
          {hint}
        </p>
      )}
    </div>
  )
}

export function TextArea({
  label,
  name,
  defaultValue = '',
  rows = 4,
  hint,
  placeholder,
  mono,
}: {
  label: string
  name: string
  defaultValue?: string
  rows?: number
  hint?: string
  placeholder?: string
  mono?: boolean
}) {
  const id = `f-${name}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${FIELD_CLASS} resize-y leading-relaxed ${mono ? 'font-mono text-[13px]' : ''}`}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
          {hint}
        </p>
      )}
    </div>
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
  const id = `f-${name}`
  const text = values.join('\n')

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
        <span className="ml-2 font-normal normal-case tracking-normal text-gray-400">
          {values.length} {values.length === 1 ? 'entry' : 'entries'}
        </span>
      </label>
      <textarea
        id={id}
        name={`${name}[]`}
        rows={Math.max(3, values.length + 1)}
        defaultValue={text}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${FIELD_CLASS} font-mono text-[13px] leading-relaxed`}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
          {hint}
        </p>
      )}
    </div>
  )
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string
  name: string
  defaultChecked?: boolean
  hint?: string
}) {
  const id = `f-${name}`
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2.5 text-sm text-ink select-none"
      >
        <input
          id={id}
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="h-4 w-4 rounded border-gray-300 text-ink accent-[rgb(var(--ink))] transition"
        />
        {label}
      </label>
      {hint && <p className="mt-1 pl-6.5 text-[11px] text-gray-500">{hint}</p>}
    </div>
  )
}

/* ---- buttons ------------------------------------------------------------- */

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle'
  size?: 'sm' | 'md'
  icon?: AdminIconName
  loading?: boolean
}) {
  const variants = {
    primary:
      'bg-ink text-white hover:opacity-85 active:opacity-75 border border-transparent',
    ghost:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-ink hover:border-gray-400',
    subtle: 'border border-transparent text-gray-600 hover:bg-gray-100 hover:text-ink',
    danger:
      'border border-red-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-400',
  }
  const sizes = {
    sm: 'px-2 py-1 text-[12px] gap-1 rounded-md',
    md: 'px-3 py-1.5 text-[13px] gap-1.5 rounded-lg',
  }

  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Spinner /> : icon ? <AdminIcon name={icon} className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  )
}

export function Spinner({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} animate-spin`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Delete that asks first.
 *
 * A server action behind a Delete button will happily delete a record the
 * moment the row is clicked, and there is no undo — the delete is not
 * reversible from the admin. One confirmation is the right amount of friction.
 */
export function ConfirmDelete({
  action,
  label = 'Delete',
  confirmText = 'Delete this for good? This cannot be undone.',
  className,
}: {
  action: (formData: FormData) => void
  label?: string
  confirmText?: string
  className?: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault()
      }}
    >
      <Button type="submit" variant="danger" size="sm" icon="trash" className={className}>
        {label}
      </Button>
    </form>
  )
}

/* ---- containers ---------------------------------------------------------- */

export function Card({
  title,
  count,
  children,
  actions,
  description,
  bodyClass = 'p-4',
}: {
  title?: string
  /** Rendered as a muted pill beside the title. */
  count?: ReactNode
  children: ReactNode
  actions?: ReactNode
  description?: string
  bodyClass?: string
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/60 px-4 py-2.5">
          <div className="min-w-0">
            {title && (
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                {title}
                {count !== undefined && (
                  <span className="rounded-full bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-600">
                    {count}
                  </span>
                )}
              </h2>
            )}
            {description && <p className="mt-0.5 text-[12px] text-gray-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

export function Banner({
  tone,
  icon,
  title,
  children,
  action,
}: {
  tone: 'ok' | 'warn' | 'danger' | 'info'
  icon?: AdminIconName
  title?: string
  children: ReactNode
  action?: ReactNode
}) {
  const tones = {
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-gray-200 bg-gray-50 text-gray-700',
  }
  const icons = { ok: 'check', warn: 'alert', danger: 'alert', info: 'database' } as const

  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-[13px] ${tones[tone]}`}>
      <AdminIcon name={icon ?? icons[tone]} className="mt-px h-4 w-4" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5 leading-relaxed' : 'leading-relaxed'}>{children}</div>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({
  icon = 'inbox',
  title,
  children,
  action,
}: {
  icon?: AdminIconName
  title: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <AdminIcon name={icon} className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {children && <p className="max-w-sm text-[13px] leading-relaxed text-gray-500">{children}</p>}
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Filter…',
  resultCount,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  resultCount?: number
}) {
  return (
    <div className="relative">
      <AdminIcon
        name="search"
        className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${FIELD_CLASS} py-1.5 pl-8 text-[13px]`}
      />
      {resultCount !== undefined && value.trim() !== '' && (
        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 font-mono text-[10px] text-gray-400">
          {resultCount}
        </span>
      )}
    </div>
  )
}

/* ---- feedback ------------------------------------------------------------ */

export function Status({ state }: { state?: { ok: boolean; error?: string; message?: string } }) {
  if (!state || (!state.message && !state.error)) return null

  const ok = state.ok && !state.error
  return (
    <p
      role="status"
      className={`inline-flex items-center gap-1.5 text-[12px] ${ok ? 'text-emerald-700' : 'text-red-700'}`}
    >
      <AdminIcon name={ok ? 'check' : 'alert'} className="h-3.5 w-3.5" />
      {ok ? state.message : state.error}
    </p>
  )
}