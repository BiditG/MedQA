import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/utils/auth'
import AdminPremiumToggle from '@/components/AdminPremiumToggle'
import { revalidatePath } from 'next/cache'
import WeeklyExamConfig from '@/components/WeeklyExamConfig'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
}

// Server action to set premium flag using service role and revalidate the admin page
export async function setPremiumAction(formData: FormData) {
  'use server'
  try {
    const id = String(formData.get('id') || '')
    const value = String(formData.get('value') || 'false') === 'true'
    if (!id) return null
    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    // use update to avoid changing other columns
    const { error } = await svc
      .from('profiles')
      .update({ premium: value })
      .eq('id', id)
    if (error) console.error('[admin][setPremiumAction] update error', error)
    // revalidate the admin page so SSR content refreshes
    try {
      revalidatePath('/admin')
    } catch (e) {
      /* ignore */
    }
  } catch (e) {
    console.error('[admin][setPremiumAction] unexpected', e)
  }
  return null
}

// Server action: toggle active status of a weekly code
export async function toggleWeeklyCodeAction(formData: FormData) {
  'use server'
  try {
    const id = String(formData.get('id') || '')
    const active = String(formData.get('active') || 'true') === 'true'
    if (!id) return null
    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    await svc.from('weekly_codes').update({ active }).eq('id', id)
    try {
      revalidatePath('/admin')
    } catch {}
  } catch (e) {
    console.error('[admin][toggleWeeklyCodeAction] unexpected', e)
  }
  return null
}

// Server action: delete a weekly code
export async function deleteWeeklyCodeAction(formData: FormData) {
  'use server'
  try {
    const id = String(formData.get('id') || '')
    if (!id) return null
    const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    await svc.from('weekly_codes').delete().eq('id', id)
    try {
      revalidatePath('/admin')
    } catch {}
  } catch (e) {
    console.error('[admin][deleteWeeklyCodeAction] unexpected', e)
  }
  return null
}

export default async function AdminPage() {
  const admin = await requireAdmin()
  if (!admin) return redirect('/')

  const supabase = await getServiceClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch weekly exam codes
  const { data: weeklyCodes } = await supabase
    .from('weekly_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <Link href="/" className="text-sm underline">
          Back
        </Link>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Manage user subscriptions and profiles.
      </p>

      {/* Weekly Exam settings */}
      <div className="mt-6">
        <WeeklyExamConfig />
      </div>

      {/* Weekly Exam codes list */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Weekly Exam Codes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle codes on/off or delete them. Expired codes are treated as
          invalid.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {weeklyCodes?.map((c: any) => {
                const expired =
                  c.expires_at && new Date(c.expires_at).getTime() <= Date.now()
                return (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2 font-mono text-sm">{c.code}</td>
                    <td className="px-3 py-2 text-sm">
                      {c.active ? 'yes' : 'no'}
                      {expired ? ' (expired)' : ''}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <form action={toggleWeeklyCodeAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={(!c.active).toString()}
                          />
                          <button className="rounded border px-2 py-1 text-xs">
                            {c.active ? 'Disable' : 'Enable'}
                          </button>
                        </form>
                        <form action={deleteWeeklyCodeAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <button className="rounded border px-2 py-1 text-xs text-red-600">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        {/* Desktop / large screens: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Premium</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 align-top text-sm">{p.id}</td>
                  <td className="px-3 py-2 align-top text-sm">{p.email}</td>
                  <td className="px-3 py-2 align-top text-sm">{p.role}</td>
                  <td className="px-3 py-2 align-top text-sm">
                    {p.premium ? 'yes' : 'no'}
                  </td>
                  <td className="px-3 py-2 align-top text-sm">
                    {p.premium_expires_at
                      ? new Date(p.premium_expires_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2 align-top text-sm">
                    {p.created_at}
                  </td>
                  <td className="px-3 py-2 align-top text-sm">
                    {/* Client toggle to show confirmation toast */}
                    <div className="mb-2">
                      {/* @ts-ignore */}
                      <AdminPremiumToggle id={p.id} initial={!!p.premium} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile / small screens: stacked cards */}
        <div className="block space-y-3 md:hidden">
          {profiles?.map((p: any) => (
            <div key={p.id} className="rounded-md border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="break-words font-medium">{p.email}</div>
                  <div className="mt-2 text-sm text-muted-foreground">Role</div>
                  <div className="font-medium">{p.role}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Member since
                  </div>
                  <div className="font-medium">{p.created_at}</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="text-sm">
                    {p.premium ? 'Premium' : 'Regular'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {p.premium_expires_at
                      ? `${Math.max(
                          0,
                          Math.ceil(
                            (new Date(p.premium_expires_at).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24),
                          ),
                        )} days left`
                      : ''}
                  </div>
                  {/* @ts-ignore */}
                  <AdminPremiumToggle id={p.id} initial={!!p.premium} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
