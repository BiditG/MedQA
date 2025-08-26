'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Trash2, Stethoscope } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import ReactMarkdown from 'react-markdown'

// Types
type Msg = { role: 'user' | 'assistant'; content: string }
type StyleKey = 'eli5' | 'exam' | 'clinical'

export default function TutorPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  // Keep style but hide UI; default to clinical
  const [style] = useState<StyleKey>('clinical')
  const [loading, setLoading] = useState(false)

  const endRef = useRef<HTMLDivElement | null>(null)
  const areaRef = useRef<HTMLTextAreaElement | null>(null)

  function scrollToBottom() {
    if (typeof document === 'undefined') return
    document
      .getElementById('tutor-chat-end')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const autogrow = useCallback(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [])

  async function send() {
    if (!input.trim() || loading) return
    const next: Msg[] = [...messages, { role: 'user', content: input.trim() }]
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
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            "Sorry — I couldn't reach the tutor service. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
      setTimeout(scrollToBottom, 0)
    }
  }

  function clearChat() {
    setMessages([])
    setInput('')
    setLoading(false)
    setTimeout(scrollToBottom, 0)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    areaRef.current?.focus()
    autogrow()
  }, [autogrow])

  return (
    <div className="mx-auto w-full max-w-3xl px-2 sm:px-4">
      <header className="mb-4">
        <PageHeader title="AI Tutor" subtitle="Simple, focused, and helpful." />
      </header>

      <Card className="overflow-hidden rounded-xl">
        {/* Messages */}
        <CardContent className="p-0">
          <div className="flex h-[70vh] flex-col">
            <div
              className="flex-1 space-y-4 overflow-y-auto p-3 [scrollbar-gutter:stable] sm:p-4"
              role="log"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <div className="mx-auto max-w-md text-center text-sm text-muted-foreground">
                  Ask a question to start. Keep it short and specific.
                </div>
              ) : (
                messages.map((m, i) =>
                  m.role === 'assistant' ? (
                    <AssistantMessage key={i} content={m.content} />
                  ) : (
                    <UserMessage key={i} content={m.content} />
                  ),
                )
              )}
              {loading && <AssistantThinking />}
              <div ref={endRef} id="tutor-chat-end" />
            </div>

            {/* Composer */}
            <div className="border-t bg-background p-3">
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
              >
                <Textarea
                  ref={areaRef}
                  placeholder="Send a message…"
                  className="max-h-40 min-h-[48px] w-full flex-1 resize-none"
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setInput(e.target.value)
                    autogrow()
                  }}
                  onInput={autogrow}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <div className="flex w-full gap-2 sm:w-auto">
                  <Button
                    type="submit"
                    onClick={send}
                    disabled={!input.trim() || loading}
                    className="h-11 w-full sm:h-10 sm:w-24"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner /> Send
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <Send className="h-4 w-4" /> Send
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full sm:h-10 sm:w-auto"
                    onClick={clearChat}
                    disabled={!messages.length && !input}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                  </Button>
                </div>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                Enter to send • Shift+Enter for newline
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 place-content-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Stethoscope className="h-4 w-4" />
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}

function AssistantThinking() {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 place-content-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
        <Stethoscope className="h-4 w-4" />
      </div>
      <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        Thinking…
      </div>
    </div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex items-start justify-end">
      <div className="rounded-md bg-primary/10 px-3 py-2 text-sm">
        {content}
      </div>
    </div>
  )
}
