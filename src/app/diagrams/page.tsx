'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, X } from 'lucide-react'

interface DiagramMapping {
  [key: string]: string
}

export default function DiagramsPage() {
  const [diagrams, setDiagrams] = useState<{ [category: string]: string[] }>({})
  const [loading, setLoading] = useState(true)
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    fetch('/data/diagrams/mapping.json')
      .then((response) => response.json())
      .then((data: DiagramMapping) => {
        const grouped: { [category: string]: string[] } = {}
        Object.entries(data).forEach(([path, category]) => {
          if (!grouped[category]) {
            grouped[category] = []
          }
          grouped[category].push(path)
        })
        setDiagrams(grouped)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading diagrams:', error)
        setLoading(false)
      })
  }, [])

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 300))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))

  const handleClose = () => {
    setSelectedPdf(null)
    setZoom(100)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-center text-2xl font-bold sm:mb-8 sm:text-3xl lg:text-4xl">
        Medical Diagrams
      </h1>
      {Object.entries(diagrams).map(([category, paths]) => (
        <div key={category} className="mb-8 sm:mb-12">
          <h2 className="mb-4 border-b pb-2 text-xl font-semibold sm:mb-6 sm:text-2xl">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {paths.map((path) => {
              const filename = path.split('/').pop() || ''
              const displayName = filename
                .replace('.pdf', '')
                .replace(/^Edu-/, '')
                .replace(/-/g, ' ')
              return (
                <div
                  key={path}
                  onClick={() => setSelectedPdf(path)}
                  className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-blue-300 hover:shadow-lg active:scale-95 sm:p-4"
                >
                  <div className="mb-2 flex items-center">
                    <div className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mr-3 sm:h-8 sm:w-8">
                      <svg
                        className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 sm:text-base lg:text-lg">
                      {displayName}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 sm:text-sm">
                    Click to view diagram
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <Dialog open={!!selectedPdf} onOpenChange={handleClose}>
        <DialogContent
          className="mx-1 h-[98vh] w-full max-w-[98vw] overflow-hidden p-0 sm:mx-2 sm:h-[95vh] sm:max-w-[95vw]"
          style={{ backgroundColor: '#282828' }}
          aria-describedby="pdf-viewer-description"
        >
          <div
            className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-gray-700 p-2 sm:p-3"
            style={{ backgroundColor: '#282828' }}
          >
            <DialogTitle className="truncate pr-2 text-sm font-semibold text-white sm:text-base lg:text-lg">
              {selectedPdf
                ? selectedPdf
                    .split('/')
                    .pop()
                    ?.replace('.pdf', '')
                    .replace(/^Edu-/, '')
                    .replace(/-/g, ' ')
                : ''}
            </DialogTitle>
            <div className="flex flex-shrink-0 items-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="h-7 w-7 border-gray-600 bg-gray-800 p-0 text-white hover:bg-gray-700 sm:h-8 sm:w-8"
              >
                <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="min-w-[40px] text-center text-xs font-medium text-gray-300 sm:min-w-[50px] sm:text-sm">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
                className="h-7 w-7 border-gray-600 bg-gray-800 p-0 text-white hover:bg-gray-700 sm:h-8 sm:w-8"
              >
                <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-7 w-7 border-gray-600 bg-gray-800 p-0 text-white hover:bg-gray-700 sm:h-8 sm:w-8"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
          <div
            className="h-full w-full overflow-hidden pt-12 sm:pt-16"
            style={{ backgroundColor: '#282828' }}
          >
            {selectedPdf && (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: '#282828' }}
              >
                <iframe
                  src={`${selectedPdf}#zoom=100&toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                  className="border-0 shadow-lg"
                  title="PDF Viewer"
                  style={{
                    width: '90vw',
                    height: 'calc(100vh - 4rem)',
                    maxWidth: '90vw',
                    maxHeight: 'calc(100vh - 4rem)',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                  }}
                  allowFullScreen
                />
              </div>
            )}
          </div>
          <div id="pdf-viewer-description" className="sr-only">
            PDF viewer with zoom controls - displays medical diagrams in full
            screen
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
