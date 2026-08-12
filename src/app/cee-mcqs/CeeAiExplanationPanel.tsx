'use client'

import { FormEvent, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, Loader2, MessageCircle, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/tailwind'

type Message = { role: 'user' | 'assistant'; content: string }

type Props = {
  questionId: string
  subject: string
  chapter: string
  topic: string
  question: string
  options: Array<{ key: string; text: string }>
  answer: string
  explanation?: string
  selectedOption?: string
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="pl-1">{children}</li>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-3 overflow-x-auto rounded-lg border bg-background">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
      {children}
    </thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border-b px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border-b px-3 py-2 align-top">{children}</td>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border bg-muted/60 p-3 text-xs">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-3 border-l-4 border-primary/30 pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-primary underline underline-offset-4"
    >
      {children}
    </a>
  ),
}

export function CeeAiExplanationPanel({
  questionId,
  subject,
  chapter,
  topic,
  question,
  options,
  answer,
  explanation,
  selectedOption,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const correctOption = options.find((option) => option.key === answer)
  const selected = options.find((option) => option.key === selectedOption)

  useEffect(() => {
    setIsOpen(false)
    setMessages([])
    setInput('')
    setLoading(false)
    setError(null)
  }, [questionId])

  async function askAi(
    nextMessages: Message[],
    requestMode: 'explain' | 'chat',
  ) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/mcq-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: requestMode,
          mcq: {
            question,
            options: options.map((option) => `${option.key}. ${option.text}`),
            answer,
            correctOption: correctOption
              ? `${correctOption.key}. ${correctOption.text}`
              : answer,
            explanation,
            exam: 'CEE',
            subject,
            topic: [chapter, topic].filter(Boolean).join(' - '),
            selectedOption: selected
              ? `${selected.key}. ${selected.text}`
              : selectedOption,
          },
          messages: nextMessages,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.error || 'AI explanation failed')

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data?.reply || 'I could not generate an explanation.',
        },
      ])
    } catch (caughtError: any) {
      setError(caughtError?.message || 'AI explanation failed')
    } finally {
      setLoading(false)
    }
  }

  function openWithExplanation() {
    setIsOpen(true)
    if (!messages.length && !loading) askAi([], 'explain')
  }

  function submitQuestion(event: FormEvent) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ]
    setMessages(nextMessages)
    setInput('')
    askAi(nextMessages, 'chat')
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="font-semibold">AI explanation</div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Get a CEE-focused solution and ask follow-up questions on this
              MCQ.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={openWithExplanation}
          disabled={loading && !messages.length}
          className="w-full gap-2 sm:w-auto"
        >
          {loading && !messages.length ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          AI explanation
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-4">
          <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
            {!messages.length && loading ? (
              <div className="flex items-center gap-2 rounded-lg border bg-background/80 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Building the solution...
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  'min-w-0 rounded-lg border p-3 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'ml-8 bg-primary/10 text-foreground'
                    : 'bg-background/85 mr-8',
                )}
              >
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  {message.role === 'user' ? (
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Bot className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {message.role === 'user' ? 'You' : 'Tutor'}
                </div>
                <div className="min-w-0 max-w-full text-sm leading-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && messages.length ? (
              <div className="flex items-center gap-2 rounded-lg border bg-background/80 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Thinking through your follow-up...
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={submitQuestion} className="space-y-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              placeholder="Ask why an option is wrong, request a mnemonic, or drill the concept..."
              className="bg-background/85 min-h-[72px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="gap-2"
              >
                <Send className="h-4 w-4" aria-hidden />
                Send
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
