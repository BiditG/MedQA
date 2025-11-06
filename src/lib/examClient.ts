'use client'

export async function endExamSession() {
  try {
    await fetch('/api/weekly-exam/logout', { method: 'POST' })
  } catch {}
  try {
    localStorage.removeItem('weekly_exam_access')
  } catch {}
}
