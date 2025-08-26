'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
  Bounds,
  Environment,
  Html,
  OrbitControls,
  useBounds,
  useGLTF,
} from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import * as THREE from 'three'

type ThreeAnatomyProps = {
  modelUrl: string
  showLabels?: boolean
  onPickPart?: (name: string | null) => void
  resetKey?: number
  fullscreen?: boolean
  onFullscreenChange?: (isFs: boolean) => void
}

type HoverInfo = { name: string; worldPos: THREE.Vector3 } | null

function getObjectCenter(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj)
  const center = new THREE.Vector3()
  box.getCenter(center)
  return center
}

/** Model + interactions (hover/click) — hover is local state here */
function Model({
  url,
  showLabels,
  onPickPart,
}: {
  url: string
  showLabels?: boolean
  onPickPart?: (name: string | null) => void
}) {
  const gltf = useGLTF(url) as GLTF & { scene: THREE.Object3D }
  const scene = gltf.scene
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null)

  // Ensure meshes are interactive
  useEffect(() => {
    if (!scene) return
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        obj.raycast = THREE.Mesh.prototype.raycast
      }
    })
  }, [scene])

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation()
    const target = e.object as THREE.Object3D
    const name = target?.name || target?.parent?.name || ''
    const worldPos = getObjectCenter(target)
    if (name) setHoverInfo({ name, worldPos })
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    setHoverInfo(null)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      const target = e.object as THREE.Object3D
      const name = target?.name || target?.parent?.name || null
      onPickPart?.(name)
    },
    [onPickPart],
  )

  return (
    <group>
      <primitive
        object={scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
      {showLabels && hoverInfo && (
        <Html
          position={[
            hoverInfo.worldPos.x,
            hoverInfo.worldPos.y,
            hoverInfo.worldPos.z,
          ]}
          center
          occlude
        >
          <div className="rounded-md bg-black/75 px-2 py-1 text-xs text-white shadow">
            {hoverInfo.name}
          </div>
        </Html>
      )}
    </group>
  )
}

/** Inside-<Bounds> fitter to guarantee perfect framing + control limits */
function BoundsFitter({ resetKey }: { resetKey: number }) {
  const api = useBounds()
  const { camera, size, controls } = useThree() as {
    camera: THREE.PerspectiveCamera
    size: { width: number; height: number }
    controls?: any
  }

  // Fit entire scene on mount/reset/resize
  useEffect(() => {
    const t = setTimeout(() => {
      api.refresh().fit()
    }, 0)
    return () => clearTimeout(t)
  }, [api, resetKey, size.width, size.height])

  // After fit, set min/max distance relative to current distance
  useEffect(() => {
    const t = setTimeout(() => {
      const dist = camera.position.length()
      if (controls) {
        controls.minDistance = Math.max(0.05, dist * 0.2)
        controls.maxDistance = Math.max(10, dist * 6)
        controls.update?.()
      }
    }, 30)
    return () => clearTimeout(t)
  }, [camera, controls, resetKey, size.width, size.height])

  return null
}

export default function ThreeAnatomy({
  modelUrl,
  showLabels = true,
  onPickPart,
  resetKey = 0,
  fullscreen = false,
  onFullscreenChange,
}: ThreeAnatomyProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Fullscreen management
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onChange = () => {
      const isFs =
        !!document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      onFullscreenChange?.(!!isFs)
    }

    document.addEventListener('fullscreenchange', onChange)
    ;(document as any).addEventListener?.('webkitfullscreenchange', onChange)

    if (fullscreen) {
      const req =
        el.requestFullscreen ||
        (el as any).webkitRequestFullscreen ||
        (el as any).mozRequestFullScreen ||
        (el as any).msRequestFullscreen
      req?.call(el)
    } else {
      const exit =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen
      if (
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ) {
        exit?.call(document)
      }
    }

    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      ;(document as any).removeEventListener?.(
        'webkitfullscreenchange',
        onChange,
      )
    }
  }, [fullscreen, onFullscreenChange])

  // Safe ref callback (not used, but harmless to keep)
  const setControlsRef = useCallback((controls: any | null) => {
    // With makeDefault, controls are available via useThree().controls
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [0, 1, 5], fov: 45, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        <Lights />

        <React.Suspense
          fallback={
            <Html center>
              <div className="rounded-md border bg-white/80 px-3 py-2 text-sm shadow">
                Loading model…
              </div>
            </Html>
          }
        >
          <Bounds fit clip observe margin={1.2}>
            <Model
              url={modelUrl}
              showLabels={showLabels}
              onPickPart={onPickPart}
            />
            <BoundsFitter resetKey={resetKey} />
          </Bounds>
          <Environment preset="city" />
        </React.Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.12}
          makeDefault
          ref={setControlsRef}
        />
      </Canvas>
    </div>
  )
}

function Lights() {
  return (
    <>
      <hemisphereLight intensity={0.6} groundColor={'#444'} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  )
}

// Optional: preload helper
export function preloadAnatomyModel(url: string) {
  try {
    useGLTF.preload(url)
  } catch {}
}
