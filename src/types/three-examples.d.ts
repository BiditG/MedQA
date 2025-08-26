// Minimal ambient declarations to satisfy CI builds where `three` example
// modules may not have published types. These keep our local code typed
// without blocking the build.

declare module 'three' {
  const THREE: any
  export = THREE
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  const content: any
  export = content
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  const content: any
  export = content
}

// Fallback for other three/examples paths we might import later
declare module 'three/examples/*' {
  const content: any
  export default content
}
