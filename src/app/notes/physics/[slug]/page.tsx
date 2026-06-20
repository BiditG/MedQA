import { notFound } from 'next/navigation'
import Link from 'next/link'
import { physicsTopics } from '@/data/physicsTopics'
import PdfViewer from '@/components/PdfViewer'

export default function PhysicsTopicPage({
  params,
}: {
  params: { slug: string }
}) {
  const topic = physicsTopics.find((t) => t.slug === params.slug)
  if (!topic) return notFound()

  const filename = topic.filename ?? `${topic.slug}.pdf`
  const pdfSrc = `/notes/physics/${encodeURIComponent(
    filename,
  )}#toolbar=0&navpanes=0&scrollbar=0`

  return (
    <main className="mx-auto max-w-6xl p-4">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/notes/physics" className="hover:underline">
          Physics
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
    </main>
  )
}
