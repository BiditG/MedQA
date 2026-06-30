import {
  Atom,
  BookOpenCheck,
  Brain,
  CalendarCheck,
  Dna,
  FlaskConical,
  Lightbulb,
  LucideIcon,
} from 'lucide-react'

export type CeeGuideArticle = {
  slug: string[]
  contentPath?: string[]
  title: string
  description: string
  readTime: string
  accent: string
  sections: CeeGuideArticleSection[]
  points: string[]
  actionItems: string[]
}

export type CeeGuideArticleSection = {
  title: string
  body: string
  items: string[]
}

export type CeeGuideSection = {
  title: string
  slug: string
  description: string
  icon: LucideIcon
  articles: CeeGuideArticle[]
}

function article(
  path: string,
  title: string,
  description: string,
  points: string[],
  actionItems: string[],
  readTime = '5 min read',
  contentPath?: string,
): CeeGuideArticle {
  const [category] = path.split('/')

  return {
    slug: path.split('/'),
    contentPath: contentPath?.split('/'),
    title,
    description,
    readTime,
    accent: category,
    sections: [
      {
        title: 'What to Understand',
        body: `${description} Treat this article as a practical study note: first understand the purpose of the topic, then turn it into recall prompts and timed MCQs. This keeps preparation close to the way CEE questions are actually answered.`,
        items: points,
      },
      {
        title: 'How to Study It',
        body: getStudyMethod(category, title),
        items: actionItems,
      },
      {
        title: 'Exam Focus',
        body: getExamFocus(category, title),
        items: getExamFocusItems(category, title),
      },
    ],
    points,
    actionItems,
  }
}

function getStudyMethod(category: string, title: string) {
  if (category === 'syllabus') {
    return `Use ${title} as a checklist, not as a chapter to read once and forget. Color-code topics as strong, shaky, or untouched, then revise through active recall and short mixed tests.`
  }

  if (category === 'study-strategy') {
    return `For ${title}, keep the plan visible and measurable. CEE preparation works best when daily targets include learning, retrieval practice, and correction of mistakes instead of only counting study hours.`
  }

  if (category === 'subject-guides') {
    return `${title} should be studied with a subject-specific method. Biology-heavy work needs repeated recall, Physics and Physical Chemistry need worked examples plus timed numericals, and MAT needs pattern drills.`
  }

  if (category === 'tips-and-tricks') {
    return `Practice ${title} during mocks, not for the first time in the exam hall. The technique should become automatic before the real paper so it reduces pressure instead of adding decisions.`
  }

  return `${title} is part of performance preparation. Protect confidence by using small review loops: notice the problem, name the fix, repeat the corrected method, and move forward.`
}

function getExamFocus(category: string, title: string) {
  if (category === 'syllabus') {
    return `CEE questions reward broad coverage with fast recall. Give more revision cycles to high-yield and mistake-prone areas, but keep low-yield topics alive with short review passes.`
  }

  if (category === 'study-strategy') {
    return `A plan is useful only if it changes your daily behavior. Keep mock analysis, weak-topic repair, and sleep discipline inside the plan from the beginning.`
  }

  if (category === 'subject-guides') {
    return `The goal is not beautiful notes; the goal is correct options under time. After learning a concept, immediately test it through MCQs and write down the exact reason for every wrong answer.`
  }

  if (category === 'tips-and-tricks') {
    return `Use tactics to protect marks. A calm skip, a clean elimination, or a one-minute checkpoint often saves more marks than forcing a doubtful question.`
  }

  return `Mental state matters because it changes accuracy. Keep the final routine simple, familiar, and repeatable so the exam feels like another practiced session.`
}

function getExamFocusItems(category: string, title: string) {
  if (category === 'syllabus') {
    return [
      'Turn every topic into 3 to 5 recall questions.',
      'Revise weak topics with spaced repetition instead of one long rereading session.',
      'Finish each topic with mixed MCQs so you can recognize it outside chapter order.',
    ]
  }

  if (category === 'study-strategy') {
    return [
      'Keep a weekly target for syllabus, MCQs, and revision.',
      "Use mock-test mistakes as the next week's study map.",
      'Prefer consistent daily progress over sudden oversized plans.',
    ]
  }

  if (category === 'subject-guides') {
    return [
      'Learn the concept, solve examples, then attempt timed MCQs.',
      'Maintain a one-page mistake log for the subject.',
      'Review formulas, diagrams, reactions, or patterns in short daily slots.',
    ]
  }

  if (category === 'tips-and-tricks') {
    return [
      'Practice the technique in at least three mocks.',
      'Write the rule you will follow before exam day.',
      'Measure whether the tactic improves accuracy, not only speed.',
    ]
  }

  return [
    'Use calm routines before study and before mocks.',
    'Convert mistakes into specific next actions.',
    'Avoid new resources during the final stretch.',
  ]
}

