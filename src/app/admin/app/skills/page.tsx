import { RecordEditor, type FieldSpec } from '@/components/admin/RecordEditor'
import { getRows, hasLiveData } from '@/lib/data-admin'
import { isConfigured } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin — Skills' }

const GROUP_FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Group name', list: true, placeholder: 'Languages & Query' },
  { name: 'sort_order', label: 'Order', type: 'number' },
]

const SKILL_FIELDS: FieldSpec[] = [
  { name: 'name', label: 'Skill', list: true },
  { name: 'group_id', label: 'Group id', hint: 'Copy from the groups table above.' },
  { name: 'sort_order', label: 'Order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

export default async function AdminSkills() {
  const live = isConfigured() ? await hasLiveData() : false
  const groups = live ? await getRows('skill_groups', { order: 'sort_order' }) : []
  const skills = live ? await getRows('skills', { order: 'sort_order' }) : []

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Skills</h1>
      <p className="text-sm text-neutral-500">
        Drives both the chip row on the homepage and the full <code>/stack</code> page.
      </p>

      <RecordEditor
        table="skill_groups"
        title="Groups"
        fields={GROUP_FIELDS}
        rows={groups}
        newDefaults={{ sort_order: groups.length }}
        addLabel="Add group"
      />

      <RecordEditor
        table="skills"
        title="Skills"
        fields={SKILL_FIELDS}
        rows={skills}
        newDefaults={{ sort_order: skills.length, published: false }}
        addLabel="Add skill"
      />
    </div>
  )
}
