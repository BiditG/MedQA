'use client'
import { useEffect, useState } from 'react'

const time = (seconds: number) =>
  `${Math.floor(seconds / 60)}m ${seconds % 60}s`
export default function CeeRankbreakerLeaderboard() {
  const [board, setBoard] = useState<any>(null),
    [page, setPage] = useState(1),
    [error, setError] = useState('')
  useEffect(() => {
    fetch(`/api/cee-rankbreaker/leaderboard?page=${page}&pageSize=25`, {
      cache: 'no-store',
    })
      .then(async (response) => {
        const json = await response.json()
        if (!response.ok) throw new Error(json.error)
        setBoard(json)
      })
      .catch((err) => setError(err.message))
  }, [page])
  if (error) return <p className="text-red-700">{error}</p>
  if (!board) return <p>Loading CEE Rankbreaker ranking…</p>
  return (
    <section className="rounded-xl border bg-card">
      <div className="border-b p-5">
        <h1 className="text-3xl font-semibold">CEE Rankbreaker ranking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {board.edition?.name || 'No published edition'} · This is not a
          predicted national CEE rank.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Participant name</th>
              <th className="p-4">Net marks / 200</th>
              <th className="p-4">Completion time</th>
              <th className="p-4">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {board.rows.map((row: any) => (
              <tr
                key={row.id}
                className={`border-t ${
                  row.id === board.currentAttemptId ? 'bg-primary/10' : ''
                }`}
              >
                <td className="p-4 font-semibold">#{row.rank}</td>
                <td className="p-4">{row.name}</td>
                <td className="p-4">{row.netMarks.toFixed(2)}</td>
                <td className="p-4">{time(row.completionSeconds)}</td>
                <td className="p-4">{row.accuracy.toFixed(2)}%</td>
              </tr>
            ))}
            {board.rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No finalized eligible attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between p-4 text-sm">
        <span>{board.total} participants</span>
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={page * board.pageSize >= board.total}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
