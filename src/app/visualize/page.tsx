'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Maximize2, Minimize2, Eye, RotateCcw } from 'lucide-react'

// Load the heavy client-only 3D component on the client to avoid server-side import
const ThreeAnatomy = dynamic(() => import('@/components/ThreeAnatomy'), {
  ssr: false,
})

export default function VisualizePage() {
  const availableModels = [
    { id: 'brain', label: 'Brain', url: '/models/brain.glb' },
    { id: 'heart', label: 'Heart', url: '/models/heart.glb' },
    { id: 'lungs', label: 'Lungs', url: '/models/lungs.glb' },
    { id: 'digestive', label: 'Digestive', url: '/models/digestive.glb' },
    { id: 'skeletal', label: 'Skeletal', url: '/models/skeletal.glb' },
    { id: 'skull', label: 'Skull', url: '/models/skull.glb' },
    { id: 'spine', label: 'Spine', url: '/models/spine.glb' },
    { id: 'eye', label: 'Eye', url: '/models/eye.glb' },
  ]

  const [modelUrl, setModelUrl] = useState(availableModels[0].url)
  const [fullscreen, setFullscreen] = useState(false)
  const [showLabels, setShowLabels] = useState(true)

  const controls = useMemo(
    () => ({ fullscreen, showLabels }),
    [fullscreen, showLabels],
  )

  return (
    <div className="p-6">
      <PageHeader
        title="Visualize Anatomy"
        subtitle="Interactive 3D anatomy viewer"
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-[60vh] min-h-[380px]">
            <CardHeader>
              <CardTitle>3D Viewer</CardTitle>
            </CardHeader>
            <CardContent className="relative h-full p-0">
              <ThreeAnatomy
                modelUrl={modelUrl}
                showLabels={showLabels}
                fullscreen={fullscreen}
                onFullscreenChange={(fs) => setFullscreen(fs)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setFullscreen((s) => !s)}
                >
                  {fullscreen ? (
                    <Minimize2 className="mr-2" />
                  ) : (
                    <Maximize2 className="mr-2" />
                  )}{' '}
                  {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </Button>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">Model</label>
                <select
                  className="w-full rounded border bg-input p-2 text-sm"
                  value={modelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.url}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                  />
                  Show labels
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Reload Viewer
                </Button>
                <Button
                  onClick={() => alert('Reset view (not implemented)')}
                  variant="ghost"
                >
                  <RotateCcw className="mr-2" /> Reset View
                </Button>
                <Button onClick={() => setShowLabels(true)} variant="ghost">
                  <Eye className="mr-2" /> Show Labels
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
