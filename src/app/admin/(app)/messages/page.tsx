import { getMessages } from '@/lib/data-admin'
import { markMessage, deleteMessage } from '../../actions'

export const metadata = { title: 'Admin — Messages' }

export default async function MessagesPage() {
  let messages: Awaited<ReturnType<typeof getMessages>> = []
  let error = false
  try {
    messages = await getMessages()
  } catch {
    error = true
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Messages ({messages.length})</h1>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          Could not read messages. Check the database connection on the overview page.
        </p>
      )}

      {!error && messages.length === 0 && (
        <p className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-sm text-neutral-500">
          No messages yet. Submissions from <code>/contact</code> land here.
        </p>
      )}

      <div className="space-y-3">
        {messages.map((m) => (
          <article
            key={m.id}
            className={`rounded-lg border bg-white p-4 ${m.is_read ? 'border-neutral-200' : 'border-neutral-900'}`}
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-medium">{m.name}</span>
                <a href={`mailto:${m.email}`} className="ml-2 text-sm text-neutral-600 underline">
                  {m.email}
                </a>
              </div>
              <time className="text-xs text-neutral-500">
                {new Date(m.created_at).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </header>

            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600">
              {m.organisation && (
                <div>
                  <dt className="inline text-neutral-400">org: </dt>
                  <dd className="inline">{m.organisation}</dd>
                </div>
              )}
              {m.role && (
                <div>
                  <dt className="inline text-neutral-400">role: </dt>
                  <dd className="inline">{m.role}</dd>
                </div>
              )}
              {m.budget && (
                <div>
                  <dt className="inline text-neutral-400">scope: </dt>
                  <dd className="inline">{m.budget}</dd>
                </div>
              )}
              {m.timeline && (
                <div>
                  <dt className="inline text-neutral-400">timeline: </dt>
                  <dd className="inline">{m.timeline}</dd>
                </div>
              )}
            </dl>

            {m.details && (
              <p className="mt-3 whitespace-pre-wrap rounded-md bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-800">
                {m.details}
              </p>
            )}

            <footer className="mt-3 flex gap-2">
              <form action={markMessage}>
                <input type="hidden" name="_id" value={m.id} />
                <input type="hidden" name="_read" value={String(!m.is_read)} />
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:bg-neutral-50"
                >
                  {m.is_read ? 'Mark unread' : 'Mark read'}
                </button>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="_id" value={m.id} />
                <button
                  type="submit"
                  className="rounded-md border border-red-300 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            </footer>
          </article>
        ))}
      </div>
    </div>
  )
}
