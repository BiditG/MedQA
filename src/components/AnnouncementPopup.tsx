'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useUser from '@/hooks/useUser'
import type { CommunityPost } from '@/lib/community'

const STORAGE_KEY = 'medqas_seen_announcement_id'
const POLL_MS = 60 * 1000

export function AnnouncementPopup() {
  const { user, loading } = useUser()
  const [announcement, setAnnouncement] = useState<CommunityPost | null>(null)
  const [open, setOpen] = useState(false)

  const loadLatest = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/announcements/latest', {
        cache: 'no-store',
      })
      if (!response.ok) return

      const payload = await response.json()
      const latest = payload.announcement as CommunityPost | null
      if (!latest?.id) return

      const seenId = localStorage.getItem(STORAGE_KEY)
      if (seenId === latest.id) return

      setAnnouncement(latest)
      setOpen(true)
    } catch {
      // Announcement checks should never interrupt studying.
    }
  }, [user])

  useEffect(() => {
    if (loading || !user) return

    loadLatest()
    const timer = window.setInterval(loadLatest, POLL_MS)
    return () => window.clearInterval(timer)
  }, [loadLatest, loading, user])

  function markSeen() {
    if (announcement?.id) {
      localStorage.setItem(STORAGE_KEY, announcement.id)
    }
    setOpen(false)
  }

  if (!user || !announcement) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) markSeen()
        else setOpen(true)
      }}
    >
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md border bg-primary/10 text-primary">
            <Megaphone className="h-5 w-5" aria-hidden />
          </div>
          <DialogTitle>New MEDQAS announcement</DialogTitle>
          <DialogDescription>
            {new Date(announcement.created_at).toLocaleDateString()} by{' '}
            {announcement.author_name || 'MEDQAS Team'}
          </DialogDescription>
        </DialogHeader>

        <div>
          <h2 className="text-base font-semibold leading-6">
            {announcement.title}
          </h2>
          <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {announcement.body}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={markSeen}>
            Dismiss
          </Button>
          <Button asChild onClick={markSeen}>
            <Link href="/announcements">View announcements</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
