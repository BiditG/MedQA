'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { Spinner } from '@/components/ui/spinner'
import { Clipboard, MessageSquare } from 'lucide-react'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

export default function DiagnosePage() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [disease, setDisease] = useState('')
  const [revealAfter, setRevealAfter] = useState<number>(3)
  const endRef = useRef<HTMLDivElement | null>(null)
  const paneRef = useRef<HTMLDivElement | null>(null)

  const askedCount = useMemo(
    () => messages.filter((m) => m.role === 'user').length,
    [messages],
  )
  const progress = useMemo(
    () =>
      Math.min(100, Math.round((askedCount / Math.max(1, revealAfter)) * 100)),
    [askedCount, revealAfter],
  )

  async function callDiagnoseAPI(msgs: ChatMsg[]) {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs,
          disease: disease || undefined,
          attempts: revealAfter,
        }),
      })
      const data = await res.json()
      if (data?.reply)
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
      if (typeof data?.revealed === 'boolean')
        setRevealed(Boolean(data.revealed))
    } catch (e) {
      // consider adding a toast here
    } finally {
      setLoading(false)
    }
  }

  async function startSession() {
    setMessages([])
    setRevealed(false)
    setStarted(true)
    const kickOff: ChatMsg = {
      role: 'user',
      content: 'Start consultation. Present your chief complaint briefly.',
    }
    const next = [kickOff]
    setMessages(next)
    await callDiagnoseAPI(next)
  }

  async function send() {
    if (!input.trim()) return
    const next = [...messages, { role: 'user' as const, content: input.trim() }]
    setMessages(next)
    setInput('')
    await callDiagnoseAPI(next)
  }

  function endSession() {
    setMessages([])
    setInput('')
    setLoading(false)
    setStarted(false)
    setRevealed(false)
  }

  useEffect(() => {
    const el = paneRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function copyText(t: string) {
    try {
      await navigator.clipboard.writeText(t)
    } catch {}
  }

  const starterChips = [
    'Onset and duration?',
    'Any associated symptoms?',
    'What worsens or relieves it?',
  ]

  return (
    <div className="w-full">
      <PageHeader
        title="Diagnose with AI"
        subtitle="Interview the patient and guess the diagnosis."
      />

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="font-medium">Progress</span>
              <div className="hidden rounded-full bg-muted/10 px-2 py-0.5 text-xs text-muted-foreground md:inline">
                {askedCount}/{revealAfter} questions
              </div>
            </div>
            <div className="text-xs">
              {revealed ? 'Diagnosis revealed' : 'Keep asking'}
            </div>
          </div>
          <Progress value={progress} />

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Patient Interview
                {revealed && (
                  <Badge className="ml-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                    Diagnosis revealed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-0">
              <div
                ref={paneRef}
                className="max-h-[60vh] min-h-[40vh] divide-y overflow-y-auto p-4 md:max-h-[68vh] lg:max-h-[72vh]"
              >
                {messages.length === 0 ? (
                  <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
                    Click &quot;Generate patient&quot; to start a new case. Ask
                    focused questions to uncover the diagnosis.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <div key={i} className="group">
                        <ChatBubble
                          role={m.role === 'assistant' ? 'patient' : 'user'}
                        >
                          {m.content}
                        </ChatBubble>
                        {m.role === 'assistant' && (
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => copyText(m.content)}
                              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              aria-label="Copy answer"
                            >
                              <Clipboard className="h-3.5 w-3.5" /> Copy
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="sticky bottom-0 z-10 mt-4 bg-background/60 p-4 md:p-6">
                {!started && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {starterChips.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setInput(s)}
                        className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder={
                        started
                          ? 'Ask a focused question…'
                          : 'Generate a patient to begin'
                      }
                      value={input}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setInput(e.target.value)
                      }
                      disabled={!started || loading}
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLTextAreaElement>,
                      ) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          send()
                        }
                      }}
                      className="max-h-40 min-h-[56px]"
                      aria-label="Message input"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Shift+Enter for newline • Press Enter to send
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={send}
                      disabled={!started || loading || !input.trim()}
                      className="h-10"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-1">
                          <Spinner /> Sending…
                        </span>
                      ) : (
                        'Send'
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={startSession}
                        disabled={loading}
                        className="h-9"
                      >
                        Generate patient
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={endSession}
                        disabled={!started || loading}
                        className="h-9"
                      >
                        End
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="mb-3">
                <div className="mb-1 text-xs text-muted-foreground">
                  Seed disease (optional)
                </div>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary/50"
                  placeholder="e.g., Appendicitis"
                  value={disease}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDisease(e.target.value)
                  }
                  disabled={started}
                  aria-label="Seed disease"
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">
                  Reveal after (questions)
                </div>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary/50"
                  type="number"
                  min={3}
                  max={6}
                  value={revealAfter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRevealAfter(
                      Math.min(6, Math.max(3, Number(e.target.value) || 3)),
                    )
                  }
                  disabled={started}
                  aria-label="Reveal after"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Keep interviewing until the progress bar fills. The patient will
              then reveal the likely diagnosis with a brief rationale.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
