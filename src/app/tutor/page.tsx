'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Paperclip,
  Send,
  Sparkles,
  BookmarkPlus,
  RotateCcw,
  Trash2,
  ChevronDown,
  BookOpen,
} from 'lucide-react'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { Spinner } from '@/components/ui/spinner'

type Msg = { role: 'user' | 'assistant'; content: string }
type StyleKey = 'eli5' | 'exam' | 'clinical'

export default function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [style, setStyle] = useState<StyleKey>('clinical')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const areaRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollPaneRef = useRef<HTMLDivElement | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const suggestions = [
    'Explain nephrotic vs nephritic',
    'Mnemonic for cranial nerves',
    'Differential for chest pain',
    'How to approach hyponatremia',
  ]

  async function send() {
    if (!input.trim()) return
    const next: Msg[] = [...messages, { role: 'user', content: input }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, style }),
      })
      const data = await res.json()
      if (data?.reply)
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([])
    setInput('')
    setLoading(false)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const pane = scrollPaneRef.current
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

  return (
    <div className="w-full">
      {/* Decorative backdrop for subtle depth */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1] opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_10%,#000_10%,transparent_70%)]"
        style={{
          background:
            'radial-gradient(70rem 30rem at 15% -10%, rgba(99,102,241,.08), transparent 70%), radial-gradient(60rem 28rem at 85% 0%, rgba(16,185,129,.08), transparent 70%)',
        }}
      />

      <header className="mb-6">
        <PageHeader
          title="AI Tutor"
          subtitle="Ask medicine anything. Learn clearly and quickly."
        />
        {/* Quick session strip */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <div className="rounded-full border bg-background/70 px-3 py-1 backdrop-blur">
            Messages:{' '}
            <span className="ml-1 font-medium text-foreground">
              {messages.length}
            </span>
          </div>
          <div className="rounded-full border bg-background/70 px-3 py-1 backdrop-blur">
            Style:
            <span className="ml-1 font-medium capitalize text-foreground">
              {style === 'eli5'
                ? "Explain like I'm 12"
                : style === 'exam'
                  ? 'Exam-focused'
                  : 'Clinical reasoning'}
            </span>
          </div>
          <div className="rounded-full border bg-background/70 px-3 py-1 backdrop-blur">
            Status:
            <span className="ml-1 font-medium text-foreground">
              {loading ? 'Thinking…' : 'Ready'}
            </span>
          </div>
          <div className="ml-auto hidden gap-2 sm:flex">
            <Button
              variant="outline"
              className="h-8"
              onClick={() => areaRef.current?.focus()}
            >
              <BookOpen className="mr-2 h-4 w-4" /> Focus input
            </Button>
            <Button variant="ghost" className="h-8" onClick={clearChat}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Conversation Column */}
        <Card className="border-muted-foreground/10 shadow-sm md:col-span-2">
          <CardHeader className="border-b bg-gradient-to-r from-muted/40 to-transparent">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base sm:text-lg">Session</CardTitle>

              {/* Style selector - segmented badges */}
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Style
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'eli5' as StyleKey, label: "Explain like I'm 12" },
                    { key: 'exam' as StyleKey, label: 'Exam-focused' },
                    {
                      key: 'clinical' as StyleKey,
                      label: 'Clinical reasoning',
                    },
                  ].map((opt) => (
                    <Badge
                      key={opt.key}
                      onClick={() => setStyle(opt.key)}
                      className={
                        'cursor-pointer transition-colors ' +
                        (style === opt.key
                          ? 'bg-primary/15 border-primary/30 text-primary'
                          : 'bg-muted hover:bg-accent')
                      }
                      aria-pressed={style === opt.key}
                    >
                      {opt.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex h-[66vh] max-h-[78vh] flex-col overflow-hidden rounded-b-xl">
              {/* Scrollable chat area */}
              <div className="relative flex-1">
                <div
                  ref={scrollPaneRef}
                  className="flex-1 overflow-y-auto p-4 pb-24 sm:pb-6"
                  role="log"
                  aria-live="polite"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {messages.length === 0 ? (
                    <EmptyState suggestions={suggestions} onPick={setInput} />
                  ) : (
                    <div className="flex flex-col gap-4">
                      {messages.map((m, i) => (
                        <ChatBubble
                          key={i}
                          role={m.role === 'assistant' ? 'assistant' : 'user'}
                        >
                          {m.content}
                        </ChatBubble>
                      ))}
                      {loading && <ChatBubble role="assistant" typing />}
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Scroll-to-bottom */}
                {showScrollBtn && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="fixed bottom-28 right-4 z-20 rounded-full bg-background/95 p-2 shadow-lg ring-1 ring-black/10 transition animate-in fade-in hover:scale-105 sm:bottom-8"
                    aria-label="Scroll to bottom"
                  >
                    <ChevronDown className="h-5 w-5 text-primary" />
                  </button>
                )}
              </div>

              {/* Composer */}
              <div
                className="sticky bottom-0 z-10 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                <div className="p-3 sm:p-4">
                  {/* Suggestions row on empty */}
                  {messages.length === 0 && (
                    <div
                      className="mb-3 flex flex-wrap gap-2"
                      aria-label="Suggested prompts"
                    >
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setInput(s)}
                          className="rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Sparkles
                            className="mr-1 inline h-3.5 w-3.5"
                            aria-hidden
                          />{' '}
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-end sm:gap-3">
                    <div className="flex items-center gap-2 sm:items-end">
                      <Button
                        variant="outline"
                        aria-label="Attach document"
                        className="h-10 w-10 p-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1">
                      <Textarea
                        ref={areaRef}
                        placeholder="Ask a question…"
                        className="max-h-40 min-h-[56px] resize-y focus-visible:ring-2 focus-visible:ring-primary/60"
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setInput(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            send()
                          }
                        }}
                        aria-label="Message input"
                        autoComplete="off"
                        autoCorrect="on"
                        spellCheck
                        rows={1}
                        style={{
                          fontSize: '1rem',
                          paddingBottom: 'env(safe-area-inset-bottom)',
                          WebkitOverflowScrolling: 'touch',
                        }}
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>Shift+Enter for newline • Enter to send</span>
                        {loading ? (
                          <span className="inline-flex items-center gap-1">
                            <Spinner /> Working…
                          </span>
                        ) : (
                          <span className="hidden sm:inline">
                            Tip: Ask for mechanisms, differentials, red flags,
                            and mnemonics.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={send}
                        disabled={!input.trim() || loading}
                        className="h-10 w-28"
                      >
                        <Send className="mr-1 h-4 w-4" /> Send
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10"
                        onClick={() => setInput('')}
                        disabled={!input && !messages.length}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset input
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Composer */}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Card className="border-muted-foreground/10">
            <CardHeader className="bg-gradient-to-r from-muted/40 to-transparent">
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">Subject</label>
                <Input placeholder="e.g., Nephrology" />
                <label className="text-xs text-muted-foreground">Topic</label>
                <Input placeholder="e.g., Glomerular disease" />
                <Button className="mt-2" variant="outline">
                  <BookmarkPlus className="mr-1 h-4 w-4" /> Save to notes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted-foreground/10">
            <CardHeader className="bg-gradient-to-r from-muted/40 to-transparent">
              <CardTitle>Related MCQs</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Coming soon…
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/** Elegant empty state */
function EmptyState({
  suggestions,
  onPick,
}: {
  suggestions: string[]
  onPick: (s: string) => void
}) {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-muted/20 to-transparent p-8 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-content-center rounded-full bg-muted/40">
        <Sparkles className="mx-auto h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">
        Ask your first question
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Use concise prompts. Toggle a style for the explanation you want.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Sparkles className="mr-1 inline h-3.5 w-3.5" aria-hidden /> {s}
          </button>
        ))}
      </div>
    </div>
  )
}
