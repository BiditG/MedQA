'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, Megaphone, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import useUser from '@/hooks/useUser'
import {
  communityCategories,
  postTypes,
  subjects,
  type CommunityPost,
} from '@/lib/community'

const emptyForm = {
  title: '',
  slug: '',
  body: '',
  category_slug: 'ask-a-doubt',
  subject: 'General',
  topic: '',
  tags: '',
  post_type: 'Discussion',
  status: 'open',
  is_pinned: false,
  is_featured: false,
  is_verified_by_medqas: false,
  author_name: 'MEDQAS Team',
}

export default function AdminCommunityPage() {
  const { user, loading } = useUser()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all')

  const editingPost = useMemo(
    () => posts.find((post) => post.id === editingId) || null,
    [editingId, posts],
  )

  const visiblePosts = useMemo(() => {
    if (filter === 'all') return posts
    if (filter === 'Announcement') {
      return posts.filter((post) => post.post_type === 'Announcement')
    }
    return posts.filter((post) => post.status === filter)
  }, [filter, posts])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    loadPosts()
  }, [user])

  async function loadPosts() {
    setFetching(true)
    setMessage('')
    try {
      const response = await adminFetch('/api/admin/community-posts')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Failed to load posts')
      setPosts(payload.posts || [])
    } catch (err: any) {
      setMessage(err?.message || 'Failed to load posts')
    } finally {
      setFetching(false)
    }
  }

  function startNew() {
    setEditingId(null)
    setForm(emptyForm)
    setMessage('')
  }

  function startAnnouncement() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      category_slug: 'medqas-announcements',
      post_type: 'Announcement',
      author_name: 'MEDQAS Team',
      is_pinned: true,
      is_verified_by_medqas: true,
    })
    setMessage('')
  }

  function startEdit(post: CommunityPost) {
    setEditingId(post.id)
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      body: post.body || '',
      category_slug: post.category_slug || 'ask-a-doubt',
      subject: post.subject || 'General',
      topic: post.topic || '',
      tags: (post.tags || []).join(', '),
      post_type: post.post_type || 'Discussion',
      status: post.status || 'open',
      is_pinned: post.is_pinned,
      is_featured: post.is_featured,
      is_verified_by_medqas: post.is_verified_by_medqas,
      author_name: post.author_name || 'MEDQAS Team',
    })
    setMessage('')
  }

  async function savePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const url = editingId
        ? `/api/admin/community-posts/${editingId}`
        : '/api/admin/community-posts'
      const response = await adminFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Save failed')

      setMessage(
        editingId ? 'Community post updated' : 'Community post created',
      )
      setEditingId(payload.post?.id || null)
      await loadPosts()
    } catch (err: any) {
      setMessage(err?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(post: CommunityPost) {
    if (!confirm(`Delete "${post.title}"?`)) return
    setMessage('')

    try {
      const response = await adminFetch(
        `/api/admin/community-posts/${post.id}`,
        {
          method: 'DELETE',
        },
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Delete failed')
      if (editingId === post.id) startNew()
      setMessage('Community post deleted')
      await loadPosts()
    } catch (err: any) {
      setMessage(err?.message || 'Delete failed')
    }
  }

  if (loading) return <div className="p-6">Checking admin session...</div>
  if (!user) return <div className="p-6">Please sign in as admin.</div>
  if (user.role !== 'admin') return <div className="p-6">Access denied.</div>

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground">
            Admin
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Community Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create announcements and manage CEE forum posts from one moderated
            workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={startAnnouncement}>
            <Megaphone className="mr-2 h-4 w-4" aria-hidden />
            New announcement
          </Button>
          <Button type="button" onClick={startNew}>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            New post
          </Button>
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-md border bg-card px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Forum posts</h2>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="Announcement">Announcements</option>
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="max-h-[72vh] overflow-auto p-2">
            {fetching ? (
              <div className="p-3 text-sm text-muted-foreground">
                Loading posts...
              </div>
            ) : visiblePosts.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No community posts yet.
              </div>
            ) : (
              visiblePosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => startEdit(post)}
                  className={`mb-2 w-full rounded-md border p-3 text-left transition-colors ${
                    post.id === editingId
                      ? 'border-primary bg-primary/5'
                      : 'bg-background hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {post.title}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{post.post_type}</span>
                        <span>{post.status}</span>
                        <span>{post.subject}</span>
                      </div>
                    </div>
                    {post.is_pinned ? (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        pinned
                      </span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <form onSubmit={savePost} className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {editingPost ? 'Edit community post' : 'Create community post'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Announcement posts automatically appear on the announcements
                page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {editingPost ? (
                <>
                  <Button variant="outline" asChild type="button">
                    <Link
                      href={`/community/post/${editingPost.id}`}
                      target="_blank"
                    >
                      <Eye className="mr-2 h-4 w-4" aria-hidden />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => deletePost(editingPost)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                </>
              ) : null}
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Pencil className="mr-2 h-4 w-4" aria-hidden />
                ) : (
                  <Save className="mr-2 h-4 w-4" aria-hidden />
                )}
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: current.slug || slugify(event.target.value),
                  }))
                }
                required
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: slugify(event.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Category">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.category_slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category_slug: event.target.value,
                  }))
                }
              >
                {communityCategories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Post type">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.post_type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    post_type: event.target.value,
                    category_slug:
                      event.target.value === 'Announcement'
                        ? 'medqas-announcements'
                        : current.category_slug,
                    is_verified_by_medqas:
                      event.target.value === 'Announcement' ||
                      current.is_verified_by_medqas,
                  }))
                }
              >
                {postTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subject">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
            </Field>
            <Field label="Status">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
            <Field label="Topic/Chapter">
              <Input
                value={form.topic}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    topic: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Tags">
              <Input
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                placeholder="comma separated"
              />
            </Field>
          </div>

          <Field label="Body" className="mt-4">
            <Textarea
              className="min-h-[260px]"
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              required
            />
          </Field>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <CheckboxField
              label="Pinned"
              checked={form.is_pinned}
              onChange={(checked) =>
                setForm((current) => ({ ...current, is_pinned: checked }))
              }
            />
            <CheckboxField
              label="Featured"
              checked={form.is_featured}
              onChange={(checked) =>
                setForm((current) => ({ ...current, is_featured: checked }))
              }
            />
            <CheckboxField
              label="MEDQAS verified"
              checked={form.is_verified_by_medqas}
              onChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  is_verified_by_medqas: checked,
                }))
              }
            />
          </div>
        </form>
      </div>
    </main>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

function adminFetch(url: string, init: RequestInit = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : ''
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
