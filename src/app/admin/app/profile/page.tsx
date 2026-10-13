import { getFirst, getRows, hasLiveData } from '@/lib/data-admin'
import { isConfigured } from '@/lib/supabase/admin'
import { ProfileForm } from './ProfileForm'

export const metadata = { title: 'Admin — Profile' }

type ProfileRow = {
  name?: string
  tagline?: string
  description?: string
  email?: string
  github_username?: string
  paragraphs?: unknown
  socials?: unknown
}

export default async function ProfilePage() {
  const live = isConfigured() ? await hasLiveData() : false
  const row: ProfileRow | null = live ? await getFirst<ProfileRow>('profile') : null

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <ProfileForm row={row} />
      {!live && (
        <p className="text-xs text-neutral-500">
          Not connected — this form is inert until the database is reachable.
        </p>
      )}
    </div>
  )
}
