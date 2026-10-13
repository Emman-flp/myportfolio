'use server'

import { createClient } from '@/lib/supabase/client'
import type { ContactMessage } from '@/lib/types'

/**
 * Contact form submission.
 *
 * Uses the ANON key on purpose: the browser is an untrusted client, so this
 * runs under RLS. The only thing the policy permits is INSERT into
 * contact_messages — it cannot read anything back, and cannot write anywhere
 * else.
 */

export type SubmitState = {
  ok: boolean
  error?: string
}

function honeypot(formData: FormData): boolean {
  // Bots fill hidden fields; humans never see them.
  return Boolean(formData.get('_company'))
}

export async function submitContact(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  if (honeypot(formData)) {
    // Pretend it worked so the bot does not retry.
    return { ok: true }
  }

  const message: ContactMessage = {
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    organisation: String(formData.get('organisation') ?? '').trim() || undefined,
    role: String(formData.get('role') ?? '').trim() || undefined,
    budget: String(formData.get('budget') ?? '').trim() || undefined,
    timeline: String(formData.get('timeline') ?? '').trim() || undefined,
    details: String(formData.get('details') ?? '').trim() || undefined,
  }

  if (!message.name || !message.email) {
    return { ok: false, error: 'Name and email are required.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
    return { ok: false, error: 'That email address does not look right.' }
  }
  if (message.details && message.details.length > 5000) {
    return { ok: false, error: 'Please keep the details under 5000 characters.' }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, error: 'The contact form is not connected yet.' }
  }

  try {
    const supabase = createClient()
    const row = {
      name: message.name,
      email: message.email,
      organisation: message.organisation ?? null,
      role: message.role ?? null,
      budget: message.budget ?? null,
      timeline: message.timeline ?? null,
      details: message.details ?? null,
    }
    // Column set is fixed here (unlike the admin's generic editor), but the
    // insert generic cannot narrow the union, so cast at the boundary.
    const { error } = await supabase.from('contact_messages').insert(row as never)

    if (error) return { ok: false, error: 'Could not send that. Please try again.' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not send that. Please try again.' }
  }
}
