import { RecordEditor, type FieldSpec } from '@/components/admin/RecordEditor'
import { getRows, hasLiveData } from '@/lib/data-admin'
import { isConfigured } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin — Certifications' }

const FIELDS: FieldSpec[] = [
  { name: 'name', label: 'Name', list: true },
  { name: 'issuer', label: 'Issuer', list: true },
  { name: 'group_title', label: 'Section heading', hint: 'Groups cards on /certifications.' },
  { name: 'verify_url', label: 'Verify URL' },
  { name: 'logo_url', label: 'Logo URL' },
  { name: 'sort_order', label: 'Order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

export default async function AdminCertifications() {
  const live = isConfigured() ? await hasLiveData() : false
  const rows = live ? await getRows('certifications', { order: 'sort_order' }) : []

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Certifications</h1>
      <p className="text-sm text-neutral-500">
        Only add credentials you actually hold — the site never invents them.
      </p>
      <RecordEditor
        table="certifications"
        title="Credentials"
        fields={FIELDS}
        rows={rows}
        newDefaults={{ sort_order: rows.length, published: false, group_title: 'Data & Analytics' }}
        addLabel="Add certification"
      />
    </div>
  )
}
