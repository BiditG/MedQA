import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WeeklyExam from '@/components/WeeklyExam'
import { verifyExamToken } from '@/lib/examAuth'
import { listExamCodes } from '@/lib/examCodes'

export default async function WeeklyExamPage() {
  const token = cookies().get('weekly_exam_token')?.value
  const payload = token ? verifyExamToken(token) : null
  if (!payload) redirect('/weekly-exam')

  // Re-check current status of the code (active + not expired)
  const codes = await listExamCodes()
  const found = codes.find(
    (c) => c.code.toUpperCase() === payload.code.toUpperCase(),
  )
  const expired = found?.expiresAt
    ? Date.now() > Date.parse(found.expiresAt)
    : false
  if (!found || !found.active || expired) redirect('/weekly-exam')

  return (
    <main>
      <WeeklyExam />
    </main>
  )
}
