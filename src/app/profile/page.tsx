'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import useUser from '@/hooks/useUser'
import { useUserStats } from '@/hooks/useUserStats'
import { signOut as clientSignOut } from '@/utils/auth-client'

function formatDateMaybe(d?: string | null) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return String(d)
  }
}

function tierLabel(profile: any) {
  if (!profile) return 'Free'
  if (profile.premium) return 'Premium'
  return 'Regular'
}

export default function ProfilePage() {
  const { user: profile, loading } = useUser()
  const [newPassword, setNewPassword] = useState('')
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)

  const { stats, loading: statsLoading, error: statsError } = useUserStats()

  async function handleSignOut() {
    clientSignOut()
    window.location.href = '/'
  }

  async function handleSaveProfile() {
    if (!profile) return
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const body: any = {}
      if (name) body.name = name
      if (newPassword) body.password = newPassword
      const resp = await fetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      })
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed')
      // refresh
      window.dispatchEvent(new CustomEvent('auth:change', { detail: {} }))
      setNewPassword('')
      alert('Profile updated')
    } catch (e: any) {
      alert(e?.message || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const reduce = useReducedMotion()
  const container = reduce
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }
  const item = reduce
    ? undefined
    : {
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
      }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="heading-gradient mb-6 text-2xl font-semibold">Profile</h1>

      {loading ? (
        <div className="rounded-md bg-card p-6">Loading profile…</div>
      ) : !profile ? (
        <div className="rounded-md bg-card p-6">You are not signed in.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-start gap-6 rounded-md bg-card p-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
                {(profile.email || '').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Account</div>
                <div className="mt-1 text-lg font-semibold">
                  {profile.email}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Member since
                    </div>
                    <div className="font-medium">
                      {formatDateMaybe(profile.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tier</div>
                    <div>
                      <div
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          (profile as any).premium
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {tierLabel(profile)}
                      </div>
                      {(profile as any)?.premium_expires_at ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Math.max(
                            0,
                            Math.ceil(
                              (new Date(
                                (profile as any).premium_expires_at,
                              ).getTime() -
                                Date.now()) /
                                (1000 * 60 * 60 * 24),
                            ),
                          )}{' '}
                          days left
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
                  >
                    Sign out
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
                  >
                    {saving ? 'Saving…' : 'Save profile'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4">
              {statsError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Failed to load stats: {statsError}
                </div>
              ) : null}

              <motion.div
                variants={container}
                initial={reduce ? undefined : 'hidden'}
                whileInView={reduce ? undefined : 'show'}
                viewport={{ once: true, amount: 0.25 }}
                className="grid grid-cols-2 gap-4 md:grid-cols-4"
              >
                {[
                  { label: 'Total MCQs', value: stats?.total_mcqs ?? 0 },
                  { label: 'Correct MCQs', value: stats?.total_correct ?? 0 },
                  { label: 'XP', value: stats?.xp ?? 0 },
                  { label: 'Rank', value: stats?.rank ?? '—' },
                ].map((s, _i) => (
                  <motion.div
                    key={s.label}
                    variants={item}
                    className="rounded-md border bg-card p-4"
                  >
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-1 text-2xl font-semibold">
                      {statsLoading ? '—' : s.value}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {profile?.role === 'admin' && (
              <div className="mt-4 rounded-md bg-card p-4">
                <h2 className="mb-2 font-medium">Admin dashboard</h2>
                <p className="text-sm text-muted-foreground">
                  You are an admin. Use the admin panel to manage users and
                  content.
                </p>
                <div className="mt-3">
                  <a href="/admin" className="text-sm text-blue-600 underline">
                    Open admin panel
                  </a>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-md bg-card p-4">
              <h2 className="mb-2 font-medium">Account</h2>
              <p className="text-sm text-muted-foreground">
                You can update your name and password here.
              </p>
              <div className="mt-3 space-y-2">
                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-md border px-3 py-2"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="rounded-md border px-3 py-2"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-card p-4">
              <h3 className="mb-2 font-medium">Account details</h3>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="break-words font-medium">{profile.email}</div>
              <div className="mt-3 text-sm text-muted-foreground">Role</div>
              <div className="font-medium">{profile.role ?? 'user'}</div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
