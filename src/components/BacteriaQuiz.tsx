'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type Row = Record<string, string>

function parseCsv(csv: string): Row[] {
  // Robust CSV parser that handles quoted fields containing commas/newlines
  const rows: Row[] = []
  if (!csv) return rows
  // strip BOM if present
  if (csv.charCodeAt(0) === 0xfeff) csv = csv.slice(1)

  const records: string[][] = []
  let cur = ''
  let inQuotes = false
  let field = ''
  let record: string[] = []

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i]
    if (ch === '"') {
      // If next char is also a quote, treat as escaped quote
      if (inQuotes && csv[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      record.push(field)
      field = ''
      continue
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // handle CRLF or LF
      // if CRLF, skip the LF part when CR encountered
      if (ch === '\r' && csv[i + 1] === '\n') {
        // push and skip next char
        record.push(field)
        field = ''
        records.push(record)
        record = []
        i++
        continue
      }
      // LF alone
      if (ch === '\n') {
        record.push(field)
        field = ''
        records.push(record)
        record = []
        continue
      }
      // ignore lone CR
      continue
    }
    field += ch
  }

  // push last field/record
  if (field !== '' || record.length > 0) {
    record.push(field)
    records.push(record)
  }

  if (records.length <= 1) return []
  const headers = records[0].map((h) => h.trim())
  for (let r = 1; r < records.length; r++) {
    const rec = records[r]
    const row: Row = {}
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = (rec[i] ?? '').trim()
    }
    // ignore empty rows
    if (Object.values(row).some((v) => v !== '')) rows.push(row)
  }
  return rows
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function BacteriaQuiz() {
  const [rows, setRows] = useState<Row[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    fetch('/data/bacteria_list_200.csv')
      .then((r) => r.text())
      .then((txt) => {
        const parsed = parseCsv(txt)
        if (parsed.length === 0) console.warn('Bacteria CSV parsed to 0 rows')
        setRows(shuffle(parsed))
        setIndex(0)
      })
      .catch((e) => {
        console.error('Failed to load bacteria CSV', e)
        setRows([])
      })
  }, [])

  const row = useMemo(() => rows[index], [rows, index])

  function handleAnswer(isHarmfulYes: boolean) {
    if (!row) return
    const actual =
      String(row['Harmful to Humans'] ?? '')
        .trim()
        .toLowerCase() === 'yes'
    const correct = isHarmfulYes === actual
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
        <h2 className="text-xl font-semibold">Bacteria Check</h2>
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
            <div className="text-sm text-muted-foreground">Bacteria</div>
            <div className="text-lg font-medium">{row['Name']}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Family: {row['Family']}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="whitespace-pre-wrap break-words rounded border p-3">
              <div className="text-xs text-muted-foreground">Where Found</div>
              <div className="font-mono text-sm">{row['Where Found']}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-muted-foreground">Family</div>
              <div className="font-mono text-sm">{row['Family']}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              variant="secondary"
              onClick={() => handleAnswer(true)}
              disabled={answered}
            >
              Harmful
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="destructive"
              onClick={() => handleAnswer(false)}
              disabled={answered}
            >
              Not harmful
            </Button>
            <Button className="w-full sm:ml-auto sm:w-auto" onClick={next}>
              Skip / Next
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
            Actual: {String(row['Harmful to Humans'])}
          </div>
        </div>
      )}
    </div>
  )
}
