import { CommunityHeader } from '@/components/community/CommunityPrimitives'
import { AskPostForm } from '@/components/community/AskPostForm'

export const metadata = {
  title: 'Ask a CEE Doubt',
}

export default function AskCommunityPostPage() {
  return (
    <main className="w-full">
      <CommunityHeader
        title="Ask a Doubt"
        description="Create a focused CEE post with subject, topic, and tags so students and MEDQAS moderators can help efficiently."
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <AskPostForm />
      </div>
    </main>
  )
}
