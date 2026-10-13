'use client'

import { useActionState } from 'react'
import { saveRow, type ActionState } from '@/app/admin/actions'
import { Button, Card, Checkbox, Field, LinesField, Status, TextArea } from './Controls'

/**
 * Generic record editor.
 *
 * Field configs drive both the list and the form, so adding a column to a
 * table is a one-line change here rather than a new page. That keeps the admin
 * maintainable across the dozen collections it has to manage.
 */

export type FieldSpec = {
  /** Database column. Append `[]` for jsonb arrays (edited one-per-line). */
  name: string
  label: string
  type?: 'text' | 'textarea' | 'lines' | 'checkbox' | 'number' | 'date'
  hint?: string
  placeholder?: string
  /** Shown in the summary table instead of the form. */
  list?: boolean
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
}: {
  table: string
  title: string
  fields: FieldSpec[]
  rows: Row[]
  newDefaults?: Record<string, unknown>
  addLabel?: string
  emptyText?: string
}) {
  const listFields = fields.filter((f) => f.list)

  return (
    <div className="space-y-4">
      <Card
        title={`${title} (${rows.length})`}
        actions={<NewRecordForm table={table} fields={fields} defaults={newDefaults} label={addLabel} />}
      >
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                  {listFields.map((f) => (
                    <th key={f.name} className="py-2 pr-4 font-medium">
                      {f.label}
                    </th>
                  ))}
                  <th className="py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <RowView key={String(row.id)} table={table} fields={fields} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
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
  const id = String(row.id)
  const listFields = fields.filter((f) => f.list)

  return (
    <>
      <tr className="border-b border-neutral-100 last:border-0">
        {listFields.map((f) => (
          <td key={f.name} className="py-2 pr-4 align-top text-neutral-800">
            <Display value={row[f.name]} />
          </td>
        ))}
        <td className="py-2 text-right">
          <div className="inline-flex items-center gap-1.5">
            <Button variant="ghost" type="button" onClick={() => setOpen(!open)}>
              {open ? 'Close' : 'Edit'}
            </Button>
            <form action={deleteRowAction}>
              <input type="hidden" name="_table" value={table} />
              <input type="hidden" name="_id" value={id} />
              <Button variant="danger" type="submit">
                Delete
              </Button>
            </form>
          </div>
        </td>
      </tr>
      {open && (
        <tr className="border-b border-neutral-100 bg-neutral-50">
          <td colSpan={listFields.length + 1} className="p-3">
            <RowForm table={table} fields={fields} row={row} />
          </td>
        </tr>
      )}
    </>
  )
}

import { useState } from 'react'
import { deleteRow } from '@/app/admin/actions'

function deleteRowAction(formData: FormData) {
  void deleteRow(formData)
}

function Display({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="text-neutral-400">—</span>
  if (typeof value === 'boolean') return <span>{value ? 'yes' : 'no'}</span>
  if (Array.isArray(value)) return <span>{value.length ? value.join(', ') : '—'}</span>
  if (typeof value === 'object') return <span className="font-mono text-xs">{JSON.stringify(value)}</span>

  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    return <span>{new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
  }
  return <span className="break-words">{s.length > 70 ? s.slice(0, 70) + '…' : s}</span>
}

export function RowForm({
  table,
  fields,
  row,
  defaults = {},
  submitLabel = 'Save',
  onDone,
}: {
  table: string
  fields: FieldSpec[]
  row?: Row
  defaults?: Record<string, unknown>
  submitLabel?: string
  onDone?: () => void
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveRow, { ok: false })

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="_table" value={table} />
      {row?.id ? <input type="hidden" name="_id" value={String(row.id)} /> : null}
      {/* lets the action tell "unchecked" from "absent" for boolean columns */}
      {fields.some((f) => f.type === 'checkbox') && <input type="hidden" name="__published" value="1" />}

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const raw = row ? row[f.name] : defaults[f.name]
          const value = raw === null || raw === undefined ? '' : String(raw)
          const key = `${table}:${row?.id ?? 'new'}:${f.name}`

          if (f.type === 'textarea') {
            return (
              <div key={key} className="sm:col-span-2">
                <TextArea label={f.label} name={f.name} defaultValue={value} hint={f.hint} placeholder={f.placeholder} />
              </div>
            )
          }
          if (f.type === 'lines') {
            const arr = Array.isArray(raw) ? (raw as string[]) : []
            return (
              <div key={key} className="sm:col-span-2">
                <LinesField label={f.label} name={f.name} values={arr} hint={f.hint} placeholder={f.placeholder} />
              </div>
            )
          }
          if (f.type === 'checkbox') {
            return (
              <div key={key} className="sm:col-span-2">
                <Checkbox label={f.label} name={f.name} defaultChecked={raw === true} />
                <input type="hidden" name={`__${f.name}`} value="1" />
              </div>
            )
          }
          return (
            <Field
              key={key}
              label={f.label}
              name={f.name}
              type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
              defaultValue={value}
              hint={f.hint}
              placeholder={f.placeholder}
            />
          )
        })}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={pending}>
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
      <Button type="button" onClick={() => setOpen(true)}>
        + {label}
      </Button>
    )
  }

  return (
    <div className="w-full rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">New record</p>
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
