import { RecordEditor, type FieldSpec } from '@/components/admin/RecordEditor'
import { getRows, hasLiveData } from '@/lib/data-admin'
import { isConfigured } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin — Posts' }

const FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Title', list: true },
  { name: 'slug', label: 'Slug', hint: 'lowercase-with-dashes' },
  { name: 'excerpt', label: 'Excerpt', type: 'textarea', list: true, hint: 'One sentence — truncated to a line.' },
  { name: 'body', label: 'Body (Markdown)', type: 'textarea', hint: '## heading, - bullets, 1. numbers, > quote, ``` code, **bold**, [link](url)' },
  { name: 'tags', label: 'Tags', type: 'lines' },
  { name: 'read_minutes', label: 'Read minutes', type: 'number' },
  { name: 'cover_url', label: 'Cover image URL' },
  { name: 'published_at', label: 'Published at', type: 'date' },
  { name: 'published', label: 'Published', type: 'checkbox', hint: 'Unpublished posts are invisible on the public site.' },
]

export default async function AdminPosts() {
  const live = isConfigured() ? await hasLiveData() : false
  const rows = live ? await getRows('posts', { order: 'published_at', asc: false }) : []

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Posts ({rows.length})</h1>
      <RecordEditor
        table="posts"
        title="Articles and notes"
        fields={FIELDS}
        rows={rows}
        newDefaults={{ published: false, read_minutes: 3, tags: [] }}
        addLabel="Write a post"
        emptyText="Nothing published yet."
      />
    </div>
  )
}
