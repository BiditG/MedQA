'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

export default function DiagnosePage() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [disease, setDisease] = useState('')
  const [revealAfter, setRevealAfter] = useState<number>(3)

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
      // no-op; you could add a toast here
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

  return (
    <div className="w-full">
      <PageHeader
        title="Diagnose with AI"
        subtitle="Interview the patient and guess the diagnosis."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-4 md:col-span-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {askedCount}/{revealAfter} questions
              </span>
            </div>
            <Progress value={progress} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                Patient Interview{' '}
                {revealed && (
                  <Badge className="ml-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                    Diagnosis revealed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 && (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Click &quot;Generate patient&quot; to start a new case. Ask
                  focused questions to uncover the diagnosis.
                </div>
              )}
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
                        {m.role === 'user' ? 'You' : 'Patient'}
                      </Badge>
                      <span>now</span>
                    </div>
                    {m.content}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Input
                  placeholder={
                    started
                      ? 'Ask a focused question…'
                      : 'Generate a patient to begin'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!started || loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <Button
                  onClick={send}
                  disabled={!started || loading || !input.trim()}
                >
                  Send
                </Button>
                <Button
                  variant="outline"
                  onClick={startSession}
                  disabled={loading}
                >
                  Generate patient
                </Button>
                <Button
                  variant="outline"
                  onClick={endSession}
                  disabled={!started || loading}
                >
                  End session
                </Button>
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
                <Input
                  placeholder="e.g., Appendicitis"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  disabled={started}
                />
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">
                  Reveal after (questions)
                </div>
                <Input
                  type="number"
                  min={3}
                  max={6}
                  value={revealAfter}
                  onChange={(e) =>
                    setRevealAfter(
                      Math.min(6, Math.max(3, Number(e.target.value) || 3)),
                    )
                  }
                  disabled={started}
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
