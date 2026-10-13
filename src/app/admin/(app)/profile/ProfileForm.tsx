'use client'

import { useActionState } from 'react'
import { saveProfile, type ActionState } from '../../actions'
import { Button, Card, Field, Status, TextArea } from '@/components/admin/Controls'

type Row = {
  name?: string
  tagline?: string
  description?: string
  email?: string
  github_username?: string
  paragraphs?: unknown
  socials?: unknown
}

export function ProfileForm({ row }: { row: Row | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(saveProfile, { ok: false })

  const paragraphs = Array.isArray(row?.paragraphs) ? (row.paragraphs as string[]) : []
  const socials = Array.isArray(row?.socials)
    ? (row.socials as { label: string; href: string }[]).map((s) => `${s.label} | ${s.href}`)
    : []

  return (
    <Card title="Profile — the hero block on the homepage">
      <form action={formAction} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" name="name" defaultValue={row?.name ?? ''} required />
          <Field label="Tagline" name="tagline" defaultValue={row?.tagline ?? ''} />
          <Field label="Email" name="email" type="email" defaultValue={row?.email ?? ''} />
          <Field
            label="GitHub username"
            name="github_username"
            defaultValue={row?.github_username ?? ''}
            placeholder="blank hides the github section"
          />
        </div>

        <TextArea
          label="Meta description"
          name="description"
          defaultValue={row?.description ?? ''}
          rows={2}
          hint="Used for SEO and link previews."
        />

        <TextArea
          label="Hero paragraphs"
          name="paragraphs"
          defaultValue={paragraphs.join('\n')}
          rows={4}
          hint="One paragraph per line. Two renders like the reference; more is fine."
        />

        <TextArea
          label="Social links"
          name="socials"
          defaultValue={socials.join('\n')}
          rows={3}
          hint="One per line as: label | https://url"
          placeholder={'github | https://github.com/you\nlinkedin | https://linkedin.com/in/you'}
        />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save profile'}
          </Button>
          <Status state={state} />
        </div>
      </form>
    </Card>
  )
}
