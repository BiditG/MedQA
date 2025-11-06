import Link from 'next/link'
import Step from './Step'
import Code from '@/components/Code'

const create = `
create table notes (
  id text primary key,
  title text
);
`.trim()

const server = `
// Server-side example: use Supabase client to query data in an Async
// Server Component.
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function Page() {
  const { data: user } = await supabase.from('profiles').select('*').eq('id', 'some-user-id').single()
  return <pre>{JSON.stringify(user, null, 2)}</pre>
}
`.trim()

const client = `
'use client'

// Client-side example: call your API routes. For example, fetch notes from
// a simple API endpoint.
import { useEffect, useState } from 'react'

export default function Page() {
  const [notes, setNotes] = useState<any[] | null>(null)

  useEffect(() => {
    const getData = async () => {
      const res = await fetch('/api/mcqs')
      const data = await res.json()
      setNotes(data?.rows || [])
    }
    getData()
  }, [])

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
`.trim()

export default function SignUpUserSteps() {
  return (
    <ol className="flex flex-col gap-6">
      <Step title="Create your first user (admin)">
        <p>
          This project uses an admin-managed user model. Visit the{' '}
          <Link
            href="/admin/users"
            className="font-bold text-foreground/80 hover:underline"
          >
            Admin → Users
          </Link>{' '}
          page to create your first user. Alternatively, run the seed script:
          <Code
            code={`ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret node scripts/seed-admin.js`}
          />
        </p>
      </Step>

      <Step title="Create some tables and insert some data">
        <p>
          Head over to the{' '}
          <a
            href="https://supabase.com/dashboard/project/_/editor"
            className="font-bold text-foreground/80 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Table Editor
          </a>{' '}
          for your Supabase project to create a table and insert some example
          data. If you&apos;re stuck for creativity, you can copy and paste the
          following into the{' '}
          <a
            href="https://supabase.com/dashboard/project/_/sql/new"
            className="font-bold text-foreground/80 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            SQL Editor
          </a>{' '}
          and click RUN!
        </p>
        <Code code={create} />
      </Step>

      <Step title="Query Supabase data from Next.js">
        <p>
          To query data from the server, prefer using the database helpers or
          the provided API routes. Below are short examples for server and
          client usage.
        </p>
        <Code code={server} />
        <p>Client example (calls an API route):</p>
        <Code code={client} />
      </Step>

      <Step title="Build in a weekend and scale to millions!">
        <p>You&apos;re ready to launch your product to the world! 🚀</p>
      </Step>
    </ol>
  )
}
