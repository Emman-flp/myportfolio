'use client'

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { deleteRow, saveRow, type ActionState } from '@/app/admin/actions'
import { Button, Card, Checkbox, EmptyState, Field, LinesField, SearchInput, Status, TextArea } from './Controls'

/**
 * Generic record editor.
 *
 * Field configs drive the list, the form and the filter, so adding a column to a
 * table is a one-line change here rather than a new page. That keeps the admin
 * maintainable across the dozen collections it has to manage.
 *
 * Beyond the config, this handles the three things that actually bite when
 * editing a growing set of records: finding one, not losing an in-progress edit
 * to a stray click, and not deleting on a mis-click.
 */

export type FieldSpec = {
  /** Database column. Append `[]` for jsonb arrays (edited one-per-line). */
  name: string
  label: string
  type?: 'text' | 'textarea' | 'lines' | 'checkbox' | 'number' | 'date'
  hint?: string
  placeholder?: string
  /** Shown in the summary table and searched by the filter. */
  list?: boolean
  /** Full width in the form. */
  wide?: boolean
}

export type Row = Record<string, unknown>

export function RecordEditor({
  table,
  title,
  fields,
  rows,
  newDefaults = {},
  addLabel = 'Add',
  emptyText = 'Nothing here yet.',
  emptyHint,
  searchPlaceholder,
}: {
  table: string
  title: string
  fields: FieldSpec[]
  rows: Row[]
  newDefaults?: Record<string, unknown>
  addLabel?: string
  emptyText?: string
  emptyHint?: string
  searchPlaceholder?: string
}) {
  const listFields = useMemo(() => fields.filter((f) => f.list), [fields])
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      listFields.some((f) => {
        const v = row[f.name]
        if (v === null || v === undefined) return false
        return (
          Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : String(v)
        )
          .toLowerCase()
          .includes(q)
      }),
    )
  }, [rows, listFields, query])

  const searchable = rows.length > 8

  return (
    <Card
      title={title}
      count={query.trim() && filtered.length !== rows.length ? `${filtered.length}/${rows.length}` : rows.length}
      description={rows.length === 0 ? emptyHint : undefined}
      actions={
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="w-44">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder={searchPlaceholder ?? `Filter ${title.toLowerCase()}…`}
                resultCount={filtered.length}
              />
            </div>
          )}
          <NewRecordForm table={table} fields={fields} defaults={newDefaults} label={addLabel} />
        </div>
      }
      bodyClass={rows.length === 0 ? 'p-0' : 'p-0'}
    >
      {rows.length === 0 ? (
        <EmptyState title={emptyText} action={<NewRecordForm table={table} fields={fields} defaults={newDefaults} label={addLabel} />}>
          {emptyHint}
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState icon="search" title="No matches">
          Nothing matches “{query.trim()}”. Clear the filter to see all {rows.length}.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
              <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wider text-gray-500">
                {listFields.map((f) => (
                  <th key={f.name} className="px-4 py-2 font-semibold first:pl-4">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-2 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <RowView key={String(row.id)} table={table} fields={fields} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function RowView({
  table,
  fields,
  row,
}: {
  table: string
  fields: FieldSpec[]
  row: Row
}) {
  const [open, setOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const id = String(row.id)
  const listFields = fields.filter((f) => f.list)

  // Never discard in-progress work to a stray click.
  const close = () => {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return
    setDirty(false)
    setOpen(false)
  }

  return (
    <>
      <tr
        className={`border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60 ${
          open ? 'bg-gray-50' : ''
        }`}
      >
        {listFields.map((f, i) => (
          <td
            key={f.name}
            className={`px-4 py-2.5 align-top text-gray-800 ${i === 0 ? 'pl-4 font-medium text-ink' : ''}`}
          >
            <Display value={row[f.name]} />
          </td>
        ))}
        <td className="px-4 py-2.5 text-right">
          <div className="inline-flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon="pencil" type="button" onClick={() => (open ? close() : setOpen(true))}>
              {open ? 'Close' : 'Edit'}
            </Button>
            <DeleteForm table={table} id={id} name={String(row[listFields[0]?.name ?? 'title'] ?? '')} />
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-gray-100">
          <td colSpan={listFields.length + 1} className="bg-gray-50/60 px-4 py-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="font-mono text-[10px] text-gray-400">{id}</span>
                {dirty && (
                  <span className="text-[10px] font-medium text-amber-600">unsaved changes</span>
                )}
              </div>
              <RowForm
                table={table}
                fields={fields}
                row={row}
                onDone={close}
                onDirtyChange={setDirty}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/** Delete that confirms first, and shows pending state while it runs. */
function DeleteForm({ table, id, name }: { table: string; id: string; name: string }) {
  const [pending, setPending] = useState(false)

  return (
    <form
      action={async (fd) => {
        if (!window.confirm(`Delete “${name || id}”? This cannot be undone.`)) return
        setPending(true)
        try {
          await deleteRow(fd)
        } finally {
          setPending(false)
        }
      }}
    >
      <input type="hidden" name="_table" value={table} />
      <input type="hidden" name="_id" value={id} />
      <Button type="submit" variant="danger" size="sm" icon="trash" loading={pending}>
        Delete
      </Button>
    </form>
  )
}

/* ---- display ------------------------------------------------------------- */

function Display({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-300">—</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
          value ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {value ? 'yes' : 'no'}
      </span>
    )
  }
  if (Array.isArray(value)) {
    return value.length ? (
      <span className="break-words text-gray-600">{value.join(', ')}</span>
    ) : (
      <span className="text-gray-300">—</span>
    )
  }
  if (typeof value === 'object') {
    return <code className="font-mono text-[11px] text-gray-500">{JSON.stringify(value)}</code>
  }

  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    return (
      <span className="whitespace-nowrap font-mono text-[12px] text-gray-600">
        {new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    )
  }
  if (s.length > 70) {
    return (
      <span className="break-words" title={s}>
        {s.slice(0, 70)}…
      </span>
    )
  }
  return <span className="break-words">{s}</span>
}

/* ---- forms --------------------------------------------------------------- */

export function RowForm({
  table,
  fields,
  row,
  defaults = {},
  submitLabel = 'Save',
  onDone,
  onDirtyChange,
}: {
  table: string
  fields: FieldSpec[]
  row?: Row
  defaults?: Record<string, unknown>
  submitLabel?: string
  onDone?: () => void
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveRow, { ok: false })
  const formRef = useRef<HTMLFormElement>(null)

  /** Server-rendered values, for comparing against what is typed now. */
  const initial = useMemo(() => {
    const out: Record<string, string> = {}
    const checks: Record<string, boolean> = {}
    for (const f of fields) {
      const raw = row ? row[f.name] : defaults[f.name]
      if (f.type === 'checkbox') checks[f.name] = raw === true
      else out[f.name] = Array.isArray(raw) ? raw.join('\n') : raw === null || raw === undefined ? '' : String(raw)
    }
    return { text: out, checks }
  }, [fields, row, defaults])

  const isDirty = useCallback(() => {
    const form = formRef.current
    if (!form) return false
    for (const el of Array.from(form.elements) as HTMLInputElement[]) {
      if (!el.name || el.name.startsWith('_') || el.name.startsWith('$') || el.name.startsWith('__')) continue
      if (el.type === 'checkbox') {
        if ((initial.checks[el.name] ?? false) !== el.checked) return true
        continue
      }
      // LinesField posts under `name[]`
      const key = el.name.replace(/\[\]$/, '')
      if ((initial.text[key] ?? '') !== el.value) return true
    }
    return false
  }, [initial])

  // Report dirtiness upward so the row can guard its own close/cancel.
  useEffect(() => {
    if (!onDirtyChange) return
    const check = () => onDirtyChange(isDirty())
    const form = formRef.current
    form?.addEventListener('input', check)
    form?.addEventListener('change', check)
    check()
    return () => {
      form?.removeEventListener('input', check)
      form?.removeEventListener('change', check)
    }
  }, [isDirty, onDirtyChange])

  // And warn before the tab closes with unsaved edits.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty()) e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  return (
    <form
      ref={formRef}
      action={formAction}
      data-table={table}
      data-row={row?.id ?? 'new'}
      className="space-y-4"
    >
      <input type="hidden" name="_table" value={table} />
      {row?.id ? <input type="hidden" name="_id" value={String(row.id)} /> : null}
      {/* lets the action tell "unchecked" from "absent" for boolean columns */}
      {fields.some((f) => f.type === 'checkbox') && <input type="hidden" name="__published" value="1" />}

      <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
        {fields.map((f) => {
          const raw = row ? row[f.name] : defaults[f.name]
          const value = raw === null || raw === undefined ? '' : String(raw)
          const key = `${table}:${row?.id ?? 'new'}:${f.name}`
          const span = f.type === 'textarea' || f.type === 'lines' || f.wide

          if (f.type === 'textarea') {
            return (
              <div key={key} className={span ? 'sm:col-span-2' : ''}>
                <TextArea label={f.label} name={f.name} defaultValue={value} hint={f.hint} placeholder={f.placeholder} />
              </div>
            )
          }
          if (f.type === 'lines') {
            const arr = Array.isArray(raw) ? (raw as string[]) : []
            return (
              <div key={key} className={span ? 'sm:col-span-2' : ''}>
                <LinesField label={f.label} name={f.name} values={arr} hint={f.hint} placeholder={f.placeholder} />
              </div>
            )
          }
          if (f.type === 'checkbox') {
            return (
              <div key={key} className="sm:col-span-2">
                <Checkbox label={f.label} name={f.name} defaultChecked={raw === true} hint={f.hint} />
                <input type="hidden" name={`__${f.name}`} value="1" />
              </div>
            )
          }
          return (
            <div key={key} className={span ? 'sm:col-span-2' : ''}>
              <Field
                label={f.label}
                name={f.name}
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                defaultValue={value}
                hint={f.hint}
                placeholder={f.placeholder}
                mono={/slug|href|url|username|email/i.test(f.name)}
              />
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
        <Button type="submit" loading={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Status state={state} />
      </div>
    </form>
  )
}

export function NewRecordForm({
  table,
  fields,
  defaults,
  label,
}: {
  table: string
  fields: FieldSpec[]
  defaults?: Record<string, unknown>
  label: string
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} icon="plus">
        {label}
      </Button>
    )
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-gray-50/70 p-4">
      <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2.5">
        <h3 className="text-[13px] font-semibold text-ink">New record</h3>
        <Button type="button" variant="subtle" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      <RowForm
        table={table}
        fields={fields}
        defaults={defaults}
        submitLabel={label}
        onDone={() => setOpen(false)}
      />
    </div>
  )
}