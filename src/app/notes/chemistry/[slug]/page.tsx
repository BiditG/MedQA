import { notFound } from 'next/navigation'
import Link from 'next/link'
import { chemistryTopics } from '@/data/chemistryTopics'
import PdfViewer from '@/components/PdfViewer'

export default function ChemistryTopicPage({
  params,
}: {
  params: { slug: string }
}) {
  const topic = chemistryTopics.find((t) => t.slug === params.slug)
  if (!topic) return notFound()

  const filename = topic.filename ?? `${topic.slug}.pdf`
  const pdfSrc = `/notes/chemistry/${encodeURIComponent(
    filename,
  )}#toolbar=0&navpanes=0&scrollbar=0`

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/notes/chemistry" className="hover:underline">
          Chemistry
        </Link>
        <span>/</span>
        <span className="text-foreground">{topic.title}</span>
      </div>

      <div className="rounded-md border">
        <PdfViewer
          src={pdfSrc}
          title={topic.title}
          className="h-[calc(100vh-10rem)] w-full rounded-md"
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Viewing only; download UI is hidden.
      </p>
    </main>
  )
}