export const ceeGuideSections: CeeGuideSection[] = [
  {
    title: 'Syllabus',
    slug: 'syllabus',
    description:
      'Start with the CEE syllabus overview before planning your preparation.',
    icon: BookOpenCheck,
    articles: [
      article(
        'syllabus',
        'CEE Syllabus Overview',
        'A clean map of Physics, Chemistry, Biology, and MAT so you know what to study first.',
        [
          'Start with the official CEE syllabus and divide it into must-do, should-do, and revision-only topics.',
          'Give Biology consistent daily time because it rewards repeated reading and fast recall.',
          'Use Physics and Physical Chemistry sessions for concepts, formulas, and timed numerical practice.',
        ],
        [
          'Create a one-page checklist for each subject.',
          'Mark weak chapters after one diagnostic test.',
          'Revise the checklist every Sunday.',
        ],
      ),
    ],
  },
  {
    title: 'Study Strategy',
    slug: 'study-strategy',
    description:
      'Step-by-step plans for starting, building momentum, revising, and handling the final week.',
    icon: CalendarCheck,
    articles: [
      article(
        'study-strategy/how-to-start',
        'How to Start CEE Preparation',
        'A practical first-week setup for students who feel overloaded.',
        [
          'Begin with a diagnostic test so your plan is based on evidence, not anxiety.',
          'Keep the first week simple: syllabus mapping, baseline testing, and two focused study blocks daily.',
          'Avoid collecting too many resources before building a study rhythm.',
        ],
        [
          'Take one full diagnostic test.',
          'Choose one primary source per subject.',
          'Set a daily fixed revision slot.',
        ],
      ),
      article(
        'study-strategy/90-day-plan',
        '90-Day CEE Plan',
        'A complete three-month plan for concept building, practice, and revision.',
        [
          'Use the first 45 days for syllabus completion and chapter-level MCQs.',
          'Use the next 30 days for mixed practice, weak-topic repair, and short notes.',
          'Use the final 15 days for mock tests, formula revision, and error-log correction.',
        ],
        [
          'Finish one major and one minor chapter daily.',
          'Attempt two full mocks every week after day 45.',
          'Keep the last hour of each day for review.',
        ],
      ),
      article(
        'study-strategy/60-day-plan',
        '60-Day CEE Plan',
        'A compact plan for students who already know the basics.',
        [
          'Prioritize high-yield chapters and stop spending full days on low-return topics.',
          'Every study day should include Biology recall, numerical practice, and one review block.',
          'Mock analysis matters more than mock count when time is limited.',
        ],
        [
          'Study in two 3-hour blocks and one 1-hour revision block.',
          'Attempt three subject tests per week.',
          'Update your error log after every test.',
        ],
      ),
      article(
        'study-strategy/30-day-revision-plan',
        '30-Day Revision Plan',
        'How to revise aggressively without turning the last month chaotic.',
        [
          'Revision should be active: closed-book recall, MCQs, and correction of repeated mistakes.',
          'Do not reopen every chapter deeply; focus on summaries, formulas, diagrams, and weak points.',
          'Alternate full mocks with lighter review days to prevent burnout.',
        ],
        [
          'Complete one mock every two to three days.',
          'Revise formulas and Biology examples daily.',
          'Stop adding new resources.',
        ],
      ),
      article(
        'study-strategy/last-7-days',
        'Last 7 Days Before CEE',
        'What to revise, what to avoid, and how to protect confidence.',
        [
          'The last week is for consolidation, not risky experiments.',
          'Prioritize formula sheets, diagrams, marked mistakes, and frequently confused facts.',
          'Keep sleep and test timing close to exam-day routine.',
        ],
        [
          'Do one final full mock early in the week.',
          'Revise only trusted notes after that.',
          'Pack exam documents the day before.',
        ],
      ),
    ],
  },
  {
    title: 'Subject Guides',
    slug: 'subject-guides',
    description:
      'Simple subject overviews for Physics, Biology, Chemistry, and MAT.',
    icon: Atom,
    articles: [
      article(
        'subject-guides/physics',
        'Physics Guide',
        'A subject roadmap for scoring in CEE Physics.',
        [
          'Study Physics through examples first, then move to mixed MCQs.',
          'Most errors come from unit conversion, sign convention, and formula misuse.',
          'Repeated exposure to standard models is the fastest way to improve speed.',
        ],
        [
          'Build chapter formula sheets.',
          'Redo solved examples.',
          'Review units in every numerical.',
        ],
      ),
      article(
        'subject-guides/chemistry',
        'Chemistry Guide',
        'A smart split between Physical, Organic, and Inorganic Chemistry.',
        [
          'Treat each branch differently instead of using one study method for all Chemistry.',
          'Physical needs problem solving, Organic needs reaction logic, and Inorganic needs recall cycles.',
          'Mixed tests are important because CEE questions shift quickly between branches.',
        ],
        [
          'Rotate branches daily.',
          'Revise reactions in small sets.',
          'Practice numerical Chemistry with a timer.',
        ],
      ),
      article(
        'subject-guides/biology',
        'Biology Guide',
        'How to turn Biology reading into fast MCQ recall.',
        [
          'Biology scoring depends on repeated active recall, not just comfortable reading.',
          'Definitions, examples, diagrams, and process sequences need separate revision.',
          'Question practice should happen immediately after reading a topic.',
        ],
        [
          'Use diagrams as revision anchors.',
          'Make example lists.',
          'Practice 50 Biology MCQs daily.',
        ],
      ),
      article(
        'subject-guides/mat',
        'MAT Guide',
        'A reliable routine for Mental Ability Test practice.',
        [
          'MAT speed grows through daily exposure to common patterns.',
          'Do not stare too long at one item; mark it and return if time remains.',
          'A written rule helps avoid attractive wrong options.',
        ],
        [
          'Practice in short timed sets.',
          'Classify mistakes by pattern type.',
          'Repeat weak pattern sets.',
        ],
        '5 min read',
        'syllabus/mat.mdx',
      ),
    ],
  },
  {
    title: 'Tips and Tricks',
    slug: 'tips-and-tricks',
    description:
      'Exam-room methods for time, guessing, elimination, revision, and negative marking control.',
    icon: Lightbulb,
    articles: [
      article(
        'tips-and-tricks/guessing-strategy',
        'Guessing Strategy',
        'When to guess, when to skip, and how to avoid blind risk.',
        [
          'Guess only after eliminating at least one or two options with a clear reason.',
          'Avoid emotional guessing after a difficult question.',
          'Mark doubtful questions and return after securing easier marks.',
        ],
        [
          'Eliminate first.',
          'Skip questions with zero clue.',
          'Use remaining time for reviewed guesses.',
        ],
      ),
      article(
        'tips-and-tricks/time-management',
        'Time Management',
        'How to divide exam time across subjects and question difficulty.',
        [
          'Start with sections where you can collect marks quickly.',
          'Set checkpoints so one subject does not consume the whole paper.',
          'Return to lengthy calculations only after easier questions are done.',
        ],
        [
          'Use a first-pass strategy.',
          'Do not spend too long on one item.',
          'Reserve review time.',
        ],
      ),
      article(
        'tips-and-tricks/elimination-method',
        'Elimination Method',
        'A practical way to improve accuracy when options look close.',
        [
          'Elimination works best when you identify impossible, extreme, mismatched, or contradictory options.',
          'In Biology and Inorganic Chemistry, one wrong word can make an option false.',
          'In numericals, check units and magnitude to reject options quickly.',
        ],
        [
          'Cross out impossible options mentally.',
          'Check keywords carefully.',
          'Use units to remove wrong answers.',
        ],
      ),
      article(
        'tips-and-tricks/how-to-revise',
        'How to Revise',
        'A simple revision system for retaining more in less time.',
        [
          'Revision should include recall before rereading.',
          'Use active tools: blank-page recall, flashcards, diagrams, formulas, and error logs.',
          'Short repeated sessions beat rare long revision sessions.',
        ],
        [
          'Recall first, then read.',
          'Revise weak topics more often.',
          'Keep final notes short.',
        ],
      ),
      article(
        'tips-and-tricks/avoiding-negative-marking',
        'Avoiding Negative Marking',
        'How to protect your score from careless attempts.',
        [
          'Negative marking hurts most when students attempt questions from panic or ego.',
          'Accuracy improves when you separate sure, probable, and risky questions.',
          'A skipped question is sometimes a good decision.',
        ],
        [
          'Mark confidence level quickly.',
          'Avoid blind attempts.',
          'Review only flagged questions at the end.',
        ],
      ),
    ],
  },
]

