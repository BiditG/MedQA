'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { Spinner } from '@/components/ui/spinner'
import {
  Clipboard,
  MessageSquare,
  RefreshCcw,
  Play,
  X,
  Sparkles,
} from 'lucide-react'

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
  const [showScrollBtn, setShowScrollBtn] = useState(false)

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
      // TODO: optional toast
      console.error(e)
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

  // Auto-scroll on new messages/loading
  useEffect(() => {
    const el = paneRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Show scroll-to-bottom button if not at bottom
  useEffect(() => {
    const pane = paneRef.current
    if (!pane) return
    function handleScroll() {
      if (!pane) return
      const atBottom =
        pane.scrollHeight - pane.scrollTop - pane.clientHeight < 40
      setShowScrollBtn(!atBottom)
    }
    pane.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => pane.removeEventListener('scroll', handleScroll)
  }, [messages, loading])

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

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
      {/* Decorative backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1] opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_10%,#000_10%,transparent_70%)]"
        style={{
          background:
            'radial-gradient(70rem 30rem at 20% -10%, rgba(99,102,241,.08), transparent 70%), radial-gradient(70rem 30rem at 80% 0%, rgba(16,185,129,.08), transparent 70%)',
        }}
      />

      <header className="mb-6">
        <PageHeader
          title="Diagnose with AI"
          subtitle="Interview the patient and guess the diagnosis."
        />
        {/* Quick session stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground sm:gap-3 md:max-w-xl">
          <div className="rounded-lg border bg-background/70 p-2 backdrop-blur">
            <div className="font-medium text-foreground">Questions</div>
            <div className="mt-1">
              {askedCount}/{revealAfter}
            </div>
          </div>
          <div className="rounded-lg border bg-background/70 p-2 backdrop-blur">
            <div className="font-medium text-foreground">Status</div>
            <div className="mt-1">
              {revealed ? 'Revealed' : started ? 'In progress' : 'Idle'}
            </div>
          </div>
          <div className="rounded-lg border bg-background/70 p-2 backdrop-blur">
            <div className="font-medium text-foreground">Seed</div>
            <div className="mt-1 truncate" title={disease || 'Randomized'}>
              {disease || 'Randomized'}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left: Chat + Progress */}
        <div className="md:col-span-3">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground">Progress</span>
              <div className="hidden rounded-full bg-muted/40 px-2 py-0.5 md:inline">
                {askedCount}/{revealAfter} questions
              </div>
            </div>
            <div className="text-xs">
              {revealed ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" /> Diagnosis revealed
                </span>
              ) : started ? (
                'Keep asking'
              ) : (
                'Start when ready'
              )}
            </div>
          </div>

          <Progress
            value={progress}
            className="h-2 overflow-hidden rounded-full"
          />

          {/* Conversation */}
          <Card className="mt-4 border-muted-foreground/10 shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-muted/40 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Patient Interview
                {revealed && (
                  <Badge className="ml-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                    Revealed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative p-0">
              <div className="relative">
                <div
                  ref={paneRef}
                  className="max-h-[62vh] min-h-[42vh] overflow-y-auto p-4 pb-24 md:max-h-[70vh] lg:max-h-[74vh]"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                  role="log"
                  aria-live="polite"
                >
                  {messages.length === 0 ? (
                    <EmptyState
                      onChipClick={(s) => setInput(s)}
                      chips={!started ? starterChips : []}
                    />
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
                            <div className="mt-2 flex justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => copyText(m.content)}
                                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                aria-label="Copy response"
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

                {/* Scroll-to-bottom */}
                {showScrollBtn && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-4 z-20 rounded-full bg-background/95 p-2 shadow-lg ring-1 ring-black/10 transition animate-in fade-in hover:scale-105 sm:bottom-8"
                    aria-label="Scroll to bottom"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-arrow-down h-5 w-5 text-primary"
                    >
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Composer */}
              <div
                className="sticky bottom-0 z-10 mt-4 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                <div className="p-4 md:p-6">
                  {!started && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {starterChips.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setInput(s)}
                          className="rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-end sm:gap-3">
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
                        className="max-h-40 min-h-[56px] resize-y"
                        aria-label="Message input"
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>Shift+Enter for newline • Enter to send</span>
                        <span className="hidden sm:inline">
                          Tip: Ask about onset, severity, radiation, systemic
                          symptoms.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                      {!started ? (
                        <Button
                          variant="outline"
                          onClick={startSession}
                          disabled={loading}
                          className="h-10"
                        >
                          <Play className="mr-2 h-4 w-4" /> Generate patient
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={startSession}
                            disabled={loading}
                            className="h-10"
                          >
                            <RefreshCcw className="mr-2 h-4 w-4" /> New case
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={endSession}
                            disabled={loading}
                            className="h-10"
                          >
                            <X className="mr-2 h-4 w-4" /> End
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Settings & Summary */}
        <div className="space-y-4 md:col-span-1">
          <Card className="border-muted-foreground/10">
            <CardHeader className="bg-gradient-to-r from-muted/40 to-transparent">
              <CardTitle>Session Settings</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="mb-4">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Seed disease (optional)
                </label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  placeholder="e.g., Appendicitis"
                  value={disease}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDisease(e.target.value)
                  }
                  disabled={started}
                  aria-label="Seed disease"
                />
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  Leave blank to randomize the case.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Reveal after (questions)
                </label>
                <input
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  How many questions before the patient reveals a likely
                  diagnosis.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted-foreground/10">
            <CardHeader className="bg-gradient-to-r from-muted/40 to-transparent">
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Keep interviewing until the progress bar fills. The patient will
              then reveal the likely diagnosis with a brief rationale. Use
              specific, concise questions (e.g., SOCRATES for pain: Site, Onset,
              Character, Radiation, Associations, Time course,
              Exacerbating/relieving, Severity).
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/** Empty state with tasteful illustration-style blocks */
function EmptyState({
  onChipClick,
  chips,
}: {
  onChipClick: (s: string) => void
  chips: string[]
}) {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-muted/20 to-transparent p-8 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-content-center rounded-full bg-muted/40">
        <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">
        No messages yet
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Click{' '}
        <span className="font-medium text-foreground">Generate patient</span> to
        start a new case, then ask focused questions to uncover the diagnosis.
      </p>
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {chips.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChipClick(s)}
              className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
