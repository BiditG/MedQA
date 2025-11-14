import Link from 'next/link'
import { biologyTopics } from '@/data/biologyTopics'

export default function BiologyTopicsPage() {
  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-semibold">Biology Notes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Select a topic to view its PDF notes.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {biologyTopics.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/notes/biology/${t.slug}`}
              className="block rounded-md border px-3 py-2 hover:bg-muted"
            >
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
