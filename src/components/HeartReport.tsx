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

export default function HeartReport() {
  const [rows, setRows] = useState<Row[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [prediction, setPrediction] = useState<boolean | null>(null)
  const [showTruth, setShowTruth] = useState(false)
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
    age: { label: 'Age' },
    sex: {
      label: 'Sex',
      fmt: (v) => (v === '1' ? 'Male' : v === '0' ? 'Female' : v),
    },
    chest_pain_type: { label: 'Chest pain' },
    resting_bp: { label: 'Resting BP' },
    cholestoral: { label: 'Cholesterol' },
    fasting_blood_sugar: {
      label: 'Fasting blood sugar',
      fmt: (v) => (v === '1' ? 'Yes' : 'No'),
    },
    restecg: { label: 'Resting ECG' },
    max_hr: { label: 'Max HR' },
    exang: { label: 'Exercise angina', fmt: (v) => (v === '1' ? 'Yes' : 'No') },
    oldpeak: { label: 'Oldpeak' },
    slope: { label: 'ST slope' },
    num_major_vessels: { label: 'Major vessels' },
    thal: { label: 'Thal' },
  }

  function makePrediction(predYes: boolean) {
    if (!row) return
    setPrediction(predYes)
    const actual = String(row['target']) === '1'
    if (predYes === actual) setScore((s) => s + 1)
    setShowTruth(true)
  }

  function next() {
    setPrediction(null)
    setShowTruth(false)
    setIndex((i) => {
      const nextIndex = i + 1
      if (nextIndex >= rows.length) {
        setFinished(true)
        return i
      }
      return nextIndex
    })
  }

  if (rows.length === 0) return <div className="p-4">Loading dataset...</div>

  if (finished) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <h2 className="text-2xl font-semibold">Review complete</h2>
        <p className="text-sm text-muted-foreground">
          You correctly identified {score} of {rows.length} records.
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={() => {
              setIndex(0)
              setScore(0)
              setFinished(false)
            }}
          >
            Restart
          </Button>
        </div>
      </div>
    )
  }

  const progress = Math.round(
    ((index + (prediction !== null ? 1 : 0)) / rows.length) * 100,
  )

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Heart — Patient Report</h2>
          <div className="text-sm text-muted-foreground">
            Record {index + 1} of {rows.length}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Score: {score}</div>
      </div>

      <div className="mb-4">
        <Progress value={progress} />
      </div>

      <Card className="mb-4">
        <CardHeader className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Patient Summary</div>
            <div className="text-lg font-medium">Record #{index + 1}</div>
          </div>
          <div className="text-sm text-muted-foreground">Age: {row.age}</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Demographics & Vitals</h3>
              {[
                'age',
                'sex',
                'resting_bp',
                'cholestoral',
                'max_hr',
                'oldpeak',
              ].map((k) => {
                const meta = fieldMeta[k]
                const label = meta?.label ?? k
                const fmt = meta && meta.fmt
                const formatted = fmt ? fmt(row[k]) : row[k]
                return (
                  <div key={k} className="rounded border p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="font-mono text-sm">{formatted}</div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">
                Key Findings & Risk Factors
              </h3>
              {[
                'chest_pain_type',
                'fasting_blood_sugar',
                'restecg',
                'exang',
                'slope',
                'num_major_vessels',
                'thal',
              ].map((k) => {
                const meta = fieldMeta[k]
                const label = meta?.label ?? k
                const fmt = meta && meta.fmt
                const formatted = fmt ? fmt(row[k]) : row[k]
                return (
                  <div key={k} className="rounded border p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="font-mono text-sm">{formatted}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col gap-3 md:flex-row">
            <Button
              className="w-full md:w-1/3"
              variant="destructive"
              onClick={() => makePrediction(true)}
              disabled={prediction !== null}
            >
              Predict: Had Event
            </Button>
            <Button
              className="w-full md:w-1/3"
              variant="secondary"
              onClick={() => makePrediction(false)}
              disabled={prediction !== null}
            >
              Predict: No Event
            </Button>
            <div className="ml-auto flex items-center gap-3">
              <Button onClick={next} disabled={prediction === null}>
                Next Record
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {prediction !== null && (
        <div className="mt-4 rounded border p-3">
          <div
            className={`font-medium ${String(row['target']) === (prediction ? '1' : '0') ? 'text-green-600' : 'text-red-600'}`}
          >
            {String(row['target']) === (prediction ? '1' : '0')
              ? 'Prediction correct'
              : 'Prediction incorrect'}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Actual: {String(row['target']) === '1' ? 'Had event' : 'No event'}
          </div>
        </div>
      )}
    </div>
  )
}
