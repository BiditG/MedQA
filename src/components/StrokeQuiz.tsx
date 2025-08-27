'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type Row = Record<string, string>

function parseCsv(csv: string): Row[] {
  const lines = csv.trim().split(/\r?\n/)
  if (lines.length <= 1) return []
  const headers = lines[0].split(',')
  return lines.slice(1).map((l) => {
    const cols = l.split(',')
    const row: Row = {}
    headers.forEach((h, i) => (row[h] = cols[i] ?? ''))
    return row
  })
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function StrokeQuiz() {
  const [rows, setRows] = useState<Row[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    fetch('/data/healthcare-dataset-stroke-data.csv')
      .then((r) => r.text())
      .then((txt) => {
        const parsed = parseCsv(txt)
        setRows(shuffle(parsed))
        setIndex(0)
      })
      .catch(() => setRows([]))
  }, [])

  const row = useMemo(() => rows[index], [rows, index])

  const fieldMeta: Record<
    string,
    { label: string; desc?: string; fmt?: (v: string) => string }
  > = {
    id: { label: 'Record ID' },
    gender: { label: 'Gender', fmt: (v) => v },
    age: { label: 'Age', desc: 'Age of the person (in years)' },
    hypertension: {
      label: 'Hypertension',
      desc: '1 = yes; 0 = no',
      fmt: (v) => (v === '1' ? 'Yes' : v === '0' ? 'No' : v),
    },
    heart_disease: {
      label: 'Heart disease',
      desc: '1 = yes; 0 = no',
      fmt: (v) => (v === '1' ? 'Yes' : v === '0' ? 'No' : v),
    },
    ever_married: { label: 'Ever married', desc: 'Yes/No' },
    work_type: {
      label: 'Work type',
      desc: 'Type of employment (e.g., Private, Self-employed, Govt job, children, Never_worked)',
    },
    Residence_type: { label: 'Residence', desc: 'Urban or Rural' },
    avg_glucose_level: {
      label: 'Avg glucose level',
      desc: 'Average glucose level',
    },
    bmi: { label: 'BMI', desc: 'Body mass index' },
    smoking_status: {
      label: 'Smoking status',
      desc: 'never smoked / formerly smoked / smokes / Unknown',
    },
  }

  function handleAnswer(answerYes: boolean) {
    if (!row) return
    const actual = String(row['stroke']) === '1'
    const correct = answerYes === actual
    setLastCorrect(correct)
    setAnswered(true)
    if (correct) setScore((s) => s + 1)
  }

  function next() {
    setAnswered(false)
    setLastCorrect(null)
    setIndex((i) => {
      const nextIndex = i + 1
      if (nextIndex >= rows.length) {
        setFinished(true)
        return i
      }
      return nextIndex
    })
  }

  if (rows.length === 0) {
    return <div className="p-4">Loading dataset or dataset is empty.</div>
  }

  const progress = Math.round(
    ((index + (answered ? 1 : 0)) / rows.length) * 100,
  )

  if (finished) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Quiz complete</h2>
          <p className="text-sm text-muted-foreground">
            You scored {score} out of {rows.length}.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setIndex(0)
              setScore(0)
              setFinished(false)
              setAnswered(false)
              setLastCorrect(null)
            }}
          >
            Restart
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Stroke Quiz</h2>
        <div className="text-sm text-muted-foreground">Score: {score}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-muted-foreground">
          Record {index + 1} of {rows.length}
        </div>
        <div className="mt-2">
          <Progress value={progress} />
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Patient</div>
            <div className="text-lg font-medium">Record #{index + 1}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            {fieldMeta.age?.label}: {row.age}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Object.entries(row || {})
              .filter(([k]) => k !== 'stroke')
              .map(([k, v]) => {
                const meta = fieldMeta[k]
                const label = meta?.label ?? k
                const desc = meta?.desc
                const formatted = meta?.fmt ? meta.fmt(v) : v
                return (
                  <div key={k} className="rounded border p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="font-mono text-sm">{formatted}</div>
                    {desc && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {desc}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full gap-3">
            <Button
              variant="secondary"
              onClick={() => handleAnswer(true)}
              disabled={answered}
            >
              Yes
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAnswer(false)}
              disabled={answered}
            >
              No
            </Button>
            <Button asChild className="ml-auto" onClick={next}>
              <button>Skip / Next</button>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {answered && (
        <div className="mt-4 rounded border p-3">
          <div
            className={`font-medium ${lastCorrect ? 'text-green-600' : 'text-red-600'}`}
          >
            {lastCorrect ? 'Correct' : 'Incorrect'}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Actual: {String(row['stroke']) === '1' ? 'Yes' : 'No'}
          </div>
        </div>
      )}
    </div>
  )
}
