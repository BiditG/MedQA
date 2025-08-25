'use client'

import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Paperclip, Send, Sparkles, BookmarkPlus } from 'lucide-react'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { Spinner } from '@/components/ui/spinner'

export default function TutorPage() {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [input, setInput] = useState('')
  const [style, setStyle] = useState<'eli5' | 'exam' | 'clinical'>('clinical')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const areaRef = useRef<HTMLTextAreaElement | null>(null)
  const suggestions = [
    'Explain nephrotic vs nephritic',
    'Mnemonic for cranial nerves',
    'Differential for chest pain',
    'How to approach hyponatremia',
  ]

  async function send() {
    if (!input.trim()) return
    const next: { role: 'user' | 'assistant'; content: string }[] = [
      ...messages,
      { role: 'user' as const, content: input },
    ]
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])
  return (
    <div className="w-full">
      <PageHeader
        title="AI Tutor"
        subtitle="Ask medicine anything. Learn clearly and quickly."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Session</CardTitle>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="text-xs text-muted-foreground">Style</span>
                <div className="flex gap-2">
                  {(
                    [
                      { key: 'eli5', label: "Explain like I'm 12" },
                      { key: 'exam', label: 'Exam-focused' },
                      { key: 'clinical', label: 'Clinical reasoning' },
                    ] as const
                  ).map((opt) => (
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
          <CardContent>
            <div className="flex h-[60vh] max-h-[70vh] flex-col gap-4 overflow-hidden rounded-lg border bg-background/50">
              <div
                className="flex-1 overflow-y-auto p-4"
                role="log"
                aria-live="polite"
              >
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
                <div ref={endRef} />
              </div>
              <div className="border-t p-3">
                {/* Suggestions */}
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
                        className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
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

                <div className="flex items-end gap-3">
                  <Button
                    variant="outline"
                    aria-label="Attach document"
                    className="h-10 w-10 p-0"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      ref={areaRef}
                      placeholder="Ask a question…"
                      className="max-h-36 min-h-[56px] resize-none"
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
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Shift+Enter for newline</span>
                      {loading && (
                        <span className="inline-flex items-center gap-1">
                          <Spinner /> Working…
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={send}
                      disabled={!input.trim() || loading}
                      className="h-10 w-28"
                    >
                      <Send className="mr-1 h-4 w-4" /> Send
                    </Button>
                    <div className="hidden sm:block">
                      <div className="text-xs text-muted-foreground">Style</div>
                      <div className="mt-1 flex gap-2">
                        {(
                          [
                            { key: 'eli5', label: 'ELI5' },
                            { key: 'exam', label: 'Exam' },
                            { key: 'clinical', label: 'Clinical' },
                          ] as const
                        ).map((opt) => (
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
                </div>
              </div>
            </div>
            {/* Suggestions */}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <label className="text-xs">Subject</label>
                <Input placeholder="e.g., Nephrology" />
                <label className="text-xs">Topic</label>
                <Input placeholder="e.g., Glomerular disease" />
                <Button className="mt-2" variant="outline">
                  <BookmarkPlus className="mr-1 h-4 w-4" /> Save to notes
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
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
