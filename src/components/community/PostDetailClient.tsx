'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  COMMUNITY_INPUT_WARNING,
  type CommunityPost,
  type CommunityReply,
  isModeratorRole,
} from '@/lib/community'
import useUser from '@/hooks/useUser'
import { StatusPill } from './CommunityPrimitives'

export function PostDetailClient({
  initialPost,
  initialReplies,
}: {
  initialPost: CommunityPost
  initialReplies: CommunityReply[]
}) {
  const { user, loading } = useUser()
  const [post, setPost] = useState(initialPost)
  const [replies, setReplies] = useState(initialReplies)
  const [replyBody, setReplyBody] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const isModerator = isModeratorRole(user?.role)

  async function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/api/community/posts/${post.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyBody }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Could not reply')
      setReplies((current) => [...current, payload.reply])
      setPost((current) => ({
        ...current,
        reply_count: current.reply_count + 1,
      }))
      setReplyBody('')
    } catch (err: any) {
      setMessage(err?.message || 'Could not reply')
    } finally {
      setBusy(false)
    }
  }

  async function updatePost(payload: Record<string, unknown>) {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/api/community/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not update post')
      setPost(data.post)
    } catch (err: any) {
      setMessage(err?.message || 'Could not update post')
    } finally {
      setBusy(false)
    }
  }

  async function verifyReply(replyId: string) {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/api/community/replies/${replyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerifiedAnswer: true }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not verify reply')
      setReplies((current) =>
        current.map((reply) => ({
          ...reply,
          is_verified_answer: reply.id === replyId,
        })),
      )
      setPost((current) => ({
        ...current,
        status: 'answered',
        is_verified_by_medqas: true,
      }))
    } catch (err: any) {
      setMessage(err?.message || 'Could not verify reply')
    } finally {
      setBusy(false)
    }
  }

  async function upvoteReply(replyId: string) {
    setMessage('')
    try {
      const response = await fetch(`/api/community/replies/${replyId}/upvote`, {
        method: 'POST',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not upvote')
      setReplies((current) =>
        current.map((reply) => (reply.id === replyId ? data.reply : reply)),
      )
    } catch (err: any) {
      setMessage(err?.message || 'Could not upvote')
    }
  }

  async function report(path: string) {
    const reason =
      window.prompt('Reason for report?') || 'Needs moderator review'
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    setMessage(
      response.ok ? 'Report submitted for moderator review.' : 'Report failed.',
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/community"
        className="text-sm font-medium text-primary hover:underline"
      >
        Back to community
      </Link>

      <article className="mt-4 rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill>{post.post_type}</StatusPill>
          <StatusPill tone={post.status === 'answered' ? 'green' : 'neutral'}>
            {post.status}
          </StatusPill>
          {post.is_pinned ? <StatusPill tone="blue">Pinned</StatusPill> : null}
          {post.is_verified_by_medqas ? (
            <StatusPill tone="green">MEDQAS verified</StatusPill>
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{post.author_name || 'Student'}</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
          <span>{post.category_slug.replaceAll('-', ' ')}</span>
          <span>{post.subject}</span>
          {post.topic ? <span>{post.topic}</span> : null}
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7">
          {post.body}
        </p>
        {post.tags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => report(`/api/community/posts/${post.id}/report`)}
          >
            Report
          </Button>
          {isModerator ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => updatePost({ isPinned: !post.is_pinned })}
              >
                {post.is_pinned ? 'Unpin post' : 'Pin post'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => updatePost({ status: 'answered' })}
              >
                Mark answered
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => updatePost({ status: 'closed' })}
              >
                Close discussion
              </Button>
            </>
          ) : null}
        </div>
      </article>

      {message ? (
        <p className="mt-4 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Replies</h2>
        <div className="mt-4 space-y-3">
          {replies.length === 0 ? (
            <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
              No replies yet. Be the first to help with a focused answer.
            </div>
          ) : (
            replies.map((reply) => (
              <article key={reply.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {reply.is_verified_answer ? (
                    <StatusPill tone="green">Verified MEDQAS Answer</StatusPill>
                  ) : null}
                  {reply.is_admin_reply ? (
                    <StatusPill tone="blue">MEDQAS moderator</StatusPill>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {reply.author_name || 'Student'} -{' '}
                    {new Date(reply.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7">
                  {reply.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => upvoteReply(reply.id)}
                  >
                    Helpful - {reply.upvote_count}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      report(`/api/community/replies/${reply.id}/report`)
                    }
                  >
                    Report
                  </Button>
                  {isModerator && !reply.is_verified_answer ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => verifyReply(reply.id)}
                    >
                      Mark verified answer
                    </Button>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-semibold">Reply</h2>
        <p className="mt-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          {COMMUNITY_INPUT_WARNING}
        </p>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Checking session...
          </p>
        ) : !user ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to reply.
            </p>
            <Button className="mt-3" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        ) : post.status === 'closed' ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This discussion is closed.
          </p>
        ) : (
          <form onSubmit={submitReply} className="mt-4 grid gap-3">
            <Textarea
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              rows={5}
              placeholder="Write a clear CEE-focused answer or follow-up question."
              required
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                {busy ? 'Posting...' : 'Post reply'}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
