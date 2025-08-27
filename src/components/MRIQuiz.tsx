'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

type FileItem = { path: string; label: string | null }

export default function MRIQuiz() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    fetch('/api/mri/files')
      .then((r) => r.json())
      .then((j) => {
        const list: FileItem[] = j.files || []
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

  function handleAnswer(choice: string) {
    if (!item) return
    const actual = item.label
    const correct = actual === choice
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
      <div className="p-4">Loading MRI images or none found in /data/MRI.</div>
    )
  }

  const progress = Math.round(
    ((index + (answered ? 1 : 0)) / files.length) * 100,
  )

  if (finished) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Tumour Check complete</h2>
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

  const options = ['Glioma', 'Meningioma', 'Pituitary', 'No Tumor']

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tumour Check</h2>
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
          <div className="text-sm text-muted-foreground">Brain MRI</div>
          <div className="text-lg font-medium">Pick tumour category</div>
        </CardHeader>
        <CardContent>
          <div className="flex w-full justify-center">
            <img
              src={item.path}
              alt={`MRI ${index + 1}`}
              className="max-h-[60vh] w-auto object-contain"
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-4">
            {options.map((o) => (
              <Button
                key={o}
                className="w-full"
                onClick={() => handleAnswer(o)}
                disabled={answered}
              >
                {o}
              </Button>
            ))}
            <Button className="w-full sm:col-span-4" onClick={next}>
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
            Actual: {item.label ?? 'Unknown'}
          </div>
        </div>
      )}
    </div>
  )
}
