'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  COMMUNITY_INPUT_WARNING,
  communityCategories,
  postTypes,
  subjects,
} from '@/lib/community'
import useUser from '@/hooks/useUser'

export function AskPostForm() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [categorySlug, setCategorySlug] = useState('ask-a-doubt')
  const [form, setForm] = useState({
    title: '',
    body: '',
    subject: 'General',
    topic: '',
    tags: '',
    postType: 'Doubt',
  })

  const allowedPostTypes = useMemo(() => {
    if (user?.role === 'admin' || user?.role === 'moderator') return postTypes
    return postTypes.filter((type) => type !== 'Announcement')
  }, [user?.role])

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-5">Checking session...</div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Login required</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Please sign in to ask a doubt or start a CEE discussion.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    )
  }

  async function submitPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categorySlug }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok)
        throw new Error(payload.error || 'Could not submit post')
      router.push(`/community/post/${payload.post.id}`)
    } catch (err: any) {
      setError(err?.message || 'Could not submit post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitPost} className="rounded-lg border bg-card p-5">
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Title
          <Input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Example: Why does acceleration become zero at highest point?"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Description
          <Textarea
            value={form.body}
            onChange={(event) =>
              setForm((current) => ({ ...current, body: event.target.value }))
            }
            rows={8}
            placeholder="Write the exact concept, MCQ, step, or confusion. Include what you already tried."
            required
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Category
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
            >
              {communityCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Post type
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.postType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  postType: event.target.value,
                }))
              }
            >
              {allowedPostTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Subject
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.subject}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Topic/Chapter
            <Input
              value={form.topic}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  topic: event.target.value,
                }))
              }
              placeholder="Human physiology, Current electricity, MAT..."
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Tags
          <Input
            value={form.tags}
            onChange={(event) =>
              setForm((current) => ({ ...current, tags: event.target.value }))
            }
            placeholder="comma separated: numerical, revision, confusion"
          />
        </label>

        <p className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          {COMMUNITY_INPUT_WARNING}
        </p>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </form>
  )
}
