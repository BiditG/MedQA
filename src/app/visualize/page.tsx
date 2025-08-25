'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ThreeAnatomy from '@/components/ThreeAnatomy'

// 🔗 Put public GLB URLs here (CORS-enabled)
const SYSTEM_MODELS: Record<string, string> = {
  Heart: '/models/heart.glb',
  Lungs: '/models/lungs.glb', // e.g. /public/models/skeletal.glb
}

export default function VisualizePage() {
  const systems = useMemo(() => Object.keys(SYSTEM_MODELS), [])

  const [activeSystem, setActiveSystem] = useState<string>('Skeletal')
  const [labels, setLabels] = useState(true)
  const [picked, setPicked] = useState<string | null>(null)
  const [resetCounter, setResetCounter] = useState(0)

  const modelUrl = SYSTEM_MODELS[activeSystem]

  return (
    <div className="w-full">
      <PageHeader
        title="Explore Anatomy in 3D"
        subtitle="Open-source viewer: orbit, zoom, click parts to identify (UI + basic interactions)."
      />

      <div className="grid gap-4 md:grid-cols-4">
        {/* Systems */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Systems</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {systems.map((s) => (
              <Button
                key={s}
                variant={s === activeSystem ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => {
                  setActiveSystem(s)
                  setPicked(null)
                  setResetCounter((k) => k + 1) // refit view
                }}
              >
                {s}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Viewport */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Viewport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[60vh] overflow-hidden rounded-2xl border bg-muted">
              {/* 3D Canvas */}
              {modelUrl ? (
                <ThreeAnatomy
                  modelUrl={modelUrl}
                  showLabels={labels}
                  onPickPart={setPicked}
                  resetKey={resetCounter}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No model for {activeSystem}. Add a GLB path in SYSTEM_MODELS.
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setResetCounter((k) => k + 1)}
              >
                Reset View
              </Button>
              <Button
                variant={labels ? 'default' : 'outline'}
                onClick={() => setLabels((v) => !v)}
              >
                {labels ? 'Hide Labels' : 'Show Labels'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Structures / Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Structures</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Input placeholder="Search structures" />
            <div className="rounded-md border p-2">
              <div className="mb-1 text-xs text-muted-foreground">
                Picked structure
              </div>
              <div className="rounded bg-accent px-2 py-1">
                {picked ?? 'Click a part to see its name'}
              </div>
            </div>
            <div className="rounded-md border p-2">
              Structure tree (coming soon)
            </div>
            <div className="rounded-md border p-2">
              Details panel (coming soon)
            </div>
            <Button variant="outline">Quiz me on this region</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
