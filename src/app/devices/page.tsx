import dynamic from 'next/dynamic'

export const metadata = {
  title: 'Device Lookup',
  description: 'Search FDA device databases and recalls',
}

// Client-only dynamic import to avoid importing client components from server
const DeviceSearch = dynamic(() => import('@/components/DeviceSearch'), {
  ssr: false,
})

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Medical Device Lookup</h1>
      <p className="mt-1 text-sm text-gray-600">
        Search device classifications, 510(k)s, PMAs and enforcement (recall)
        records from OpenFDA.
      </p>
      <div className="mt-4">
        <DeviceSearch />
      </div>
    </main>
  )
}