export const ceeGuideArticles = ceeGuideSections.flatMap((section) =>
  section.articles.map((article) => ({ ...article, section })),
)

export function getCeeGuideArticle(slug: string[]) {
  return ceeGuideArticles.find(
    (article) => article.slug.join('/') === slug.join('/'),
  )
}

export function getCeeGuideSection(slug: string) {
  return ceeGuideSections.find((section) => section.slug === slug)
}

export const ceeGuideStats = [
  { label: 'Guide sections', value: ceeGuideSections.length.toString() },
  { label: 'Articles', value: ceeGuideArticles.length.toString() },
  { label: 'Study modes', value: 'Syllabus + Strategy' },
]

export const ceeGuideExamPattern = [
  {
    subject: 'Physics',
    questions: 50,
    marks: 50,
    tone: 'Concepts + numericals',
  },
  {
    subject: 'Chemistry',
    questions: 50,
    marks: 50,
    tone: 'Physical + organic + inorganic',
  },
  { subject: 'Botany', questions: 40, marks: 40, tone: 'Recall + diagrams' },
  {
    subject: 'Zoology',
    questions: 40,
    marks: 40,
    tone: 'Physiology + diversity',
  },
  { subject: 'MAT', questions: 20, marks: 20, tone: 'Pattern speed' },
]

export const ceeGuideNegativeMarking = [
  { result: 'Correct answer', effect: '+1 mark' },
  { result: 'Wrong answer', effect: '-0.25 mark' },
  { result: 'Unattempted question', effect: '0 marks' },
  { result: 'Total paper', effect: '200 questions, 200 marks' },
]

export const ceeGuideAccentClasses: Record<string, string> = {
  syllabus: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300',
  'study-strategy':
    'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  'subject-guides':
    'bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300',
  'tips-and-tricks':
    'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
}

export const subjectGuideIcons: Record<string, LucideIcon> = {
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  mat: Brain,
}
