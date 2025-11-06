'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import useUser from '@/hooks/useUser'

type ProfileRow = {
  id: string
  email?: string
  role?: string
  created_at?: string
}

export default function AdminPageClient() {
  const { user, loading } = useUser()
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    fetchProfiles()
  }, [user])

  async function fetchProfiles() {
    setFetching(true)
    setError(null)
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const resp = await fetch('/api/users', { headers })
      if (!resp.ok) throw new Error('Failed to load users')
      const data = await resp.json()
      setProfiles(data.users || [])
    } catch (e: any) {
      setError(e?.message || 'Error')
    } finally {
      setFetching(false)
    }
  }

  if (loading) return <div className="p-6">Checking session…</div>
  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Please sign in as an admin to access this page.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/login" className="vibrant-btn">
            Sign in
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center rounded-md px-3 py-2 text-sm"
          >
            Profile
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-md px-3 py-2 text-sm"
          >
            Home
          </Link>
        </div>
      </main>
    )
  }

  if (user.role !== 'admin') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You are signed in but not an admin.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <Link href="/" className="text-sm underline">
          Back
        </Link>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Manage user accounts. Use the users panel to create, edit or delete
        accounts.
      </p>

      <div className="mt-6">
        <Link href="/admin/users" className="vibrant-btn">
          Open users panel
        </Link>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Users</h2>
        {fetching ? (
          <div className="mt-3">Loading…</div>
        ) : error ? (
          <div className="mt-3 text-sm text-red-500">{error}</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2 align-top text-sm">{p.id}</td>
                    <td className="px-3 py-2 align-top text-sm">{p.email}</td>
                    <td className="px-3 py-2 align-top text-sm">{p.role}</td>
                    <td className="px-3 py-2 align-top text-sm">
                      {p.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
