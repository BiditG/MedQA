'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'

type Props = {
  src: string // e.g., /notes/chemistry/file.pdf#toolbar=0&navpanes=0&scrollbar=0
  title: string
  className?: string
}

export default function PdfViewer({ src, title, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isFs, setIsFs] = useState(false)
  const [zoom, setZoom] = useState(1) // 0.5x – 2x

  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function zoomIn() {
    setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10))
  }
  function zoomOut() {
    setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))
  }

  async function enterFullscreen() {
    const el = containerRef.current
    if (!el) return
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else {
        const anyEl = el as any
        if (anyEl.webkitRequestFullscreen)
          await Promise.resolve(anyEl.webkitRequestFullscreen())
      }
    } catch {}
  }
  async function exitFullscreen() {
    try {
      if (document.exitFullscreen) await document.exitFullscreen()
      else {
        const anyDoc = document as any
        if (anyDoc.webkitExitFullscreen)
          await Promise.resolve(anyDoc.webkitExitFullscreen())
      }
    } catch {}
  }

  // Compensate size so only the PDF scales (no layout jump, no flicker)
  const comp = (100 / zoom).toFixed(6)

  return (
    <div
      ref={containerRef}
      className={`${className ? className + ' ' : ''}relative overflow-auto`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={zoomOut}
          className="rounded bg-black/60 p-2 text-white hover:bg-black/70"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="grid place-items-center rounded bg-black/50 px-2 text-xs text-white">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          className="rounded bg-black/60 p-2 text-white hover:bg-black/70"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={isFs ? exitFullscreen : enterFullscreen}
          className="rounded bg-black/60 p-2 text-white hover:bg-black/70"
          aria-label={isFs ? 'Exit full screen' : 'Enter full screen'}
          title={isFs ? 'Exit full screen' : 'Enter full screen'}
        >
          {isFs ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: `${comp}%`,
          height: `${comp}%`,
        }}
      >
        <iframe
          src={src}
          title={title}
          className="h-full w-full rounded-md"
          allow="fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  )
}
