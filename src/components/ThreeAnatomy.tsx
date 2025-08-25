'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Html, OrbitControls, useGLTF } from '@react-three/drei'

type ThreeAnatomyProps = {
  /** Public URL to a .glb/.gltf anatomy model (must allow CORS) */
  modelUrl: string
  /** Show labels tooltip on hover */
  showLabels?: boolean
  /** Called when user clicks a mesh/part */
  onPickPart?: (name: string | null) => void
  /** Request a reset from parent (toggle this boolean) */
  resetKey?: number
}

function Model({
  url,
  showLabels,
  onPickPart,
}: {
  url: string
  showLabels?: boolean
  onPickPart?: (name: string | null) => void
}) {
  const group = useRef<any>(null)
  const { scene } = useGLTF(url)

  // Simple hover state for labels
  const [hovered, setHovered] = useState<string | null>(null)

  // Make all meshes interactive
  useEffect(() => {
    scene.traverse((obj: any) => {
      if (obj && obj.isMesh) {
        const mesh = obj as any
        mesh.castShadow = true
        mesh.receiveShadow = true
        // Enable pointer events
        mesh.onPointerOver = (e: any) => {
          e.stopPropagation()
          setHovered(mesh.name || mesh.parent?.name || null)
        }
        mesh.onPointerOut = (e: any) => {
          e.stopPropagation()
          setHovered((curr) =>
            curr === (mesh.name || mesh.parent?.name) ? null : curr,
          )
        }
        mesh.onClick = (e: any) => {
          e.stopPropagation()
          onPickPart?.(mesh.name || mesh.parent?.name || null)
        }
      }
    })
  }, [scene, onPickPart])

  // Subtle rotation if idle (fun in demo)
  useFrame((_, delta) => {
    if (!group.current) return
    // comment next line out if you don't want idle spin:
    // group.current.rotation.y += delta * 0.05;
  })

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
      {showLabels && hovered && (
        <Html position={[0, 1.2, 0]} center occlude>
          <div className="rounded-md bg-black/75 px-2 py-1 text-xs text-white shadow">
            {hovered}
          </div>
        </Html>
      )}
    </group>
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

export default function ThreeAnatomy({
  modelUrl,
  showLabels = true,
  onPickPart,
  resetKey = 0,
}: ThreeAnatomyProps) {
  // Controls ref to allow external reset
  const controls = useRef<any>(null)

  useEffect(() => {
    // Fit camera on reset
    if (controls.current) {
      controls.current.reset() // resets target & polar/azimuth
      // optional: set a pleasant default target
      controls.current.target.set(0, 1.0, 0)
    }
  }, [resetKey])

  // Tone mapping / color management handled by Canvas defaults
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.2, 3.2], fov: 45, near: 0.1, far: 200 }}
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
        <Model url={modelUrl} showLabels={showLabels} onPickPart={onPickPart} />
        <Environment preset="city" />
      </React.Suspense>
      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.12}
        minDistance={1}
        maxDistance={8}
      />
    </Canvas>
  )
}

// Preload hook to warm cache if you know the URL upfront
export function preloadAnatomyModel(url: string) {
  try {
    useGLTF.preload(url)
  } catch {}
}
