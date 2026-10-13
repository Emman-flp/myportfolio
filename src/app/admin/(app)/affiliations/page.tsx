import { RecordEditor, type FieldSpec } from '@/components/admin/RecordEditor'
import { getRows, hasLiveData } from '@/lib/data-admin'
import { isConfigured } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin — Affiliations' }

const FIELDS: FieldSpec[] = [
  { name: 'name', label: 'Name', list: true },
  { name: 'role', label: 'Role', list: true, placeholder: 'Member · Founder · Officer' },
  { name: 'summary', label: 'One-line description', type: 'textarea' },
  { name: 'href', label: 'Link', placeholder: 'https://' },
  { name: 'emoji', label: 'Emoji', hint: 'Used when no logo URL is set.' },
  { name: 'logo_url', label: 'Logo URL' },
  { name: 'sort_order', label: 'Order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

export default async function AdminAffiliations() {
  const live = isConfigured() ? await hasLiveData() : false
  const rows = live ? await getRows('affiliations', { order: 'sort_order' }) : []

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Affiliations</h1>
      <RecordEditor
        table="affiliations"
        title="Communities and organisations"
        fields={FIELDS}
        rows={rows}
        newDefaults={{ sort_order: rows.length, published: false, href: '#' }}
        addLabel="Add affiliation"
      />
    </div>
  )
}
