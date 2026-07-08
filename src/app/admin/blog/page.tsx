'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import useUser from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { FileText, Pencil, Plus, Save, Trash2 } from 'lucide-react'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string[] | null
  status: 'draft' | 'published'
  cta_label?: string | null
  cta_href?: string | null
  author_name?: string | null
  published_at?: string | null
  updated_at?: string | null
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  meta_title: '',
  meta_description: '',
  keywords: 'CEE syllabus 2026, best books for CEE Nepal, CEE Nepal',
  status: 'draft',
  cta_label: 'Try a free CEE mock quiz on MEDQAS',
  cta_href: '/cee-mcqs',
  author_name: 'MEDQAS Team',
}

export default function AdminBlogPage() {
  const { user, loading } = useUser()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const editingPost = useMemo(
    () => posts.find((post) => post.id === editingId),
    [editingId, posts],
  )

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    loadPosts()
  }, [user])

  async function loadPosts() {
    setFetching(true)
    setMessage(null)
    try {
      const resp = await adminFetch('/api/admin/blog-posts')
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Failed to load posts')
      setPosts(data.posts || [])
    } catch (e: any) {
      setMessage(e?.message || 'Failed to load posts')
    } finally {
      setFetching(false)
    }
  }

  function startNew() {
    setEditingId(null)
    setForm(emptyForm)
    setMessage(null)
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id)
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      keywords: (post.keywords || []).join(', '),
      status: post.status || 'draft',
      cta_label: post.cta_label || 'Try a free CEE mock quiz on MEDQAS',
      cta_href: post.cta_href || '/cee-mcqs',
      author_name: post.author_name || 'MEDQAS Team',
    })
    setMessage(null)
  }

  async function savePost(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const url = editingId
        ? `/api/admin/blog-posts/${editingId}`
        : '/api/admin/blog-posts'
      const resp = await adminFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Save failed')
      setMessage(editingId ? 'Blog post updated' : 'Blog post created')
      setEditingId(data.post?.id || null)
      await loadPosts()
    } catch (e: any) {
      setMessage(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return
    setMessage(null)
    try {
      const resp = await adminFetch(`/api/admin/blog-posts/${post.id}`, {
        method: 'DELETE',
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error || 'Delete failed')
      if (editingId === post.id) startNew()
      setMessage('Blog post deleted')
      await loadPosts()
    } catch (e: any) {
      setMessage(e?.message || 'Delete failed')
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
          <h1 className="mt-1 text-2xl font-semibold">Blog Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish SEO posts for searches like CEE syllabus 2026 and best books
            for CEE Nepal.
          </p>
        </div>
        <Button type="button" onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden />
          New post
        </Button>
      </div>

      {message ? (
        <div className="mb-4 rounded-md border bg-card px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold">Posts</h2>
          </div>
          <div className="max-h-[72vh] overflow-auto p-2">
            {fetching ? (
              <div className="p-3 text-sm text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No posts yet.
              </div>
            ) : (
              posts.map((post) => (
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
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {post.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{post.status}</span>
                        <span>/</span>
                        <span className="truncate">/{post.slug}</span>
                      </div>
                    </div>
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
                {editingPost ? 'Edit post' : 'Create post'}
              </h2>
              <p className="text-sm text-muted-foreground">
                Use the exact search phrase in the title, H1, first paragraph,
                and meta fields.
              </p>
            </div>
            <div className="flex gap-2">
              {editingPost ? (
                <>
                  <Button variant="outline" asChild type="button">
                    <Link href={`/blog/${editingPost.slug}`} target="_blank">
                      Preview
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => deletePost(editingPost)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </Button>
                </>
              ) : null}
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <Pencil className="h-4 w-4" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: form.slug || slugify(e.target.value),
                  })
                }
                required
              />
            </Field>
            <Field label="Slug">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: slugify(e.target.value) })
                }
                required
              />
            </Field>
            <Field label="Meta title">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.meta_title}
                onChange={(e) =>
                  setForm({ ...form, meta_title: e.target.value })
                }
              />
            </Field>
            <Field label="Meta description">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.meta_description}
                onChange={(e) =>
                  setForm({ ...form, meta_description: e.target.value })
                }
              />
            </Field>
            <Field label="Keywords">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          <Field label="Excerpt" className="mt-4">
            <textarea
              className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </Field>

          <Field label="Markdown content" className="mt-4">
            <textarea
              className="min-h-[420px] w-full rounded-md border bg-background px-3 py-2 font-mono text-sm leading-6"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </Field>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="CTA label">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.cta_label}
                onChange={(e) =>
                  setForm({ ...form, cta_label: e.target.value })
                }
              />
            </Field>
            <Field label="CTA link">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.cta_href}
                onChange={(e) => setForm({ ...form, cta_href: e.target.value })}
              />
            </Field>
            <Field label="Author">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={form.author_name}
                onChange={(e) =>
                  setForm({ ...form, author_name: e.target.value })
                }
              />
            </Field>
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
