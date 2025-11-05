'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { createBrowserClient } from '@/utils/supabase-browser'
import { useProfile } from '@/hooks/useProfile'
import { useUserStats } from '@/hooks/useUserStats'

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
  const { profile, loading } = useProfile()
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { stats, loading: statsLoading, error: statsError } = useUserStats()

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      const supabase = createBrowserClient()
      // @ts-ignore - supabase v2
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) {
        setMessage(error.message || 'Failed to update password')
      } else {
        setMessage('Password updated successfully')
        setNewPassword('')
      }
    } catch (err: any) {
      setMessage(err?.message || String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    window.location.href = '/'
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
                          profile.premium
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {tierLabel(profile)}
                      </div>
                      {profile?.premium_expires_at ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {Math.max(
                            0,
                            Math.ceil(
                              (new Date(profile.premium_expires_at).getTime() -
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

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
                  >
                    Sign out
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
                ].map((s, i) => (
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
            <form
              onSubmit={handleChangePassword}
              className="rounded-md bg-card p-4"
            >
              <h2 className="mb-2 font-medium">Change password</h2>
              <div className="mb-2 text-sm text-muted-foreground">
                Enter a new password (min 8 characters)
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
                placeholder="New password"
                aria-label="New password"
              />
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Change password'}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-md border px-3 py-2"
                >
                  Sign out
                </button>
              </div>
              {message && (
                <div className="mt-2 text-sm text-red-600">{message}</div>
              )}
            </form>

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
