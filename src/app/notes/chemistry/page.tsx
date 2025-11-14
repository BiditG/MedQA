import Link from 'next/link'
import { chemistryTopics } from '@/data/chemistryTopics'

export default function ChemistryTopicsPage() {
  const ordered = [...chemistryTopics].sort((a, b) => {
    const numFrom = (str?: string) => {
      if (!str) return 0
      const m = str.match(/^(\d+)[\.\-\s]/)
      return m ? parseInt(m[1], 10) : 0
    }
    const na = numFrom(a.title) || numFrom(a.filename)
    const nb = numFrom(b.title) || numFrom(b.filename)
    if (na && nb) return na - nb
    if (na) return -1
    if (nb) return 1
    return a.title.localeCompare(b.title)
  })

  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-semibold">Chemistry Notes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Select a topic to view its PDF notes.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ordered.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/notes/chemistry/${t.slug}`}
              className="block rounded-md border px-3 py-2 hover:bg-muted"
              title={t.title}
            >
              <span className="block truncate whitespace-nowrap">
                {t.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
