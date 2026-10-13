import { RecordEditor, type FieldSpec } from '@/components/admin/RecordEditor'
import { getRows, hasLiveData } from '@/lib/data-admin'
import { isConfigured } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin — Experience' }

const ORG_FIELDS: FieldSpec[] = [
  { name: 'name', label: 'Organisation / school', list: true },
  { name: 'monogram', label: 'Monogram', hint: '1–3 chars shown in the timeline square.' },
  { name: 'employment', label: 'Type', list: true, placeholder: 'Full-time · Part-time · Education' },
  { name: 'meta', label: 'Duration', list: true, placeholder: '2 yrs 7 mos' },
  { name: 'location', label: 'Location', placeholder: 'City, Country · Hybrid' },
  { name: 'sort_order', label: 'Order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

const ROLE_FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Role / course', list: true },
  { name: 'org_id', label: 'Organisation id', hint: 'Copy from the table above.' },
  { name: 'period', label: 'Period', list: true, placeholder: 'Jan 2024 – Present' },
  { name: 'summary', label: 'Summary', type: 'textarea' },
  { name: 'bullets', label: 'Bullet points', type: 'lines', hint: 'One per line. Keep them measurable.' },
  { name: 'sort_order', label: 'Order', type: 'number' },
]

export default async function AdminExperience() {
  const live = isConfigured() ? await hasLiveData() : false
  const orgs = live ? await getRows('experience_orgs', { order: 'sort_order' }) : []
  const roles = live ? await getRows('experience_roles', { order: 'sort_order' }) : []

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Experience</h1>

      <RecordEditor
        table="experience_orgs"
        title="Organisations"
        fields={ORG_FIELDS}
        rows={orgs}
        newDefaults={{ sort_order: orgs.length, published: false, monogram: '' }}
        addLabel="Add organisation"
      />

      <RecordEditor
        table="experience_roles"
        title="Roles"
        fields={ROLE_FIELDS}
        rows={roles}
        newDefaults={{ sort_order: roles.length, bullets: [] }}
        addLabel="Add role"
      />
    </div>
  )
}
