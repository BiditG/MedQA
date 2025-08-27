'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type FileItem = { path: string; label: boolean | null }

export default function PneumoniaQuiz() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    fetch('/api/pneumonia/files')
      .then((r) => r.json())
      .then((j) => {
        const list: FileItem[] = j.files || []
        // shuffle
        for (let i = list.length - 1; i > 0; i--) {
          const r = Math.floor(Math.random() * (i + 1))
          ;[list[i], list[r]] = [list[r], list[i]]
        }
        setFiles(list)
        setIndex(0)
      })
      .catch(() => setFiles([]))
  }, [])

  const item = useMemo(() => files[index], [files, index])

  function handleAnswer(isPneumonia: boolean) {
    if (!item) return
    // if label unknown (null), consider it incorrect to encourage caution
    const actual = item.label === true
    const correct = isPneumonia === actual
    setLastCorrect(correct)
    setAnswered(true)
    if (correct) setScore((s) => s + 1)
  }

  function next() {
    setAnswered(false)
    setLastCorrect(null)
    setIndex((i) => {
      const n = i + 1
      if (n >= files.length) {
        setFinished(true)
        return i
      }
      return n
    })
  }

  if (files.length === 0) {
    return (
      <div className="p-4">
        Loading images or none found in /data/Pneumonia.
      </div>
    )
  }

  const progress = Math.round(
    ((index + (answered ? 1 : 0)) / files.length) * 100,
  )

  if (finished) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Quiz complete</h2>
          <p className="text-sm text-muted-foreground">
            You scored {score} out of {files.length}.
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
        <h2 className="text-xl font-semibold">Pneumonia Check</h2>
        <div className="text-sm text-muted-foreground">Score: {score}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-muted-foreground">
          Image {index + 1} of {files.length}
        </div>
        <div className="mt-2">
          <Progress value={progress} />
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <div className="text-sm text-muted-foreground">Chest X-ray</div>
          <div className="text-lg font-medium">Guess: Pneumonia or Not</div>
        </CardHeader>
        <CardContent>
          <div className="flex w-full justify-center">
            <img
              src={item.path}
              alt={`Pneumonia example ${index + 1}`}
              className="max-h-[60vh] w-auto object-contain"
            />
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
              Pneumonia
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="destructive"
              onClick={() => handleAnswer(false)}
              disabled={answered}
            >
              Not pneumonia
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
            Actual label:{' '}
            {item.label === null
              ? 'Unknown'
              : item.label
                ? 'Pneumonia'
                : 'Not pneumonia'}
          </div>
        </div>
      )}
    </div>
  )
}
