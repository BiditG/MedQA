'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import useUser from '@/hooks/useUser'
import type { CommunityPost, CommunityReply } from '@/lib/community'
import { PostList } from './CommunityPrimitives'

export function MyPostsClient() {
  const { user, loading } = useUser()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [replies, setReplies] = useState<CommunityReply[]>([])
  const [savedPosts, setSavedPosts] = useState<CommunityPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    setLoadingPosts(true)
    fetch('/api/community/my-posts')
      .then((response) => response.json())
      .then((payload) => {
        setPosts(payload.posts || [])
        setReplies(payload.replies || [])
        setSavedPosts(payload.savedPosts || [])
      })
      .finally(() => setLoadingPosts(false))
  }, [user?.id])

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-5">Checking session...</div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Login required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to view your posts, replies, saved posts, and doubt status.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    )
  }

  const answered = posts.filter((post) => post.status === 'answered')
  const unanswered = posts.filter((post) => post.status === 'open')

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Your posts</h2>
        {loadingPosts ? (
          <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
            Loading your community activity...
          </div>
        ) : (
          <PostList
            posts={posts}
            emptyText="You have not created a post yet."
          />
        )}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-semibold">Answered doubts</h2>
          <PostList posts={answered} emptyText="No answered doubts yet." />
        </div>
        <div>
          <h2 className="mb-3 text-xl font-semibold">Unanswered doubts</h2>
          <PostList posts={unanswered} emptyText="No open doubts right now." />
        </div>
      </section>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-xl font-semibold">Replies and saved posts</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Your replies</h3>
            {replies.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                You have not replied yet.
              </p>
            ) : (
              <div className="mt-3 divide-y rounded-md border">
                {replies.map((reply) => (
                  <Link
                    key={reply.id}
                    href={`/community/post/${reply.post_id}`}
                    className="block p-3 text-sm hover:bg-muted/30"
                  >
                    <span className="line-clamp-2">{reply.body}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {reply.upvote_count} helpful votes
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold">Saved posts</h3>
            <div className="mt-3">
              <PostList posts={savedPosts} emptyText="No saved posts yet." />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
