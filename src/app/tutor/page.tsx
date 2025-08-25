'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Paperclip } from 'lucide-react'

export default function TutorPage() {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [input, setInput] = useState('')

  async function send() {
    const next: { role: 'user' | 'assistant'; content: string }[] = [
      ...messages,
      { role: 'user' as const, content: input },
    ]
    setMessages(next)
    setInput('')
    const res = await fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: next, style: 'clinical' }),
    })
    const data = await res.json()
    if (data?.reply)
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
  }
  return (
    <div className="w-full">
      <PageHeader
        title="AI Tutor"
        subtitle="Ask medicine anything. Learn clearly and quickly."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                'Explain like I\u2019m 12',
                'Exam-focused',
                'Clinical reasoning',
              ].map((p) => (
                <Badge
                  key={p}
                  className="cursor-pointer bg-muted hover:bg-accent"
                  aria-label={`Prompt: ${p}`}
                >
                  {p}
                </Badge>
              ))}
            </div>
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className="rounded-2xl border p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      className={
                        m.role === 'user'
                          ? 'border-primary/20 bg-primary/10 text-primary'
                          : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                      }
                    >
                      {m.role === 'user' ? 'User' : 'Tutor'}
                    </Badge>
                    <span>now</span>
                  </div>
                  {m.content}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" aria-label="Attach document">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                placeholder="Ask a question…"
                className="min-h-[80px]"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />
              <Button onClick={send} disabled={!input.trim()}>
                Send
              </Button>
            </div>
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
                  Save to notes
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
