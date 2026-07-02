import { ceeMcqSyllabus } from './ceeMcqSyllabus'

export type ExamPlannerStatus = 'not-started' | 'in-progress' | 'ready'

export type ExamPlannerChapter = {
  id: string
  title: string
  unit: string
  marks: {
    min: number
    max: number
  }
  subtopics: string[]
}

export type ExamPlannerSubject = {
  name: string
  slug: string
  totalMarks: number
  chapters: ExamPlannerChapter[]
}

const subjectTotals: Record<string, number> = {
  physics: 50,
  chemistry: 50,
  zoology: 40,
  botany: 40,
  mat: 20,
}

const chapterRanges: Record<string, Array<[number, number]>> = {
  physics: [
    [12, 14],
    [6, 8],
    [6, 8],
    [7, 9],
    [6, 8],
    [7, 9],
  ],
  chemistry: [
    [14, 16],
    [8, 10],
    [10, 12],
    [6, 8],
    [4, 6],
  ],
  zoology: [
    [3, 5],
    [5, 7],
    [2, 4],
    [2, 4],
    [12, 14],
    [4, 6],
    [3, 5],
    [2, 4],
  ],
  botany: [
    [2, 4],
    [6, 8],
    [3, 5],
    [6, 8],
    [4, 6],
    [3, 5],
    [5, 7],
    [4, 6],
    [2, 4],
  ],
  mat: [
    [5, 7],
    [4, 6],
    [5, 7],
    [4, 6],
  ],
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}

export const ceeExamPlannerSubjects: ExamPlannerSubject[] = ceeMcqSyllabus.map(
  (subject) => {
    const ranges = chapterRanges[subject.slug] ?? []

    return {
      name: subject.name,
      slug: subject.slug,
      totalMarks: subjectTotals[subject.slug] ?? 0,
      chapters: subject.topics.flatMap((topic, index) => {
        const range = ranges[index]
        const min = range?.[0] ?? 1
        const max = range?.[1] ?? min
        const divisor = Math.max(1, topic.subtopics.length)

        return topic.subtopics.map((subtopic) => ({
          id: `${subject.slug}-${slugify(topic.title)}-${slugify(subtopic)}`,
          title: subtopic,
          unit: topic.title,
          marks: {
            min: toOneDecimal(min / divisor),
            max: toOneDecimal(max / divisor),
          },
          subtopics: [subtopic],
        }))
      }),
    }
  },
)

export function getEstimatedMarks(
  chapter: ExamPlannerChapter,
  status: ExamPlannerStatus,
) {
  if (status === 'ready') return chapter.marks.max
  if (status === 'in-progress') {
    return (chapter.marks.min + chapter.marks.max) / 2
  }
  return 0
}
