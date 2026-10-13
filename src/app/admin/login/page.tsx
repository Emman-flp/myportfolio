import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/server'
import { signIn } from '../actions'
import { LoginForm } from '../LoginForm'

export const metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin')
  return <LoginForm action={signIn} />
}
