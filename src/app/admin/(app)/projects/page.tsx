import { RecordEditor, type FieldSpec } from '@/components/admin/RecordEditor'
import { getRows, hasLiveData } from '@/lib/data-admin'
import { isConfigured } from '@/lib/supabase/admin'
import { Card } from '@/components/admin/Controls'
import { PLACEHOLDER_PROJECTS, PLACEHOLDER_PROJECT_STACK } from '@/lib/fixtures'

export const metadata = { title: 'Admin — Projects' }

const PROJECT_FIELDS: FieldSpec[] = [
  { name: 'title', label: 'Title', list: true },
  { name: 'slug', label: 'Slug', hint: 'lowercase-with-dashes', placeholder: 'my-project' },
  { name: 'summary', label: 'Summary', type: 'textarea', list: true },
  { name: 'badges', label: 'Badges', type: 'lines', hint: 'First one renders filled; the rest outlined.' },
  { name: 'tags', label: 'Tags', type: 'lines' },
  { name: 'links', label: 'Links', type: 'textarea', hint: 'JSON array of {label, image, href}' },
  { name: 'featured_in', label: 'Featured in', type: 'textarea', hint: 'JSON array of {label, href}' },
  { name: 'icon_url', label: 'Icon URL' },
  { name: 'video_url', label: 'Video URL' },
  { name: 'sort_order', label: 'Order', type: 'number', hint: 'Lower shows first.' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

const STACK_FIELDS: FieldSpec[] = [
  { name: 'name', label: 'Name', list: true },
  { name: 'href', label: 'Link', placeholder: 'https://' },
  { name: 'category', label: 'Category', list: true },
  { name: 'description', label: 'Description', type: 'textarea', list: true },
  { name: 'sort_order', label: 'Order', type: 'number' },
  { name: 'published', label: 'Published', type: 'checkbox' },
]

export default async function AdminProjects() {
  const live = isConfigured() ? await hasLiveData() : false
  const projects = live ? await getRows('projects', { order: 'sort_order' }) : []
  const stack = live ? await getRows('project_stack', { order: 'sort_order' }) : []

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Projects</h1>

      <RecordEditor
        table="projects"
        title="Project cards"
        fields={PROJECT_FIELDS}
        rows={projects}
        newDefaults={{ sort_order: projects.length, published: false, badges: [], links: [] }}
        addLabel="Add project"
        emptyText={live ? 'No projects yet.' : 'Not connected — showing placeholders is pointless here.'}
      />

      <RecordEditor
        table="project_stack"
        title="Project stack (compact list at the bottom of /projects)"
        fields={STACK_FIELDS}
        rows={stack}
        newDefaults={{ sort_order: stack.length, published: false, href: '#' }}
        addLabel="Add row"
      />

      {!live && (
        <Card title="Currently shown on the site">
          <ul className="space-y-1 text-sm text-neutral-600">
            {PLACEHOLDER_PROJECTS.map((p) => (
              <li key={p.id}>· {p.title}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-neutral-500">
            These come from <code>src/lib/fixtures.ts</code>. They disappear once the table has
            rows.
          </p>
        </Card>
      )}

      {!live && PLACEHOLDER_PROJECT_STACK.length > 0 && (
        <p className="text-xs text-neutral-500">{PLACEHOLDER_PROJECT_STACK.length} placeholder stack rows.</p>
      )}
    </div>
  )
}
