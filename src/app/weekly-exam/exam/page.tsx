'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import WeeklyExam from '@/components/WeeklyExam'

export default function WeeklyExamPage() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ok = localStorage.getItem('weekly_exam_access') === 'granted'
      if (!ok) router.replace('/weekly-exam')
    }
  }, [router])

  return (
    <main>
      <WeeklyExam />
    </main>
  )
}
