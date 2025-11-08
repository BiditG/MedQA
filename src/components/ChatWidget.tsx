'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Send, MessageSquare, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Msg = { role: 'user' | 'assistant'; content: string }

const PREBUILT: Array<{ q: string; a: string }> = [
  {
    q: 'What is MEDQAS?',
    a: 'MEDQAS is an all-in-one medical learning platform for Nepali students: practice MCQs, use the AI Tutor, and access a Nepali disease glossary.',
  },
  {
    q: 'How do I subscribe?',
    a: 'Go to the Subscribe page from the menu (Upgrade → Subscribe) and choose a plan. After payment, submit proof to activate premium features.',
  },
  {
    q: 'Can I use the AI Tutor for explanations?',
    a: 'Yes — the AI Tutor provides stepwise clinical reasoning and explanations. Use the "AI Tutor" page for deeper, session-based help.',
  },
  {
    q: 'Contact',
    a: 'For support or enquiries, email us at medqas.np@gmail.com. For subscription or payment issues, include your transaction details and we typically respond within 24 hours.',
  },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) scrollToBottom()
  }, [messages, open])

  function scrollToBottom() {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function getPrebuilt(q: string) {
    const normalized = q.trim().toLowerCase()
    for (const p of PREBUILT) {
      if (p.q.toLowerCase() === normalized) return p.a
      // loose match: contains
      if (normalized.includes(p.q.toLowerCase().split(' ')[0])) return p.a
    }
    return null
  }

  async function send() {
    const trimmed = input.trim()
    if (!trimmed) return
    const next: Msg[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)

    // check prebuilt answers first
    const pre = getPrebuilt(trimmed)
    if (pre) {
      setMessages((m) => [...m, { role: 'assistant', content: pre }])
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, style: 'clinical' }),
      })
      const data = await res.json()
      if (data?.reply) {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
      } else if (data?.error) {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `Error: ${data.error}` },
        ])
      } else {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: 'Sorry — no reply from AI.' },
        ])
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: String(e) }])
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  return (
    <div aria-live="polite">
      {/* Floating button */}
      <div className="fixed bottom-5 right-5 z-50">
        {open ? (
          <div className="w-[360px] max-w-[92vw]">
            <Card className="shadow-lg">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div className="text-sm font-semibold">AI Assistant</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-sm text-muted-foreground"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-2">
                <div className="max-h-[50vh] overflow-y-auto p-2" role="log">
                  {messages.length === 0 && (
                    <div className="px-2 text-sm text-muted-foreground">
                      Quick help: ask about the site or paste a question to get
                      help with MCQs.
                    </div>
                  )}
                  <div className="space-y-3 py-2">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={
                          m.role === 'assistant'
                            ? 'flex items-start gap-2'
                            : 'flex items-start justify-end'
                        }
                      >
                        {m.role === 'assistant' ? (
                          <div className="max-w-[78%] rounded-md bg-muted px-3 py-2 text-sm">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="rounded-md bg-primary/10 px-3 py-2 text-sm">
                            {m.content}
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div className="rounded-md bg-muted px-3 py-2 text-sm">
                        Thinking…
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 pb-2">
                    {PREBUILT.map((p) => (
                      <button
                        key={p.q}
                        onClick={() => {
                          setMessages((m) => [
                            ...m,
                            { role: 'user', content: p.q },
                            { role: 'assistant', content: p.a },
                          ])
                          setOpen(true)
                        }}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                      >
                        {p.q}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask about the site or paste a question…"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="max-h-32 min-h-[40px] flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          send()
                        }
                      }}
                    />
                    <Button
                      onClick={send}
                      disabled={!input.trim() || loading}
                      className="h-10 w-10"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <Button onClick={() => setOpen(true)} className="rounded-full p-3">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
