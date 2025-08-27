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

export default function StrokeReport() {
  const [rows, setRows] = useState<Row[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [prediction, setPrediction] = useState<boolean | null>(null)
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
    gender: { label: 'Gender' },
    age: { label: 'Age' },
    hypertension: {
      label: 'Hypertension',
      fmt: (v) => (v === '1' ? 'Yes' : 'No'),
    },
    heart_disease: {
      label: 'Heart disease',
      fmt: (v) => (v === '1' ? 'Yes' : 'No'),
    },
    ever_married: { label: 'Ever married' },
    work_type: { label: 'Work type' },
    Residence_type: { label: 'Residence' },
    avg_glucose_level: { label: 'Avg glucose' },
    bmi: { label: 'BMI' },
    smoking_status: { label: 'Smoking status' },
  }

  function makePrediction(predYes: boolean) {
    if (!row) return
    setPrediction(predYes)
    const actual = String(row['stroke']) === '1'
    if (predYes === actual) setScore((s) => s + 1)
  }

  function next() {
    setPrediction(null)
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
        <div className="mt-4">
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
          <h2 className="text-2xl font-semibold">Stroke — Patient Report</h2>
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
              <h3 className="text-sm font-medium">Demographics</h3>
              {[
                'id',
                'gender',
                'age',
                'ever_married',
                'work_type',
                'Residence_type',
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
              <h3 className="text-sm font-medium">Clinical & Risk</h3>
              {[
                'hypertension',
                'heart_disease',
                'avg_glucose_level',
                'bmi',
                'smoking_status',
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
              Predict: Had Stroke
            </Button>
            <Button
              className="w-full md:w-1/3"
              variant="secondary"
              onClick={() => makePrediction(false)}
              disabled={prediction !== null}
            >
              Predict: No Stroke
            </Button>
            <div className="ml-auto">
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
            className={`font-medium ${String(row['stroke']) === (prediction ? '1' : '0') ? 'text-green-600' : 'text-red-600'}`}
          >
            {String(row['stroke']) === (prediction ? '1' : '0')
              ? 'Prediction correct'
              : 'Prediction incorrect'}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Actual: {String(row['stroke']) === '1' ? 'Had stroke' : 'No stroke'}
          </div>
        </div>
      )}
    </div>
  )
}
