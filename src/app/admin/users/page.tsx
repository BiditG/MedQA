'use client'

import React, { useEffect, useState } from 'react'
import useUser from '@/hooks/useUser'
import Link from 'next/link'

type UserRow = {
  id: string
  name?: string
  email?: string
  role?: string
  created_at?: string
}

export default function AdminUsers() {
  const { user, loading } = useUser()
  const [users, setUsers] = useState<UserRow[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [fetching, setFetching] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  })
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    name?: string
    email?: string
    password?: string
    role?: string
  }>({})

  useEffect(() => {
    if (!user) return
    if (user.role !== 'admin') return
    fetchUsers()
  }, [user])

  async function fetchUsers() {
    setFetching(true)
    setMessage(null)
    try {
      const resp = await fetch('/api/profiles')
      if (!resp.ok) throw new Error('Failed to load users')
      const data = await resp.json()
      setUsers(data.users || [])
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    } finally {
      setFetching(false)
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    try {
      const resp = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Create failed')
      setMessage('User created')
      setForm({ name: '', email: '', password: '', role: 'user' })
      fetchUsers()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this user?')) return
    try {
      const resp = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE',
        headers: {},
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error || 'Delete failed')
      setMessage('User deleted')
      fetchUsers()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    }
  }

  function startEdit(u: UserRow) {
    setEditingId(u.id)
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'user',
      password: '',
    })
  }

  async function saveEdit(id: string) {
    try {
      const body: any = {}
      if (editForm.name) body.name = editForm.name
      if (editForm.email) body.email = editForm.email
      if (editForm.role) body.role = editForm.role
      if (editForm.password) body.password = editForm.password
      const resp = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error || 'Update failed')
      setMessage('User updated')
      setEditingId(null)
      setEditForm({})
      fetchUsers()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    }
  }

  if (loading) return <div>Loading…</div>
  if (!user) return <div>Please sign in as admin to manage users.</div>
  if (user.role !== 'admin') return <div>Access denied — admin only.</div>

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredUsers = normalizedSearch
    ? users.filter((u) =>
        [u.name, u.email, u.role, u.id].some((value) =>
          (value || '').toLowerCase().includes(normalizedSearch),
        ),
      )
    : users

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin — Users</h1>
        <nav className="text-sm">
          <Link className="btn-ghost mr-2" href="/admin/users">
            Users
          </Link>
          <Link className="btn-ghost" href="/admin/exam-codes">
            Exam Codes
          </Link>
        </nav>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <form
          onSubmit={onCreate}
          className="space-y-2 rounded-md border bg-card p-4"
        >
          <h2 className="text-lg font-medium">Create user</h2>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
            required
          />
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            required
          />
          <select
            className="w-full rounded-md border px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex items-center gap-2">
            <button className="vibrant-btn" type="submit">
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({ name: '', email: '', password: '', role: 'user' })
                setMessage(null)
              }}
              className="btn-ghost"
            >
              Reset
            </button>
          </div>
          {message && (
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          )}
        </form>

        <div className="rounded-md border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-medium">Users</h2>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm sm:max-w-xs"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {fetching ? (
            <div>Loading…</div>
          ) : (
            <div className="mt-2 max-h-72 overflow-auto text-sm">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr>
                    <th className="py-1">Name</th>
                    <th className="py-1">Email</th>
                    <th className="py-1">Role</th>
                    <th className="py-1">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t align-top">
                      <td className="py-2">
                        {editingId === u.id ? (
                          <input
                            className="w-full rounded-md border px-2 py-1"
                            value={editForm.name || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                          />
                        ) : (
                          u.name
                        )}
                      </td>
                      <td className="py-2">
                        {editingId === u.id ? (
                          <input
                            className="w-full rounded-md border px-2 py-1"
                            type="email"
                            value={editForm.email || ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                email: e.target.value,
                              })
                            }
                          />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td className="py-2">
                        {editingId === u.id ? (
                          <select
                            className="w-full rounded-md border px-2 py-1"
                            value={editForm.role || 'user'}
                            onChange={(e) =>
                              setEditForm({ ...editForm, role: e.target.value })
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          u.role
                        )}
                      </td>
                      <td className="py-2">
                        <div className="text-xs text-muted-foreground">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleString()
                            : '-'}
                        </div>
                        {editingId === u.id ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <input
                              className="w-full rounded-md border px-2 py-1"
                              type="password"
                              placeholder="New password (optional)"
                              value={editForm.password || ''}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  password: e.target.value,
                                })
                              }
                            />
                            <div className="flex items-center gap-2">
                              <button
                                className="vibrant-btn"
                                onClick={() => saveEdit(u.id)}
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                className="btn-ghost"
                                onClick={() => {
                                  setEditingId(null)
                                  setEditForm({})
                                }}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              className="btn-ghost"
                              onClick={() => startEdit(u)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="btn-ghost text-red-600"
                              onClick={() => onDelete(u.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        className="border-t py-4 text-center text-muted-foreground"
                        colSpan={4}
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
