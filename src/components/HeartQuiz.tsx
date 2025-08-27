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

export default function HeartQuiz() {
  const [rows, setRows] = useState<Row[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    fetch('/data/heart.csv')
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
    age: { label: 'Age', desc: 'Age of the person (in years)' },
    sex: {
      label: 'Sex',
      desc: 'Gender (1 = male; 0 = female)',
      fmt: (v) => (v === '1' ? 'Male' : v === '0' ? 'Female' : v),
    },
    chest_pain_type: {
      label: 'Chest pain type',
      desc: '0: typical angina, 1: atypical angina, 2: non-anginal pain, 3: asymptomatic',
      fmt: (v) =>
        ({
          '0': 'typical angina',
          '1': 'atypical angina',
          '2': 'non-anginal',
          '3': 'asymptomatic',
        })[v] ?? v,
    },
    resting_bp: {
      label: 'Resting BP',
      desc: 'Blood pressure while resting (mm Hg)',
    },
    cholestoral: { label: 'Cholesterol', desc: 'Serum cholesterol in mg/dl' },
    fasting_blood_sugar: {
      label: 'Fasting blood sugar',
      desc: 'Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)',
      fmt: (v) => (v === '1' ? 'Yes (>120 mg/dl)' : v === '0' ? 'No' : v),
    },
    restecg: {
      label: 'Resting ECG',
      desc: '0: normal; 1: ST-T wave abnormality (T wave inversions and/or ST elevation/depression); 2: probable/definite left ventricular hypertrophy',
      fmt: (v) =>
        ({ '0': 'normal', '1': 'ST-T abnormality', '2': 'LVH' })[v] ?? v,
    },
    max_hr: { label: 'Max HR', desc: 'Maximum heart rate achieved' },
    exang: {
      label: 'Exercise-induced angina',
      desc: '1 = yes; 0 = no',
      fmt: (v) => (v === '1' ? 'Yes' : v === '0' ? 'No' : v),
    },
    oldpeak: {
      label: 'Oldpeak',
      desc: 'ST depression induced by exercise relative to rest',
    },
    slope: {
      label: 'ST slope',
      desc: '0: upsloping; 1: flat; 2: downsloping',
      fmt: (v) =>
        ({ '0': 'upsloping', '1': 'flat', '2': 'downsloping' })[v] ?? v,
    },
    num_major_vessels: {
      label: 'Major vessels',
      desc: 'Number of major vessels (0-3) colored by fluoroscopy',
    },
    thal: {
      label: 'Thalassemia (thal)',
      desc: '0: normal; 1: fixed defect; 2: reversible defect',
      fmt: (v) =>
        ({ '0': 'normal', '1': 'fixed defect', '2': 'reversible defect' })[v] ??
        v,
    },
  }

  function handleAnswer(answerYes: boolean) {
    if (!row) return
    const actual = String(row['target']) === '1'
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
          <button
            className="rounded bg-primary px-4 py-2 text-white"
            onClick={() => {
              setIndex(0)
              setScore(0)
              setFinished(false)
              setAnswered(false)
              setLastCorrect(null)
            }}
          >
            Restart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Heart Disease Quiz</h2>
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
              .filter(([k]) => k !== 'target')
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
            Actual: {String(row['target']) === '1' ? 'Yes' : 'No'}
          </div>
        </div>
      )}
    </div>
  )
}
