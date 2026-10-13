import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/server'
import { isConfigured } from '@/lib/supabase/admin'
import { hasLiveData } from '@/lib/data'
import { passwordConfigured } from '@/lib/localAuth'
import { signIn } from '../actions'
import { LoginForm } from '../LoginForm'

export const metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin')

  // Ask for an email only when there is actually a database to sign in to.
  const mode = isConfigured() && (await hasLiveData()) ? 'supabase' : 'password'

  return <LoginForm action={signIn} mode={mode} />
}

export const dynamic = 'force-dynamic'
void passwordConfigured
