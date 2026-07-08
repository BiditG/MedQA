import { Atom, Brain, Dna, FlaskConical, LucideIcon } from 'lucide-react'
import { ceeMcqSyllabus } from './ceeMcqSyllabus'

export type OneShotSubject = 'Biology' | 'Chemistry' | 'Physics' | 'MAT'
export type OneShotImportance = 'High' | 'Medium' | 'Low'
export type OneShotKeySectionType =
  | 'formula'
  | 'reaction'
  | 'table'
  | 'flow'
  | 'shortcut'

export type OneShotMcq = {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export type OneShotKeyItem = {
  label: string
  value: string
  note?: string
}

export type OneShotNote = {
  id: string
  slug: string
  title: string
  subject: OneShotSubject
  chapter: string
  topic: string
  keywords: string[]
  importance: OneShotImportance
  readingTime: string
  isPremium: boolean
  pdfUrl?: string
  lastUpdated: string
  concept: string
  whyItMatters: string
  mustRemember: string[]
  diagramInWords?: string
  keySection?: {
    title: string
    type: OneShotKeySectionType
    items: OneShotKeyItem[]
  }
  ceeTraps: string[]
  commonMistakes: string[]
  finalRevision: string
  mcqs: OneShotMcq[]
}

export type OneShotSubjectSummary = {
  slug: string
  name: OneShotSubject
  description: string
  icon: LucideIcon
  accentClass: string
}

export const oneShotSubjects: OneShotSubjectSummary[] = [
  {
    slug: 'biology',
    name: 'Biology',
    description:
      'High-yield diagrams, processes, definitions, examples, and CEE traps.',
    icon: Dna,
    accentClass: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20',
  },
  {
    slug: 'chemistry',
    name: 'Chemistry',
    description:
      'Reactions, formulas, trends, exceptions, organic conversions, and numerical tricks.',
    icon: FlaskConical,
    accentClass: 'bg-sky-500/10 text-sky-700 ring-sky-500/20',
  },
  {
    slug: 'physics',
    name: 'Physics',
    description:
      'Formulas, concepts, graphs, numericals, and shortcut revision points.',
    icon: Atom,
    accentClass: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20',
  },
  {
    slug: 'mat',
    name: 'MAT',
    description:
      'Logical reasoning, patterns, series, numerical ability, and quick-solving tricks.',
    icon: Brain,
    accentClass: 'bg-amber-500/10 text-amber-700 ring-amber-500/20',
  },
]

const starterOneShotNotes: OneShotNote[] = [
  {
    id: 'biology-blood-circulation',
    slug: 'blood-circulation',
    title: 'Blood Circulation',
    subject: 'Biology',
    chapter: 'Human Physiology',
    topic: 'Circulatory System',
    keywords: ['heart', 'artery', 'vein', 'cardiac cycle', 'blood vessels'],
    importance: 'High',
    readingTime: '8 min',
    isPremium: false,
    lastUpdated: '2026-06-30',
    concept:
      'Blood circulation means the continuous movement of blood through the heart, blood vessels, lungs, and body tissues. It transports oxygen, nutrients, hormones, and wastes while helping maintain body temperature and internal balance.',
    whyItMatters:
      'CEE commonly tests heart chambers, oxygenated and deoxygenated blood flow, valves, blood vessels, and confusing exceptions like pulmonary artery and pulmonary vein.',
    mustRemember: [
      'Pulmonary artery carries deoxygenated blood from the right ventricle to the lungs.',
      'Pulmonary vein carries oxygenated blood from the lungs to the left atrium.',
      'Left ventricle has the thickest wall because it pumps blood to the whole body.',
      'SA node is called the pacemaker of the heart.',
      'Valves prevent backflow of blood.',
    ],
    diagramInWords:
      'Right atrium -> Right ventricle -> Pulmonary artery -> Lungs -> Pulmonary vein -> Left atrium -> Left ventricle -> Aorta -> Body',
    keySection: {
      title: 'High-yield circulation table',
      type: 'table',
      items: [
        {
          label: 'Right atrium',
          value: 'Receives deoxygenated blood from vena cava.',
        },
        {
          label: 'Right ventricle',
          value: 'Pumps deoxygenated blood to lungs through pulmonary artery.',
        },
        {
          label: 'Left atrium',
          value: 'Receives oxygenated blood from pulmonary veins.',
        },
        {
          label: 'Left ventricle',
          value: 'Pumps oxygenated blood to body through aorta.',
        },
      ],
    },
    ceeTraps: [
      'Do not assume every artery carries oxygenated blood.',
      'Pulmonary artery is an artery but carries deoxygenated blood.',
      'Pulmonary vein is a vein but carries oxygenated blood.',
      'The thickest chamber wall belongs to the left ventricle, not the right ventricle.',
    ],
    commonMistakes: [
      'Mixing up systole and diastole.',
      'Forgetting that the right side of the heart handles deoxygenated blood.',
      'Writing pulmonary artery as oxygenated because it is an artery.',
    ],
    finalRevision:
      'Blood moves from right heart to lungs for oxygenation, then from left heart to body through the aorta. Pulmonary artery carries deoxygenated blood, pulmonary vein carries oxygenated blood, left ventricle has the thickest wall, and SA node controls heartbeat.',
    mcqs: [
      {
        id: 'blood-1',
        question: 'Which blood vessel carries deoxygenated blood to the lungs?',
        optionA: 'Aorta',
        optionB: 'Pulmonary artery',
        optionC: 'Pulmonary vein',
        optionD: 'Vena cava',
        answer: 'B',
        explanation:
          'Pulmonary artery carries deoxygenated blood from the right ventricle to the lungs.',
      },
      {
        id: 'blood-2',
        question: 'Which chamber has the thickest muscular wall?',
        optionA: 'Right atrium',
        optionB: 'Right ventricle',
        optionC: 'Left atrium',
        optionD: 'Left ventricle',
        answer: 'D',
        explanation:
          'The left ventricle pumps blood to the whole body, so its wall is thickest.',
      },
      {
        id: 'blood-3',
        question: 'The pacemaker of the heart is the:',
        optionA: 'AV node',
        optionB: 'SA node',
        optionC: 'Bundle of His',
        optionD: 'Purkinje fibers',
        answer: 'B',
        explanation:
          'The SA node initiates the heartbeat and is the pacemaker.',
      },
      {
        id: 'blood-4',
        question: 'Pulmonary vein carries blood from:',
        optionA: 'Heart to lungs',
        optionB: 'Lungs to heart',
        optionC: 'Body to heart',
        optionD: 'Heart to body',
        answer: 'B',
        explanation:
          'Pulmonary veins bring oxygenated blood from lungs to the left atrium.',
      },
    ],
  },
  {
    id: 'chemistry-mole-concept',
    slug: 'mole-concept',
    title: 'Mole Concept',
    subject: 'Chemistry',
    chapter: 'Stoichiometry',
    topic: 'Mole and Equivalent Concept',
    keywords: ['avogadro', 'molar mass', 'stoichiometry', 'limiting reagent'],
    importance: 'High',
    readingTime: '9 min',
    isPremium: false,
    lastUpdated: '2026-06-30',
    concept:
      'A mole is a counting unit used in Chemistry. One mole contains 6.022 x 10^23 particles. It connects mass, number of particles, gas volume, and chemical equations.',
    whyItMatters:
      'CEE frequently asks direct mole conversions, empirical formula, percentage composition, gas volume at STP, and limiting reagent questions.',
    mustRemember: [
      '1 mole = 6.022 x 10^23 particles.',
      'Moles = given mass / molar mass.',
      'At STP, 1 mole of any ideal gas occupies 22.4 L.',
      'Use balanced equations before comparing mole ratios.',
    ],
    diagramInWords:
      'Mass <-> Moles <-> Particles. Use molar mass between mass and moles; use Avogadro number between moles and particles.',
    keySection: {
      title: 'Mole conversion formulas',
      type: 'formula',
      items: [
        { label: 'Moles from mass', value: 'n = w / M' },
        { label: 'Particles', value: 'N = n x NA' },
        { label: 'Gas at STP', value: 'n = V / 22.4' },
        { label: 'Molarity', value: 'M = moles of solute / volume in L' },
      ],
    },
    ceeTraps: [
      'Do not use coefficients from an unbalanced equation.',
      'Use volume in liters for molarity.',
      'Molecular mass and equivalent mass are not always the same.',
    ],
    commonMistakes: [
      'Forgetting units while converting mL to L.',
      'Using atomic mass instead of molecular mass.',
      'Solving limiting reagent questions by mass instead of mole ratio.',
    ],
    finalRevision:
      'Convert everything to moles, use the balanced equation, then convert to the required unit. Remember NA for particles and 22.4 L for one mole gas at STP.',
    mcqs: [
      {
        id: 'mole-1',
        question: 'How many molecules are present in 1 mole of CO2?',
        optionA: '6.022 x 10^20',
        optionB: '6.022 x 10^21',
        optionC: '6.022 x 10^23',
        optionD: '22.4 x 10^23',
        answer: 'C',
        explanation:
          'One mole of any substance contains Avogadro number of particles.',
      },
      {
        id: 'mole-2',
        question: 'At STP, 2 moles of an ideal gas occupy:',
        optionA: '11.2 L',
        optionB: '22.4 L',
        optionC: '44.8 L',
        optionD: '6.022 L',
        answer: 'C',
        explanation: '1 mole gas = 22.4 L at STP, so 2 moles = 44.8 L.',
      },
      {
        id: 'mole-3',
        question: 'The first step in stoichiometric calculation is usually to:',
        optionA: 'Balance the equation',
        optionB: 'Find pH',
        optionC: 'Write electronic configuration',
        optionD: 'Calculate density',
        answer: 'A',
        explanation:
          'Mole ratios are taken from the balanced chemical equation.',
      },
    ],
  },
  {
    id: 'physics-newtons-laws',
    slug: 'newtons-laws-of-motion',
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    chapter: 'Mechanics',
    topic: 'Laws of Motion',
    keywords: ['force', 'inertia', 'acceleration', 'momentum', 'friction'],
    importance: 'High',
    readingTime: '10 min',
    isPremium: false,
    lastUpdated: '2026-06-30',
    concept:
      "Newton's laws explain how force changes the state of motion of a body. They connect inertia, acceleration, action-reaction pairs, and momentum change.",
    whyItMatters:
      'CEE tests free-body diagrams, friction, pulley systems, apparent weight, elevators, and direct use of F = ma in numericals.',
    mustRemember: [
      'First law defines inertia.',
      'Second law gives F = ma for constant mass.',
      'Third law forces are equal, opposite, and act on different bodies.',
      'Net force decides acceleration, not a single force alone.',
    ],
    diagramInWords:
      'Identify body -> Draw all forces -> Resolve components -> Find net force -> Apply F = ma -> Solve acceleration or tension.',
    keySection: {
      title: 'Core formulas',
      type: 'formula',
      items: [
        { label: 'Force', value: 'F = ma', note: 'Unit: newton (N)' },
        {
          label: 'Momentum',
          value: 'p = mv',
          note: 'Change in momentum creates force.',
        },
        {
          label: 'Impulse',
          value: 'J = F delta t = delta p',
          note: 'Useful in collision questions.',
        },
        {
          label: 'Friction limit',
          value: 'f(max) = mu N',
          note: 'Static friction adjusts up to this value.',
        },
      ],
    },
    ceeTraps: [
      'Action and reaction never cancel because they act on different bodies.',
      'Friction does not always equal mu N; static friction adjusts as needed.',
      'Normal reaction is not always equal to mg.',
    ],
    commonMistakes: [
      'Drawing forces on multiple bodies in one free-body diagram.',
      'Using mass instead of weight in force equations.',
      'Forgetting to resolve forces on inclined planes.',
    ],
    finalRevision:
      'Draw a clean free-body diagram first. Use net force, not individual force, in F = ma. Action-reaction forces act on different bodies, and static friction adjusts up to its limiting value.',
    mcqs: [
      {
        id: 'newton-1',
        question: 'Newton second law is represented by:',
        optionA: 'F = ma',
        optionB: 'v = u + at',
        optionC: 'p = m/v',
        optionD: 'W = mg/h',
        answer: 'A',
        explanation:
          'For constant mass, net force equals mass times acceleration.',
      },
      {
        id: 'newton-2',
        question: 'Action and reaction forces:',
        optionA: 'Act on the same body',
        optionB: 'Act on different bodies',
        optionC: 'Are always vertical',
        optionD: 'Cancel motion in every case',
        answer: 'B',
        explanation:
          'They are equal and opposite but act on different bodies, so they do not cancel each other on one body.',
      },
      {
        id: 'newton-3',
        question: 'Inertia depends mainly on:',
        optionA: 'Velocity',
        optionB: 'Acceleration',
        optionC: 'Mass',
        optionD: 'Force',
        answer: 'C',
        explanation: 'Mass measures inertia.',
      },
    ],
  },
  {
    id: 'mat-number-series',
    slug: 'number-series',
    title: 'Number Series',
    subject: 'MAT',
    chapter: 'Logical Reasoning',
    topic: 'Series and Patterns',
    keywords: ['series', 'pattern', 'reasoning', 'difference', 'square'],
    importance: 'Medium',
    readingTime: '7 min',
    isPremium: false,
    lastUpdated: '2026-06-30',
    concept:
      'Number series questions ask you to identify the rule followed by a sequence. The rule may involve addition, subtraction, multiplication, division, squares, cubes, alternating patterns, or mixed operations.',
    whyItMatters:
      'MAT questions reward speed. Number series is usually solvable quickly if you test common patterns in a fixed order.',
    mustRemember: [
      'Check common difference first.',
      'If differences are changing, check second differences.',
      'Look for multiplication, squares, cubes, and alternating terms.',
      'Do not spend too long on one series during the exam.',
    ],
    diagramInWords:
      'Given series -> Check difference -> Check second difference -> Check multiplication/division -> Check squares/cubes -> Check alternate terms.',
    keySection: {
      title: 'Fast pattern checklist',
      type: 'shortcut',
      items: [
        { label: 'Arithmetic', value: 'Same number added or subtracted.' },
        { label: 'Geometric', value: 'Same number multiplied or divided.' },
        { label: 'Square/Cube', value: 'Terms near 1, 4, 9, 16 or 1, 8, 27.' },
        {
          label: 'Alternate',
          value: 'Odd and even positions follow separate rules.',
        },
      ],
    },
    ceeTraps: [
      'A pattern that works for two gaps may fail for the full series.',
      'Alternate series are easy to miss under time pressure.',
      'Do not force an advanced pattern before checking simple differences.',
    ],
    commonMistakes: [
      'Checking only addition patterns.',
      'Ignoring negative differences.',
      'Spending too much time on one difficult sequence.',
    ],
    finalRevision:
      'Use a fixed pattern order: difference, second difference, multiplication, square or cube, alternate terms. If no pattern appears quickly, mark it and return later.',
    mcqs: [
      {
        id: 'series-1',
        question: 'Find the next number: 2, 4, 8, 16, ?',
        optionA: '20',
        optionB: '24',
        optionC: '30',
        optionD: '32',
        answer: 'D',
        explanation: 'Each term is multiplied by 2.',
      },
      {
        id: 'series-2',
        question: 'Find the next number: 3, 6, 11, 18, ?',
        optionA: '25',
        optionB: '27',
        optionC: '29',
        optionD: '31',
        answer: 'B',
        explanation: 'Differences are 3, 5, 7, so next difference is 9.',
      },
      {
        id: 'series-3',
        question: 'Which pattern is checked first for speed?',
        optionA: 'Cubic equation',
        optionB: 'Common difference',
        optionC: 'Trigonometry',
        optionD: 'Logarithm',
        answer: 'B',
        explanation: 'Common difference is the fastest first check.',
      },
    ],
  },
]

export function subjectToSlug(subject: OneShotSubject) {
  return subject.toLowerCase().replace(/\s+/g, '-')
}

export function getOneShotSubject(slug: string) {
  return oneShotSubjects.find((subject) => subject.slug === slug)
}

export function getOneShotNotesBySubject(subjectSlug: string) {
  return oneShotNotes.filter(
    (note) => subjectToSlug(note.subject) === subjectSlug,
  )
}

export function getOneShotNote(subjectSlug: string, noteSlug: string) {
  return oneShotNotes.find(
    (note) =>
      subjectToSlug(note.subject) === subjectSlug && note.slug === noteSlug,
  )
}

export function getRelatedOneShotNotes(note: OneShotNote, limit = 3) {
  return oneShotNotes
    .filter((item) => item.id !== note.id && item.subject === note.subject)
    .slice(0, limit)
}

export function getSubjectNoteCount(subject: OneShotSubject) {
  return oneShotNotes.filter((note) => note.subject === subject).length
}

function buildSyllabusOneShotNotes(existingNotes: OneShotNote[]) {
  const existingKeys = new Set(
    existingNotes.map((note) => `${subjectToSlug(note.subject)}/${note.slug}`),
  )
  const notes: OneShotNote[] = []

  for (const subjectBlock of ceeMcqSyllabus) {
    const subject = mapSyllabusSubject(subjectBlock.name)

    for (const chapter of subjectBlock.topics) {
      for (const subtopic of chapter.subtopics) {
        const slug = slugify(subtopic)
        const key = `${subjectToSlug(subject)}/${slug}`

        if (existingKeys.has(key)) continue
        existingKeys.add(key)

        notes.push(
          createSyllabusNote({
            title: subtopic,
            subject,
            sourceSubject: subjectBlock.name,
            chapter: chapter.title,
            summary: subjectBlock.summary,
          }),
        )
      }
    }
  }

  return notes
}

function createSyllabusNote({
  title,
  subject,
  sourceSubject,
  chapter,
  summary,
}: {
  title: string
  subject: OneShotSubject
  sourceSubject: string
  chapter: string
  summary: string
}): OneShotNote {
  const slug = slugify(title)
  const importance = getGeneratedImportance(title, chapter)
  const keyType = getGeneratedKeyType(subject, chapter)

  return {
    id: `${subjectToSlug(subject)}-${slug}`,
    slug,
    title,
    subject,
    chapter:
      sourceSubject === subject ? chapter : `${sourceSubject}: ${chapter}`,
    topic: chapter,
    keywords: [title, chapter, sourceSubject, subject, summary],
    importance,
    readingTime: importance === 'High' ? '7 min' : '5 min',
    isPremium: false,
    lastUpdated: '2026-07-06',
    concept: getGeneratedConcept(title, subject, chapter),
    whyItMatters: getGeneratedWhyItMatters(title, subject, chapter),
    mustRemember: getGeneratedMustRemember(title, subject, chapter),
    diagramInWords: getGeneratedDiagram(title, subject),
    keySection: {
      title: getGeneratedKeySectionTitle(subject),
      type: keyType,
      items: getGeneratedKeyItems(title, subject, chapter, keyType),
    },
    ceeTraps: getGeneratedTraps(title, subject),
    commonMistakes: getGeneratedMistakes(title, subject),
    finalRevision: getGeneratedFinalRevision(title, subject, chapter),
    mcqs: getGeneratedMcqs(title, subject, chapter),
  }
}

function mapSyllabusSubject(subject: string): OneShotSubject {
  if (subject === 'Botany' || subject === 'Zoology') return 'Biology'
  if (subject === 'Chemistry') return 'Chemistry'
  if (subject === 'Physics') return 'Physics'
  return 'MAT'
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getGeneratedImportance(
  title: string,
  chapter: string,
): OneShotImportance {
  const value = `${title} ${chapter}`.toLowerCase()
  const highYieldWords = [
    'kinematics',
    'dynamics',
    'thermodynamics',
    'electric',
    'capacitor',
    'bonding',
    'equilibrium',
    'stoichiometry',
    'organic',
    'genetics',
    'cell',
    'photosynthesis',
    'respiration',
    'circulatory',
    'endocrinology',
    'immunity',
    'number series',
    'coding',
    'direction',
    'figure',
  ]

  if (highYieldWords.some((word) => value.includes(word))) return 'High'
  if (value.includes('history') || value.includes('recent trends')) return 'Low'
  return 'Medium'
}

function getGeneratedKeyType(
  subject: OneShotSubject,
  chapter: string,
): OneShotKeySectionType {
  if (subject === 'Physics') return 'formula'
  if (subject === 'MAT') return 'shortcut'
  if (subject === 'Chemistry') {
    return chapter.toLowerCase().includes('organic') ? 'reaction' : 'table'
  }
  return 'flow'
}

type GeneratedProfile = {
  concept: string
  whyItMatters: string
  mustRemember: string[]
  diagram: string
  keyItems: OneShotKeyItem[]
  traps: string[]
  mistakes: string[]
  finalRevision: string
  mcqs: OneShotMcq[]
}

const physicsProfiles: Array<{
  match: string[]
  formulas: OneShotKeyItem[]
  remember: string[]
  traps: string[]
}> = [
  {
    match: ['vectors', 'scalars', 'vector'],
    formulas: [
      { label: 'Resolution', value: 'Ax = A cos theta, Ay = A sin theta' },
      { label: 'Resultant', value: 'R = sqrt(A^2 + B^2 + 2AB cos theta)' },
      { label: 'Dot product', value: 'A.B = AB cos theta' },
      { label: 'Cross product', value: '|A x B| = AB sin theta' },
    ],
    remember: [
      'Scalars have magnitude only; vectors have magnitude and direction.',
      'Resolve vectors into perpendicular components before calculation.',
      'Dot product gives a scalar; cross product gives a vector.',
      'Use the angle between the two vectors, not the angle with an axis unless specified.',
    ],
    traps: [
      'Adding vector magnitudes directly when directions differ.',
      'Using sin instead of cos in dot product questions.',
      'Forgetting that displacement and distance are different.',
    ],
  },
  {
    match: ['kinematics', 'motion', 'velocity', 'acceleration'],
    formulas: [
      { label: 'Velocity-time', value: 'v = u + at' },
      { label: 'Displacement', value: 's = ut + 1/2 at^2' },
      { label: 'No-time equation', value: 'v^2 = u^2 + 2as' },
      {
        label: 'Graph focus',
        value:
          'Slope of x-t graph = velocity; slope of v-t graph = acceleration',
      },
    ],
    remember: [
      'Use equations of motion only for uniform acceleration.',
      'Area under a velocity-time graph gives displacement.',
      'Free fall near Earth uses a = g downward.',
      'Average speed and average velocity are not always equal.',
    ],
    traps: [
      'Using distance where displacement is asked.',
      'Ignoring sign convention in vertical motion.',
      'Applying constant-acceleration formulas to non-uniform motion.',
    ],
  },
  {
    match: ['dynamics', 'force', 'newton', 'friction'],
    formulas: [
      { label: 'Newton second law', value: 'Fnet = ma' },
      { label: 'Weight', value: 'W = mg' },
      { label: 'Static friction limit', value: 'fs <= mu_s N' },
      { label: 'Kinetic friction', value: 'fk = mu_k N' },
    ],
    remember: [
      'Draw a separate free-body diagram for each body.',
      'Action-reaction forces act on different bodies.',
      'Static friction adjusts up to a maximum value.',
      'Net force, not the largest force, determines acceleration.',
    ],
    traps: [
      'Assuming normal reaction is always mg.',
      'Making action and reaction cancel on the same body.',
      'Using kinetic friction before motion actually starts.',
    ],
  },
  {
    match: ['work', 'energy', 'power'],
    formulas: [
      { label: 'Work', value: 'W = Fs cos theta' },
      { label: 'Kinetic energy', value: 'KE = 1/2 mv^2' },
      { label: 'Potential energy', value: 'PE = mgh' },
      { label: 'Power', value: 'P = W/t = Fv' },
    ],
    remember: [
      'Work depends on the component of force along displacement.',
      'Work-energy theorem: net work equals change in kinetic energy.',
      'Conservative-force problems often use energy conservation.',
      'Power measures rate of doing work.',
    ],
    traps: [
      'Forgetting cos theta in work done.',
      'Using speed instead of velocity direction where work sign matters.',
      'Confusing power with energy.',
    ],
  },
  {
    match: ['circular', 'rotational', 'rigid body'],
    formulas: [
      { label: 'Centripetal acceleration', value: 'a = v^2/r = omega^2 r' },
      { label: 'Centripetal force', value: 'F = mv^2/r' },
      { label: 'Torque', value: 'tau = rF sin theta' },
      { label: 'Angular momentum', value: 'L = I omega' },
    ],
    remember: [
      'Centripetal force is not a new force; it is the net inward force.',
      'Angular quantities mirror linear quantities: s = r theta and v = r omega.',
      'Torque depends on perpendicular distance from the axis.',
      'Moment of inertia depends on mass distribution.',
    ],
    traps: [
      'Calling centrifugal force the real inward force in inertial frames.',
      'Using radius in cm without converting to meters.',
      'Forgetting direction in torque questions.',
    ],
  },
  {
    match: ['gravitation'],
    formulas: [
      { label: 'Newton gravitation', value: 'F = Gm1m2/r^2' },
      { label: 'Acceleration due to gravity', value: 'g = GM/R^2' },
      { label: 'Potential energy', value: 'U = -GMm/r' },
      { label: 'Escape velocity', value: 've = sqrt(2GM/R)' },
    ],
    remember: [
      'Gravitational force follows inverse square law.',
      'g decreases with height and depth.',
      'Orbital motion is maintained by gravitational centripetal force.',
      'Escape velocity is independent of mass of escaping body.',
    ],
    traps: [
      'Forgetting r is measured from the center of Earth.',
      'Using surface g formula at large height without correction.',
      'Thinking mass changes when weight changes.',
    ],
  },
  {
    match: ['heat', 'thermal', 'thermodynamics', 'gas'],
    formulas: [
      { label: 'Heat', value: 'Q = mc delta T' },
      { label: 'Latent heat', value: 'Q = mL' },
      { label: 'Ideal gas', value: 'PV = nRT' },
      { label: 'First law', value: 'Delta Q = Delta U + W' },
    ],
    remember: [
      'Temperature measures hotness; heat is energy in transfer.',
      'Specific heat and latent heat are different concepts.',
      'Internal energy of ideal gas depends on temperature.',
      'In isothermal ideal-gas process, change in internal energy is zero.',
    ],
    traps: [
      'Mixing Celsius change with Kelvin value in gas equations.',
      'Confusing heat supplied with work done.',
      'Ignoring phase change when temperature remains constant.',
    ],
  },
  {
    match: ['waves', 'sound', 'oscillation', 'shm', 'stationary'],
    formulas: [
      { label: 'Wave speed', value: 'v = f lambda' },
      { label: 'SHM displacement', value: 'x = A sin omega t' },
      { label: 'SHM acceleration', value: 'a = -omega^2 x' },
      { label: 'Time period', value: 'T = 1/f' },
    ],
    remember: [
      'In SHM, acceleration is proportional and opposite to displacement.',
      'Wave speed depends on medium; frequency is fixed by source.',
      'Stationary waves have nodes and antinodes.',
      'Resonance occurs when driving frequency matches natural frequency.',
    ],
    traps: [
      'Confusing wave speed with particle speed.',
      'Interchanging node and antinode.',
      'Using angular frequency omega as ordinary frequency f.',
    ],
  },
  {
    match: ['reflection', 'refraction', 'dispersion', 'optics', 'lens'],
    formulas: [
      { label: 'Snell law', value: 'n1 sin i = n2 sin r' },
      { label: 'Lens formula', value: '1/f = 1/v - 1/u' },
      { label: 'Magnification', value: 'm = v/u = image height/object height' },
      { label: 'Critical angle', value: 'sin C = 1/n' },
    ],
    remember: [
      'Use sign convention consistently in mirror and lens questions.',
      'Refraction changes speed and wavelength, not frequency.',
      'Total internal reflection needs denser to rarer medium and angle greater than critical angle.',
      'Power of lens is P = 1/f in meter.',
    ],
    traps: [
      'Using focal length in cm for power without converting to meter.',
      'Forgetting conditions for total internal reflection.',
      'Changing frequency during refraction.',
    ],
  },
  {
    match: [
      'electric',
      'ohm',
      'circuit',
      'capacitor',
      'electrostatic',
      'charge',
    ],
    formulas: [
      { label: 'Coulomb law', value: 'F = kq1q2/r^2' },
      { label: 'Electric field', value: 'E = F/q' },
      { label: 'Ohm law', value: 'V = IR' },
      { label: 'Capacitance', value: 'C = Q/V' },
    ],
    remember: [
      'Electric field direction is direction of force on positive test charge.',
      'Series resistance adds; parallel conductance adds.',
      'Capacitors in parallel add directly; in series reciprocals add.',
      'Potential is scalar; electric field is vector.',
    ],
    traps: [
      'Mixing series and parallel rules for capacitors.',
      'Forgetting square dependence in Coulomb law.',
      'Treating potential like a vector.',
    ],
  },
  {
    match: ['magnetic', 'magnetism', 'induction', 'alternating current'],
    formulas: [
      { label: 'Force on charge', value: 'F = qvB sin theta' },
      { label: 'Force on conductor', value: 'F = BIL sin theta' },
      { label: 'Faraday law', value: 'emf = -dPhi/dt' },
      { label: 'AC rms', value: 'Vrms = V0/sqrt(2)' },
    ],
    remember: [
      'Magnetic force is maximum when motion is perpendicular to field.',
      'Lenz law gives the direction opposing change in flux.',
      'Changing flux, not just flux, induces emf.',
      'RMS values are used for AC power calculations.',
    ],
    traps: [
      'Forgetting sin theta in magnetic force.',
      'Ignoring the negative sign meaning in Lenz law.',
      'Using peak AC value as RMS value.',
    ],
  },
  {
    match: [
      'photoelectric',
      'nuclear',
      'radioactivity',
      'semiconductor',
      'logic',
      'modern',
      'x-rays',
    ],
    formulas: [
      { label: 'Photon energy', value: 'E = hf = hc/lambda' },
      { label: 'Photoelectric equation', value: 'hf = phi + KEmax' },
      { label: 'Half-life', value: 'N = N0(1/2)^(t/T)' },
      {
        label: 'Logic gates',
        value: 'Know truth tables for AND, OR, NOT, NAND, NOR',
      },
    ],
    remember: [
      'Photoelectric emission depends on frequency crossing threshold frequency.',
      'Intensity affects number of emitted electrons, not maximum kinetic energy.',
      'Radioactive decay is spontaneous and follows exponential law.',
      'Diode conducts mainly in forward bias.',
    ],
    traps: [
      'Saying higher intensity increases photoelectron energy.',
      'Confusing atomic number and mass number changes in decay.',
      'Mixing forward and reverse bias of diode.',
    ],
  },
]

const chemistryProfiles: Array<{
  match: string[]
  items: OneShotKeyItem[]
  remember: string[]
  traps: string[]
}> = [
  {
    match: ['stoichiometry', 'basic concepts', 'mole', 'volumetric'],
    items: [
      { label: 'Mole', value: 'n = mass / molar mass' },
      { label: 'Particles', value: 'Number = n x 6.022 x 10^23' },
      { label: 'Gas at STP', value: '1 mol gas = 22.4 L' },
      {
        label: 'Titration',
        value:
          'Use mole ratio from balanced equation; for simple acid-base, N1V1 = N2V2',
      },
    ],
    remember: [
      'Balance the equation before using coefficients.',
      'Convert mass, volume, and particles into moles first.',
      'Limiting reagent is decided by mole ratio, not by larger mass.',
      'For molarity, volume must be in liters.',
    ],
    traps: [
      'Using atomic mass when molecular mass is needed.',
      'Comparing grams directly in limiting reagent questions.',
      'Forgetting dilution changes concentration but not moles of solute.',
    ],
  },
  {
    match: ['atomic', 'nuclear'],
    items: [
      {
        label: 'Quantum numbers',
        value: 'n, l, m, s describe shell, subshell, orbital, spin.',
      },
      {
        label: 'Aufbau rule',
        value: 'Electrons fill lower energy orbitals first.',
      },
      {
        label: 'Hund rule',
        value: 'Degenerate orbitals fill singly before pairing.',
      },
      {
        label: 'Radioactivity',
        value:
          'Alpha lowers mass by 4 and atomic number by 2; beta changes atomic number by 1.',
      },
    ],
    remember: [
      'Electronic configuration explains valency, magnetism, and periodic position.',
      's, p, d, f subshell capacities are 2, 6, 10, 14.',
      'Half-filled and fully filled subshells are relatively stable.',
      'Isotopes have same atomic number but different mass number.',
    ],
    traps: [
      'Filling 3d before 4s in the initial Aufbau order.',
      'Confusing isotope with isobar.',
      'Forgetting exceptional configurations such as Cr and Cu.',
    ],
  },
  {
    match: ['periodicity', 'classification'],
    items: [
      {
        label: 'Atomic radius',
        value: 'Decreases across a period, increases down a group.',
      },
      {
        label: 'Ionization energy',
        value: 'Generally increases across, decreases down.',
      },
      {
        label: 'Electronegativity',
        value: 'Increases across, decreases down; fluorine is highest.',
      },
      {
        label: 'Metallic character',
        value: 'Decreases across, increases down.',
      },
    ],
    remember: [
      'Effective nuclear charge controls many periodic trends.',
      'Be-B and N-O exceptions are common in ionization energy.',
      'Cations are smaller than parent atoms; anions are larger.',
      'Diagonal relationship can create similar properties.',
    ],
    traps: [
      'Forgetting common trend exceptions.',
      'Comparing ions without considering electron count.',
      'Saying atomic size increases across a period.',
    ],
  },
  {
    match: ['bonding', 'shape', 'molecules'],
    items: [
      {
        label: 'Ionic bond',
        value:
          'Electron transfer, high lattice energy, common in metal + non-metal.',
      },
      {
        label: 'Covalent bond',
        value: 'Electron sharing; shape predicted by VSEPR.',
      },
      {
        label: 'Hybridization',
        value: 'sp linear, sp2 trigonal planar, sp3 tetrahedral.',
      },
      {
        label: 'Polarity',
        value: 'Depends on bond polarity and molecular geometry.',
      },
    ],
    remember: [
      'Lone pairs repel more strongly than bond pairs.',
      'Resonance stabilizes molecules and ions.',
      'Sigma bond forms by head-on overlap; pi bond by sidewise overlap.',
      'Shape and geometry are not always identical when lone pairs exist.',
    ],
    traps: [
      'Ignoring lone pairs while predicting shape.',
      'Calling every polar bond molecule polar.',
      'Confusing sigma and pi bond counts in multiple bonds.',
    ],
  },
  {
    match: ['equilibrium', 'ionic', 'buffer'],
    items: [
      {
        label: 'Equilibrium constant',
        value: 'K depends only on temperature.',
      },
      { label: 'Le Chatelier', value: 'System opposes imposed change.' },
      { label: 'pH', value: 'pH = -log[H+]' },
      {
        label: 'Buffer',
        value: 'Weak acid/base with conjugate salt resists pH change.',
      },
    ],
    remember: [
      'Catalyst changes rate, not equilibrium position.',
      'Only gases and aqueous species appear in K expression.',
      'Common ion suppresses ionization of weak electrolyte.',
      'Solubility product predicts precipitation.',
    ],
    traps: [
      'Including pure solids and liquids in K expression.',
      'Thinking catalyst increases yield.',
      'Forgetting temperature is the only factor that changes K.',
    ],
  },
  {
    match: ['redox', 'electrochemistry'],
    items: [
      {
        label: 'Oxidation',
        value: 'Loss of electrons or increase in oxidation number.',
      },
      {
        label: 'Reduction',
        value: 'Gain of electrons or decrease in oxidation number.',
      },
      { label: 'Cell emf', value: 'Ecell = Ecathode - Eanode' },
      { label: 'Faraday law', value: 'Mass deposited = ZIt' },
    ],
    remember: [
      'Anode is oxidation; cathode is reduction.',
      'In galvanic cell, anode is negative and cathode is positive.',
      'Stronger reducing agent has greater tendency to lose electrons.',
      'Balance redox by oxidation number or ion-electron method.',
    ],
    traps: [
      'Mixing electrode signs between galvanic and electrolytic cells.',
      'Forgetting to balance charge in redox reactions.',
      'Using wrong direction for electron flow.',
    ],
  },
  {
    match: [
      'thermodynamics',
      'kinetics',
      'surface',
      'solid',
      'solutions',
      'states',
    ],
    items: [
      { label: 'Gibbs energy', value: 'Delta G = Delta H - T Delta S' },
      { label: 'Rate law', value: 'Rate = k[A]^m[B]^n' },
      {
        label: 'Raoult law',
        value: 'Relative lowering of vapour pressure relates to mole fraction.',
      },
      {
        label: 'Crystal defects',
        value: 'Schottky lowers density; Frenkel keeps density nearly same.',
      },
    ],
    remember: [
      'Negative Delta G means spontaneous under given conditions.',
      'Order of reaction comes from experiment, not balanced equation.',
      'Catalyst lowers activation energy.',
      'Colligative properties depend on number of solute particles.',
    ],
    traps: [
      'Confusing molecularity and order.',
      'Assuming every exothermic reaction is spontaneous at all temperatures.',
      'Forgetting van’t Hoff factor for electrolytes.',
    ],
  },
  {
    match: [
      'hydrocarbon',
      'haloalkane',
      'alcohol',
      'phenol',
      'ether',
      'aldehyde',
      'ketone',
      'carboxylic',
      'amine',
      'nitro',
      'aromatic',
      'organic',
      'organometallic',
    ],
    items: [
      {
        label: 'Substitution',
        value: 'Common in alkanes, haloalkanes, and aromatic systems.',
      },
      { label: 'Addition', value: 'Common in alkenes and alkynes.' },
      {
        label: 'Oxidation',
        value:
          'Alcohol -> aldehyde/ketone -> acid depending on structure and reagent.',
      },
      {
        label: 'Named tests',
        value:
          'Tollens/Fehling for aldehyde, iodoform for CH3CO- or CH3CH(OH)- group.',
      },
    ],
    remember: [
      'Learn reactions by functional-group conversion.',
      'Markovnikov and anti-Markovnikov additions are frequent traps.',
      'Phenol is more acidic than alcohol due to resonance stabilization of phenoxide.',
      'Aromatic substitution is directed by activating/deactivating groups.',
    ],
    traps: [
      'Ignoring reagent and condition.',
      'Confusing aldehyde and ketone tests.',
      'Forgetting directing effect in benzene derivatives.',
    ],
  },
  {
    match: [
      'non-metals',
      'hydrogen',
      'oxides',
      'halogen',
      'sulfur',
      'metals',
      'metallurgical',
      'alkali',
      'transition',
      'coordination',
      'bio-inorganic',
    ],
    items: [
      {
        label: 's-block',
        value: 'Highly reactive metals; reactivity increases down group.',
      },
      {
        label: 'p-block',
        value: 'Shows variable oxidation states and inert pair effect.',
      },
      {
        label: 'd-block',
        value: 'Colored ions, variable oxidation states, complex formation.',
      },
      {
        label: 'Coordination',
        value:
          'Know ligand, coordination number, oxidation state, and IUPAC naming.',
      },
    ],
    remember: [
      'Inorganic Chemistry is best revised with comparison tables.',
      'Colors, ores, catalysts, and oxidation states are common direct MCQs.',
      'Transition metals show variable valency due to d electrons.',
      'Ligands donate electron pairs to central metal ion.',
    ],
    traps: [
      'Mixing group trends between s-block and p-block.',
      'Forgetting inert pair effect in heavier p-block elements.',
      'Miscounting oxidation state in coordination compounds.',
    ],
  },
  {
    match: [
      'analytical',
      'test',
      'radicals',
      'lassaigne',
      'biomolecule',
      'titration',
      'indicator',
      'separation',
    ],
    items: [
      {
        label: 'Lassaigne test',
        value: 'Detects N, S, halogens after sodium fusion.',
      },
      {
        label: 'Unsaturation',
        value: 'Decolorization of bromine water or Baeyer reagent.',
      },
      {
        label: 'Acid radicals',
        value: 'Carbonate gives CO2 with dilute acid; sulfate gives BaSO4.',
      },
      {
        label: 'Indicator choice',
        value: 'Depends on acid-base strength and pH range of endpoint.',
      },
    ],
    remember: [
      'Tests depend on observable change: color, precipitate, gas, or smell.',
      'Write reagent and observation together.',
      'Confirmatory tests are more important than vague preliminary clues.',
      'Functional group tests are high-yield for quick MCQs.',
    ],
    traps: [
      'Writing reagent without observation.',
      'Confusing white precipitates in inorganic tests.',
      'Using one test as proof when confirmatory test is needed.',
    ],
  },
]

const biologyProfiles: Array<{
  match: string[]
  items: OneShotKeyItem[]
  remember: string[]
  traps: string[]
}> = [
  {
    match: ['carbohydrate', 'lipid', 'protein', 'enzyme', 'mineral'],
    items: [
      {
        label: 'Carbohydrates',
        value: 'Immediate energy and structural roles such as cellulose.',
      },
      {
        label: 'Lipids',
        value: 'Energy storage, membranes, hormones, insulation.',
      },
      {
        label: 'Proteins',
        value: 'Enzymes, transport, structure, antibodies, movement.',
      },
      {
        label: 'Enzymes',
        value:
          'Biocatalysts; affected by temperature, pH, and substrate concentration.',
      },
    ],
    remember: [
      'Enzymes are specific and lower activation energy.',
      'Proteins are polymers of amino acids.',
      'Starch and glycogen store carbohydrate; cellulose is structural.',
      'Deficiency symptoms for minerals are frequent MCQs.',
    ],
    traps: [
      'Calling enzymes consumed in reaction.',
      'Mixing starch, glycogen, and cellulose roles.',
      'Forgetting denaturation at high temperature or unsuitable pH.',
    ],
  },
  {
    match: [
      'classification',
      'taxonomy',
      'monera',
      'virus',
      'fungi',
      'algae',
      'bryophyte',
      'pteridophyte',
      'gymnosperm',
      'angiosperm',
      'plant groups',
    ],
    items: [
      {
        label: 'Hierarchy',
        value:
          'Kingdom -> Phylum/Division -> Class -> Order -> Family -> Genus -> Species.',
      },
      {
        label: 'Binomial name',
        value: 'Genus + species; Genus capitalized, species lowercase.',
      },
      {
        label: 'Plant evolution',
        value:
          'Algae -> Bryophytes -> Pteridophytes -> Gymnosperms -> Angiosperms.',
      },
      {
        label: 'Key comparison',
        value:
          'Vascular tissue, seeds, flowers, and dominant generation separate major groups.',
      },
    ],
    remember: [
      'Bryophytes are amphibians of plant kingdom.',
      'Pteridophytes have vascular tissue but no seeds.',
      'Gymnosperms have naked seeds; angiosperms have enclosed seeds.',
      'Viruses are acellular and obligate intracellular parasites.',
    ],
    traps: [
      'Confusing pteridophytes with bryophytes because both reproduce by spores.',
      'Writing species name with capital first letter.',
      'Calling viruses cellular organisms.',
    ],
  },
  {
    match: [
      'ecology',
      'ecosystem',
      'population',
      'conservation',
      'pollution',
      'adaptation',
      'biodiversity',
      'cycles',
    ],
    items: [
      {
        label: 'Ecosystem',
        value: 'Biotic community plus abiotic environment.',
      },
      {
        label: 'Energy flow',
        value:
          'Unidirectional; only about 10% energy passes to next trophic level.',
      },
      {
        label: 'Biogeochemical cycles',
        value: 'Matter cycles through living and non-living components.',
      },
      {
        label: 'Conservation',
        value:
          'In-situ protects in natural habitat; ex-situ protects outside habitat.',
      },
    ],
    remember: [
      'Food chain length is limited by energy loss.',
      'Population interactions include predation, competition, parasitism, mutualism, and commensalism.',
      'Biodiversity includes genetic, species, and ecosystem diversity.',
      'Pollution questions often ask cause, effect, and control.',
    ],
    traps: [
      'Confusing food chain and food web.',
      'Mixing in-situ and ex-situ conservation.',
      'Forgetting energy flow is not cyclic.',
    ],
  },
  {
    match: [
      'cell',
      'mitochondria',
      'chloroplast',
      'ribosome',
      'nucleus',
      'chromosome',
      'mitosis',
      'meiosis',
      'division',
    ],
    items: [
      {
        label: 'Mitochondria',
        value: 'ATP production; has own DNA and ribosomes.',
      },
      { label: 'Chloroplast', value: 'Photosynthesis; grana and stroma.' },
      { label: 'Ribosome', value: 'Protein synthesis.' },
      {
        label: 'Cell division',
        value:
          'Mitosis maintains chromosome number; meiosis halves it and creates variation.',
      },
    ],
    remember: [
      'Prokaryotes lack a true nucleus and membrane-bound organelles.',
      'Mitosis: prophase, metaphase, anaphase, telophase.',
      'Meiosis includes crossing over in prophase I.',
      'Chromosomes align at equator during metaphase.',
    ],
    traps: [
      'Confusing chromatid separation in mitosis with homologous chromosome separation in meiosis I.',
      'Calling ribosomes membrane-bound organelles.',
      'Mixing grana and stroma functions.',
    ],
  },
  {
    match: [
      'genetic',
      'mendel',
      'linkage',
      'crossing',
      'mutation',
      'inheritance',
      'dna',
      'rna',
    ],
    items: [
      { label: 'Mendel monohybrid', value: 'Typical F2 phenotypic ratio 3:1.' },
      {
        label: 'Dihybrid',
        value:
          'Typical F2 phenotypic ratio 9:3:3:1 when genes assort independently.',
      },
      {
        label: 'Linkage',
        value: 'Genes on same chromosome tend to be inherited together.',
      },
      {
        label: 'DNA/RNA',
        value: 'DNA has deoxyribose and thymine; RNA has ribose and uracil.',
      },
    ],
    remember: [
      'Law of segregation applies during gamete formation.',
      'Crossing over creates recombination in prophase I.',
      'Mutation changes genetic material and can be harmful, neutral, or useful.',
      'Pedigree and ratio questions need careful setup.',
    ],
    traps: [
      'Using 9:3:3:1 when linkage or interaction is present.',
      'Confusing genotype ratio with phenotype ratio.',
      'Forgetting uracil replaces thymine in RNA.',
    ],
  },
  {
    match: [
      'photosynthesis',
      'respiration',
      'transpiration',
      'ascent',
      'absorption',
      'water',
      'growth',
      'germination',
      'plant physiology',
    ],
    items: [
      {
        label: 'Photosynthesis',
        value: 'Light reaction makes ATP/NADPH; Calvin cycle fixes CO2.',
      },
      {
        label: 'Respiration',
        value: 'Glycolysis -> Krebs cycle -> ETC; releases ATP.',
      },
      {
        label: 'Transpiration',
        value: 'Water loss through stomata; helps ascent of sap.',
      },
      {
        label: 'Growth hormones',
        value:
          'Auxin, gibberellin, cytokinin, ABA, ethylene have distinct effects.',
      },
    ],
    remember: [
      'Stomata regulate transpiration and gas exchange.',
      'Xylem transports water; phloem transports food.',
      'C3 and C4 pathways differ in first stable product and photorespiration.',
      'ABA is generally growth-inhibiting and stress-related.',
    ],
    traps: [
      'Mixing xylem and phloem functions.',
      'Saying dark reaction occurs only at night.',
      'Confusing transpiration pull with root pressure.',
    ],
  },
  {
    match: ['anatomy', 'tissue', 'root', 'stem', 'leaf', 'vascular'],
    items: [
      {
        label: 'Xylem',
        value: 'Conducts water/minerals and provides support.',
      },
      { label: 'Phloem', value: 'Conducts organic food.' },
      {
        label: 'Monocot stem',
        value: 'Scattered vascular bundles, usually closed.',
      },
      {
        label: 'Dicot stem',
        value: 'Vascular bundles in ring, cambium present.',
      },
    ],
    remember: [
      'Cambium is responsible for secondary growth.',
      'Monocot and dicot anatomy differences are high-yield.',
      'Root xylem arrangement differs from stem arrangement.',
      'Stomata and mesophyll arrangement matter in leaf anatomy.',
    ],
    traps: [
      'Confusing monocot and dicot vascular bundle arrangement.',
      'Forgetting phloem transports food bidirectionally depending on source-sink.',
      'Mixing root and stem anatomy diagrams.',
    ],
  },
  {
    match: [
      'reproduction',
      'pollination',
      'fertilization',
      'embryo',
      'endosperm',
      'gametogenesis',
      'sporogenesis',
    ],
    items: [
      {
        label: 'Pollination',
        value: 'Transfer of pollen from anther to stigma.',
      },
      {
        label: 'Double fertilization',
        value: 'One male gamete forms zygote; other forms triploid endosperm.',
      },
      { label: 'Embryo sac', value: 'Usually 7-celled and 8-nucleate.' },
      { label: 'Endosperm', value: 'Nutritive tissue for developing embryo.' },
    ],
    remember: [
      'Angiosperms show double fertilization.',
      'Microsporogenesis forms pollen grains.',
      'Megasporogenesis forms embryo sac lineage.',
      'Pollination agents and adaptations are common MCQs.',
    ],
    traps: [
      'Confusing pollination with fertilization.',
      'Forgetting endosperm is triploid in typical angiosperms.',
      'Mixing microspore and megaspore development.',
    ],
  },
  {
    match: [
      'digestive',
      'respiratory',
      'circulatory',
      'excretory',
      'nervous',
      'sense',
      'endocrinology',
      'reproductive system',
      'physiology',
    ],
    items: [
      {
        label: 'Digestion',
        value:
          'Enzymes act on specific food groups in mouth, stomach, and intestine.',
      },
      {
        label: 'Respiration',
        value: 'Gas exchange at alveoli; transport by hemoglobin and plasma.',
      },
      {
        label: 'Circulation',
        value: 'Double circulation separates pulmonary and systemic flow.',
      },
      {
        label: 'Endocrine',
        value: 'Hormones act on target organs; feedback controls secretion.',
      },
    ],
    remember: [
      'Structure-function links are key in human physiology.',
      'Learn each system as a flow: organ -> secretion/action -> result.',
      'Hormone source and function tables are high-yield.',
      'Physiology MCQs often test exceptions and sequence.',
    ],
    traps: [
      'Mixing pulmonary artery and pulmonary vein blood type.',
      'Confusing enzyme source with enzyme action site.',
      'Forgetting negative feedback in endocrine control.',
    ],
  },
  {
    match: [
      'disease',
      'immunity',
      'vaccine',
      'antigen',
      'antibody',
      'microbial',
      'typhoid',
      'tuberculosis',
      'hiv',
      'cholera',
      'hepatitis',
    ],
    items: [
      { label: 'Innate immunity', value: 'Non-specific first-line defense.' },
      { label: 'Acquired immunity', value: 'Specific, memory-based response.' },
      {
        label: 'Antigen',
        value: 'Foreign molecule that triggers immune response.',
      },
      {
        label: 'Vaccine',
        value:
          'Prepares immune system using weakened/killed pathogen or antigenic part.',
      },
    ],
    remember: [
      'Disease tables should include pathogen, transmission, symptoms, and prevention.',
      'Antibodies are produced by plasma cells from B lymphocytes.',
      'Vaccination creates immunological memory.',
      'HIV attacks helper T cells and weakens immunity.',
    ],
    traps: [
      'Mixing pathogen type: bacteria, virus, protozoa, fungus.',
      'Confusing active and passive immunity.',
      'Writing antibiotic for viral disease prevention.',
    ],
  },
  {
    match: [
      'biotechnology',
      'tissue culture',
      'genetic engineering',
      'transgenic',
      'ivf',
      'amniocentesis',
      'biofertilizer',
      'plant breeding',
      'food safety',
    ],
    items: [
      {
        label: 'Tissue culture',
        value:
          'Growing cells/tissues on nutrient medium under sterile conditions.',
      },
      {
        label: 'Genetic engineering',
        value: 'Manipulation of DNA using enzymes, vectors, and host cells.',
      },
      {
        label: 'IVF',
        value: 'Fertilization outside body followed by embryo transfer.',
      },
      {
        label: 'Plant breeding',
        value:
          'Selection and crossing to improve yield, resistance, and quality.',
      },
    ],
    remember: [
      'Totipotency is the basis of plant tissue culture.',
      'Restriction enzymes cut DNA at specific sequences.',
      'Vectors transfer desired genes into host cells.',
      'Applied biology questions often ask purpose and method.',
    ],
    traps: [
      'Confusing cloning with genetic engineering.',
      'Forgetting sterile condition in tissue culture.',
      'Mixing IVF with natural fertilization site.',
    ],
  },
]

const matProfiles: Array<{
  match: string[]
  items: OneShotKeyItem[]
  remember: string[]
  traps: string[]
}> = [
  {
    match: ['series', 'missing number', 'alphabet-number'],
    items: [
      { label: 'First check', value: 'Common difference or alphabet shift.' },
      {
        label: 'Second check',
        value: 'Multiplication/division, square, cube, prime.',
      },
      {
        label: 'Third check',
        value: 'Alternate terms or difference of differences.',
      },
      { label: 'Verification', value: 'Rule must fit every visible term.' },
    ],
    remember: [
      'Write differences above the series quickly.',
      'For letter series, convert letters to positions when needed.',
      'Check alternate positions if one rule fails.',
      'Do not use a rule that fits only the first two terms.',
    ],
    traps: [
      'Forcing arithmetic pattern when multiplication is present.',
      'Ignoring reverse alphabet positions.',
      'Not verifying all terms.',
    ],
  },
  {
    match: [
      'coding',
      'analogy',
      'classification',
      'logical arrangement',
      'statement',
    ],
    items: [
      {
        label: 'Coding',
        value: 'Compare each letter/number from original to code.',
      },
      {
        label: 'Analogy',
        value: 'Find relationship, not just category similarity.',
      },
      {
        label: 'Odd one out',
        value: 'Find the common property of three options.',
      },
      {
        label: 'Statements',
        value: 'Use only given information, not outside knowledge.',
      },
    ],
    remember: [
      'Check direction of alphabet shift.',
      'Relationship types include part-whole, function, cause-effect, tool-user, and class-member.',
      'For classification, test number property, meaning, use, and pattern.',
      'In statement questions, do not assume extra facts.',
    ],
    traps: [
      'Matching by topic instead of relationship.',
      'Applying coding rule to only first letter.',
      'Using real-world knowledge beyond the statement.',
    ],
  },
  {
    match: [
      'blood relation',
      'direction',
      'ranking',
      'order',
      'calendar',
      'time',
    ],
    items: [
      {
        label: 'Blood relation',
        value: 'Draw family tree with gender only when stated.',
      },
      { label: 'Direction', value: 'Draw compass and trace every turn.' },
      {
        label: 'Ranking',
        value: 'Total = rank from one side + rank from opposite side - 1.',
      },
      {
        label: 'Calendar',
        value: 'Normal year has 1 odd day; leap year has 2 odd days.',
      },
    ],
    remember: [
      'Left/right depends on the direction faced.',
      'Do not assume gender unless the question states it.',
      'Ranking questions often require subtracting the counted person once.',
      'Century leap year must be divisible by 400.',
    ],
    traps: [
      'Confusing maternal and paternal relation.',
      'Turning left/right from your own view instead of the person’s view.',
      'Forgetting the minus one in ranking formula.',
    ],
  },
  {
    match: [
      'figure',
      'mirror',
      'water',
      'paper',
      'embedded',
      'matrix',
      'rotation',
      'shape',
      'pattern',
    ],
    items: [
      {
        label: 'Figure series',
        value:
          'Track one feature at a time: rotation, position, number, shading.',
      },
      { label: 'Mirror image', value: 'Left and right reverse.' },
      { label: 'Water image', value: 'Top and bottom reverse.' },
      { label: 'Matrix', value: 'Check rows, columns, and diagonals.' },
    ],
    remember: [
      'Observe line count, direction, shading, and position separately.',
      'For rotation, decide clockwise or anticlockwise movement.',
      'Embedded figures require ignoring extra surrounding lines.',
      'Predict before looking at options when possible.',
    ],
    traps: [
      'Choosing an option that looks similar but misses orientation.',
      'Mixing mirror image with water image.',
      'Checking only rows in matrix questions.',
    ],
  },
  {
    match: [
      'percentage',
      'ratio',
      'average',
      'arithmetic',
      'data',
      'quantitative',
      'fractions',
    ],
    items: [
      { label: 'Percentage', value: 'Percent means per 100.' },
      { label: 'Ratio', value: 'Keep units same before comparing.' },
      { label: 'Average', value: 'Average = sum / number of items.' },
      {
        label: 'Data interpretation',
        value: 'Read only data needed for the question.',
      },
    ],
    remember: [
      'Use approximation when options are far apart.',
      'Convert fractions, decimals, and percentages quickly.',
      'Check whether the question asks increase, decrease, difference, or total.',
      'Avoid unnecessary calculation in data interpretation.',
    ],
    traps: [
      'Calculating percentage of the wrong base.',
      'Ignoring units in ratio questions.',
      'Reading the whole chart before reading the question.',
    ],
  },
]

type ChapterGuide = {
  overview: string
  focus: string[]
  keyItems: OneShotKeyItem[]
  remember: string[]
  traps: string[]
  mistakes: string[]
}

const chapterGuides: Record<string, ChapterGuide> = {
  'physics::mechanics': chapterGuide(
    'Mechanics is the highest-return Physics block because it connects measurement, vectors, motion, force, energy, rotation, fluids, gravitation, elasticity, and SHM. CEE questions are usually short, but they require a clean free-body diagram, correct formula condition, and careful sign/unit handling.',
    [
      'Measurement, significant figures, dimensions, vectors, kinematics, Newton laws, work-energy, circular motion, rotation, fluids, gravitation, elasticity, and SHM.',
      'Graphs of motion, resultant vectors, friction, pulley/elevator models, conservation of energy, torque, moment of inertia, Bernoulli continuity, and variation of g.',
      'The common scoring pattern is: identify model -> draw diagram -> choose formula -> convert units -> estimate option.',
    ],
    [
      {
        label: 'Kinematics',
        value: 'v = u + at; s = ut + 1/2 at^2; v^2 = u^2 + 2as',
      },
      {
        label: 'Newton laws',
        value: 'Fnet = ma; friction: fs <= mu_s N, fk = mu_k N',
      },
      {
        label: 'Work-energy',
        value: 'W = Fs cos theta; KE = 1/2mv^2; PE = mgh',
      },
      {
        label: 'Circular/rotation',
        value: 'a = v^2/r = omega^2r; tau = rF sin theta; L = I omega',
      },
      {
        label: 'Gravitation/fluids',
        value: 'F = Gm1m2/r^2; P = rho gh; A1v1 = A2v2',
      },
    ],
    [
      'Start every mechanics numerical by writing given, required, and sign convention.',
      'For force problems, draw forces on one body only; for connected bodies, draw separate diagrams.',
      'Use conservation of energy only when non-conservative work is absent or accounted for.',
      'In rotation, torque depends on perpendicular distance and moment of inertia depends on mass distribution.',
    ],
    [
      'Using scalar addition for vectors.',
      'Forgetting that centripetal force is the net inward force, not a separate new force.',
      'Assuming normal reaction is always equal to mg.',
      'Using motion equations when acceleration is not constant.',
    ],
    [
      'Skipping the diagram.',
      'Mixing distance with displacement.',
      'Using radius in cm while formulas need meter.',
      'Forgetting direction of friction or acceleration.',
    ],
  ),
  'physics::heat and thermodynamics': chapterGuide(
    'Heat and thermodynamics questions reward formula selection and conceptual clarity. CEE commonly tests heat transfer, expansion, calorimetry, gas laws, first law, second law, and process graphs.',
    [
      'Temperature vs heat, thermal expansion, calorimetry, latent heat, ideal gas behavior, internal energy, work done, and thermodynamic processes.',
      'Process recognition: isothermal, adiabatic, isobaric, isochoric; know what remains constant and what changes.',
      'PV graphs are high-yield: area gives work done.',
    ],
    [
      { label: 'Heat', value: 'Q = mc delta T; Q = mL during phase change' },
      {
        label: 'Expansion',
        value: 'Delta L = alpha L delta T; Delta V = gamma V delta T',
      },
      { label: 'Ideal gas', value: 'PV = nRT; for fixed gas, PV/T = constant' },
      { label: 'First law', value: 'Delta Q = Delta U + W' },
      { label: 'Efficiency', value: 'eta = W/Qh = 1 - Qc/Qh' },
    ],
    [
      'Temperature is not heat; heat is energy transferred due to temperature difference.',
      'During phase change, temperature remains constant while heat changes state.',
      'For ideal gas, internal energy depends mainly on temperature.',
      'Area under PV curve represents work done by gas.',
    ],
    [
      'Using Celsius value instead of Kelvin in gas law.',
      'Confusing heat supplied with change in internal energy.',
      'Forgetting work is zero in constant-volume process.',
    ],
    [
      'Not identifying the thermodynamic process first.',
      'Mixing specific heat and latent heat.',
      'Missing sign convention in work done.',
    ],
  ),
  'physics::waves and optics': chapterGuide(
    'Waves and optics combine recall, diagrams, and short calculations. CEE frequently asks sound waves, stationary waves, refraction, lenses, interference, diffraction, polarization, and total internal reflection.',
    [
      'Wave equation, SHM connection, nodes/antinodes, resonance, Doppler basics, reflection, refraction, lens/mirror formula, TIR, interference, diffraction, and polarization.',
      'For optics, a correct ray diagram and sign convention often solve the question faster than algebra.',
      'For waves, distinguish wave speed from particle speed.',
    ],
    [
      { label: 'Wave', value: 'v = f lambda; T = 1/f' },
      { label: 'SHM', value: 'a = -omega^2 x; T = 2pi sqrt(m/k) for spring' },
      { label: 'Refraction', value: 'n1 sin i = n2 sin r' },
      { label: 'Lens', value: '1/f = 1/v - 1/u; P = 1/f(m)' },
      {
        label: 'Interference',
        value: 'Path difference n lambda for maxima; (2n+1)lambda/2 for minima',
      },
    ],
    [
      'Frequency remains unchanged during refraction.',
      'Total internal reflection needs denser to rarer medium and angle greater than critical angle.',
      'Stationary waves have nodes with zero displacement and antinodes with maximum displacement.',
      'Power of lens uses focal length in meter.',
    ],
    [
      'Changing frequency when light enters another medium.',
      'Using focal length in cm for lens power.',
      'Confusing diffraction with refraction.',
    ],
    [
      'Ignoring sign convention.',
      'Mixing node and antinode.',
      'Forgetting units of wavelength.',
    ],
  ),
  'physics::current electricity and magnetism': chapterGuide(
    'Current electricity and magnetism are formula-rich and very scoring when circuit rules and field directions are clear. CEE asks Ohm law, circuits, Joule heating, AC, magnetic field, magnetic force, and induction.',
    [
      'Resistance combinations, Kirchhoff rules, potentiometer/meter bridge basics, heating effect, AC RMS values, force on charge/current, magnetic field due to wire/coil, and electromagnetic induction.',
      'Use circuit simplification before equations.',
      'Direction rules matter: right-hand thumb, Fleming rules, and Lenz law.',
    ],
    [
      { label: 'Ohm/Joule', value: 'V = IR; P = VI = I^2R = V^2/R; H = I^2Rt' },
      {
        label: 'Resistance',
        value: 'Series: R = R1 + R2; Parallel: 1/R = 1/R1 + 1/R2',
      },
      {
        label: 'Magnetic force',
        value: 'F = qvB sin theta; F = BIL sin theta',
      },
      { label: 'Induction', value: 'emf = -dPhi/dt' },
      { label: 'AC', value: 'Vrms = V0/sqrt(2); Irms = I0/sqrt(2)' },
    ],
    [
      'Conventional current is opposite to electron flow.',
      'Magnetic force is zero when velocity/current is parallel to field.',
      'Induced emf depends on rate of change of flux.',
      'RMS values are used for AC heating and power.',
    ],
    [
      'Mixing series and parallel rules.',
      'Ignoring internal resistance in cell questions.',
      'Using peak AC value where RMS is required.',
      'Forgetting Lenz law direction opposes change in flux.',
    ],
    [
      'Not redrawing circuits after simplification.',
      'Forgetting sin theta in magnetic force.',
      'Confusing magnetic field direction around current-carrying wire.',
    ],
  ),
  'physics::electrostatics and capacitors': chapterGuide(
    'Electrostatics and capacitors require vector thinking for fields and scalar thinking for potential. CEE commonly tests Coulomb law, field, potential, Gauss law basics, equipotential ideas, and capacitor combinations.',
    [
      'Charge, Coulomb law, electric field, electric potential, potential energy, Gauss law, field/potential graphs, capacitance, series/parallel capacitors, and energy stored.',
      'Field is vector; potential is scalar. This distinction is a favorite trap.',
      'Capacitor combination rules are opposite in feel to resistor rules.',
    ],
    [
      { label: 'Coulomb law', value: 'F = kq1q2/r^2' },
      { label: 'Electric field', value: 'E = F/q = kq/r^2' },
      { label: 'Potential', value: 'V = kq/r; U = qV' },
      {
        label: 'Capacitance',
        value: 'C = Q/V; parallel plate C = epsilon A/d',
      },
      { label: 'Energy', value: 'U = 1/2 CV^2 = 1/2 QV = Q^2/2C' },
    ],
    [
      'Electric field direction is force direction on a positive test charge.',
      'Potential due to multiple charges adds algebraically.',
      'Capacitors in parallel add directly; in series reciprocals add.',
      'Inside a conductor in electrostatic equilibrium, electric field is zero.',
    ],
    [
      'Treating potential as a vector.',
      'Forgetting inverse-square dependence in force and field.',
      'Mixing capacitor and resistor combination rules.',
    ],
    [
      'Ignoring sign of charge in potential.',
      'Using distance from surface instead of center for point-charge formulas.',
      'Forgetting dielectric changes capacitance.',
    ],
  ),
  'physics::modern physics': chapterGuide(
    'Modern Physics is compact and highly scoring. CEE often asks direct formula, concept, and graph questions from photoelectric effect, atoms, nuclei, radioactivity, semiconductors, logic gates, and wave-particle duality.',
    [
      'Photon energy, photoelectric equation, Bohr model basics, nuclear decay, half-life, binding energy, X-rays, de Broglie wavelength, semiconductor diode, transistor basics, and logic gates.',
      'Photoelectric graphs and threshold frequency are high-yield.',
      'Logic-gate truth tables are easy marks when memorized cleanly.',
    ],
    [
      { label: 'Photon', value: 'E = hf = hc/lambda' },
      {
        label: 'Photoelectric',
        value: 'hf = phi + KEmax; stopping potential eVs = KEmax',
      },
      { label: 'de Broglie', value: 'lambda = h/p' },
      { label: 'Radioactivity', value: 'N = N0(1/2)^(t/T)' },
      { label: 'Mass-energy', value: 'E = mc^2' },
    ],
    [
      'Photoelectron maximum kinetic energy depends on frequency, not intensity.',
      'Intensity affects number of emitted electrons.',
      'Alpha decay reduces mass number by 4 and atomic number by 2.',
      'p-type has holes as majority carriers; n-type has electrons.',
    ],
    [
      'Saying intensity increases photoelectron energy.',
      'Mixing atomic number and mass number changes in decay.',
      'Confusing forward and reverse bias.',
    ],
    [
      'Not memorizing basic logic tables.',
      'Forgetting threshold frequency condition.',
      'Using wavelength and frequency relation incorrectly.',
    ],
  ),
  'chemistry::physical chemistry': chapterGuide(
    'Physical Chemistry is calculation-heavy and highly rank-shaping. CEE asks mole concept, stoichiometry, atomic structure, periodicity, bonding, redox, states of matter, equilibrium, kinetics, electrochemistry, thermodynamics, and nuclear chemistry.',
    [
      'Convert to moles first, balance equations, identify limiting reagent, use correct units, and keep formulas grouped by chapter.',
      'Equilibrium, kinetics, thermodynamics, and electrochemistry need concept plus formula conditions.',
      'Atomic structure, bonding, and periodicity are often factual-conceptual with common exceptions.',
    ],
    [
      {
        label: 'Mole',
        value: 'n = mass/molar mass; N = nNA; gas at STP = 22.4 L/mol',
      },
      {
        label: 'Equilibrium',
        value:
          'K expression excludes pure solids/liquids; catalyst does not change K',
      },
      { label: 'Kinetics', value: 'Rate = k[A]^m[B]^n; order is experimental' },
      { label: 'Thermodynamics', value: 'Delta G = Delta H - T Delta S' },
      {
        label: 'Electrochemistry',
        value: 'Ecell = Ecathode - Eanode; anode oxidation, cathode reduction',
      },
    ],
    [
      'Use balanced chemical equations before mole ratio.',
      'Order of reaction is not always equal to molecularity.',
      'Only temperature changes equilibrium constant.',
      'Negative Delta G means spontaneous under given conditions.',
    ],
    [
      'Comparing grams instead of moles.',
      'Including solids in K expression.',
      'Using stoichiometric coefficient as reaction order automatically.',
      'Mixing signs of anode/cathode in different cell types.',
    ],
    [
      'Skipping unit conversion.',
      'Forgetting exceptions in periodic trends.',
      'Not writing formula assumptions.',
    ],
  ),
  'chemistry::inorganic chemistry': chapterGuide(
    'Inorganic Chemistry is a table-and-exception subject. CEE asks periodic trends, non-metals, metals, ores, compounds, oxidation states, colors, catalysts, coordination compounds, corrosion, and bio-inorganic facts.',
    [
      'Make comparison tables for groups, compounds, colors, oxidation states, ores, catalysts, and uses.',
      's-block, p-block, d-block, and coordination compounds have different revision methods.',
      'Exact factual wording matters because options are usually close.',
    ],
    [
      {
        label: 's-block',
        value:
          'Reactivity increases down group; strong reducing nature; basic oxides/hydroxides',
      },
      {
        label: 'p-block',
        value:
          'Variable oxidation states, inert pair effect, acidic/basic oxide trends',
      },
      {
        label: 'd-block',
        value:
          'Variable oxidation state, colored ions, catalytic activity, complex formation',
      },
      {
        label: 'Metallurgy',
        value: 'Concentration -> extraction/reduction -> refining',
      },
      {
        label: 'Coordination',
        value:
          'Ligand, coordination number, oxidation state, IUPAC naming, isomerism',
      },
    ],
    [
      'Transition metal colors often come from d-d transitions.',
      'Inert pair effect becomes stronger down heavier p-block elements.',
      'Ores and extraction methods are direct MCQ material.',
      'Coordination compound oxidation state must be calculated before naming.',
    ],
    [
      'Mixing group trends.',
      'Forgetting amphoteric oxides.',
      'Miscounting ligand charge in complexes.',
      'Confusing ore name and metal.',
    ],
    [
      'Memorizing isolated facts without comparison.',
      'Ignoring common oxidation states.',
      'Not revising colors and precipitates.',
    ],
  ),
  'chemistry::organic chemistry': chapterGuide(
    'Organic Chemistry becomes manageable when revised as functional-group conversion. CEE asks IUPAC basics, isomerism, hydrocarbons, aromatic reactions, haloalkanes, alcohols, phenols, ethers, carbonyls, acids, nitro compounds, amines, and organometallic reactions.',
    [
      'Learn reagent by action: oxidize, reduce, substitute, eliminate, add, protect, or activate.',
      'Make reaction maps from one functional group to another.',
      'Named tests and distinguishing reactions are very high-yield.',
    ],
    [
      {
        label: 'Addition',
        value: 'Alkenes/alkynes; Markovnikov and peroxide-effect exceptions',
      },
      {
        label: 'Substitution',
        value: 'Haloalkanes and aromatic compounds; SN1/SN2 basics',
      },
      {
        label: 'Oxidation',
        value:
          '1 degree alcohol -> aldehyde -> acid; 2 degree alcohol -> ketone',
      },
      {
        label: 'Tests',
        value:
          'Tollens/Fehling for aldehyde; iodoform for CH3CO- or CH3CH(OH)-',
      },
      {
        label: 'Aromatic directing',
        value:
          'Activating groups usually ortho/para; deactivating often meta except halogens',
      },
    ],
    [
      'Condition changes product in organic reactions.',
      'Phenol is more acidic than alcohol due to resonance-stabilized phenoxide.',
      'Aldehydes reduce Tollens/Fehling; ketones usually do not.',
      'Aromatic substitution depends on directing effect of existing group.',
    ],
    [
      'Ignoring peroxide condition in HBr addition.',
      'Confusing aldehyde and ketone tests.',
      'Forgetting rearrangement or major product stability.',
      'Mixing ortho/para and meta directors.',
    ],
    [
      'Learning reactions as isolated lines.',
      'Not writing reagent plus condition.',
      'Skipping mechanism logic where it explains product.',
    ],
  ),
  'chemistry::applied chemistry': chapterGuide(
    'Applied Chemistry is practical and fact-based. CEE asks industrial manufacture, polymers, dyes, drugs, pesticides, fertilizers, colloids, buffers, radioisotope uses, and applications of metals/non-metals.',
    [
      'Revise processes as raw material -> condition/catalyst -> product -> use.',
      'Industrial chemistry questions often test one key condition or catalyst.',
      'Polymers, drugs, fertilizers, and radioisotopes are quick scoring with tables.',
    ],
    [
      {
        label: 'Haber process',
        value:
          'NH3 from N2 + H2; Fe catalyst; high pressure, moderate temperature',
      },
      { label: 'Contact process', value: 'H2SO4 manufacture; V2O5 catalyst' },
      {
        label: 'Solvay process',
        value: 'Na2CO3 manufacture using brine, NH3, CO2',
      },
      { label: 'Polymers', value: 'Know monomer, polymer, use, and type' },
      {
        label: 'Buffers/colloids',
        value: 'Know examples, properties, and medical/industrial use',
      },
    ],
    [
      'Catalyst and condition are the most common industrial traps.',
      'Know fertilizer nutrient: N, P, K sources.',
      'Drug classes are asked by use, not long pharmacology.',
      'Radioisotope use questions are direct recall.',
    ],
    [
      'Mixing catalysts of Haber and Contact processes.',
      'Confusing polymer monomer pairs.',
      'Forgetting difference between colloid and true solution.',
    ],
    [
      'Reading process names without raw materials and catalyst.',
      'Not grouping products by use.',
      'Ignoring environmental/safety angle.',
    ],
  ),
  'chemistry::analytical chemistry': chapterGuide(
    'Analytical Chemistry is observation-heavy. CEE asks chemical tests, acid/basic radicals, functional group tests, Lassaigne test, biomolecule tests, separation techniques, titration types, and indicator selection.',
    [
      'Every test should be remembered as reagent -> observation -> inference.',
      'Functional group distinction tests are frequent and easy marks.',
      'Indicator choice depends on acid-base strength and endpoint pH range.',
    ],
    [
      {
        label: 'Lassaigne',
        value: 'Sodium fusion extract detects N, S, halogens',
      },
      {
        label: 'Unsaturation',
        value: 'Bromine water or Baeyer reagent decolorization',
      },
      {
        label: 'Carbonate',
        value: 'Dilute acid gives CO2; turns lime water milky',
      },
      {
        label: 'Sulfate',
        value: 'BaCl2 gives white BaSO4 precipitate insoluble in acid',
      },
      {
        label: 'Titration',
        value:
          'Strong acid-strong base: broad indicators; weak acid-strong base: phenolphthalein',
      },
    ],
    [
      'Write observation and inference together.',
      'Confirmatory tests matter more than preliminary clues.',
      'Organic tests often distinguish very similar compounds.',
      'Separation methods depend on physical properties.',
    ],
    [
      'Writing reagent without observation.',
      'Confusing white precipitates.',
      'Using wrong indicator for weak acid/weak base cases.',
    ],
    [
      'Not memorizing color/precipitate/gas changes.',
      'Mixing preliminary and confirmatory tests.',
      'Ignoring solubility of precipitate in acid/base.',
    ],
  ),
  'biology::basic components of life': chapterGuide(
    'Basic Components of Life covers carbohydrates, lipids, minerals, proteins, and enzymes. CEE usually tests structure, function, examples, deficiency, and enzyme behavior.',
    [
      'Biomolecules as monomers/polymers, energy roles, structural roles, and enzyme regulation.',
      'Deficiency symptoms and examples are direct Biology MCQs.',
      'Enzyme questions focus on specificity, optimum pH/temperature, and denaturation.',
    ],
    [
      {
        label: 'Carbohydrate',
        value: 'Energy source; starch/glycogen storage; cellulose structural',
      },
      {
        label: 'Lipid',
        value: 'Energy storage, membrane, insulation, steroid hormones',
      },
      {
        label: 'Protein',
        value: 'Amino acid polymer; enzymes, transport, structure, antibodies',
      },
      {
        label: 'Enzyme',
        value: 'Specific biocatalyst; lowers activation energy',
      },
      {
        label: 'Minerals',
        value: 'Trace functions; deficiency symptoms are high-yield',
      },
    ],
    [
      'Enzymes are not consumed in reactions.',
      'Protein shape is essential for function.',
      'High temperature and unsuitable pH can denature enzymes.',
      'Carbohydrates, proteins, and lipids have different test reactions.',
    ],
    [
      'Calling cellulose an animal storage carbohydrate.',
      'Confusing enzyme with substrate.',
      'Forgetting mineral deficiency signs.',
    ],
    [
      'Memorizing examples without functions.',
      'Mixing starch, glycogen, and cellulose.',
      'Ignoring enzyme optimum conditions.',
    ],
  ),
  'biology::biodiversity': chapterGuide(
    'Biodiversity includes classification systems, taxonomy, viruses, Monera, fungi, lichens, algae, bryophytes, pteridophytes, gymnosperms, angiosperms, economic importance, and medicinal plants of Nepal.',
    [
      'Study this chapter through comparison tables: body organization, reproduction, vascular tissue, seeds, flowers, examples, and economic importance.',
      'Plant groups are tested by distinguishing features and examples.',
      'Taxonomy questions reward exact hierarchy and binomial nomenclature rules.',
    ],
    [
      {
        label: 'Hierarchy',
        value:
          'Kingdom -> Division/Phylum -> Class -> Order -> Family -> Genus -> Species',
      },
      {
        label: 'Bryophytes',
        value: 'Non-vascular; amphibians of plant kingdom',
      },
      {
        label: 'Pteridophytes',
        value: 'Vascular cryptogams; spores; no seeds',
      },
      { label: 'Gymnosperms', value: 'Naked seeds; no fruits' },
      { label: 'Angiosperms', value: 'Flowering plants with enclosed seeds' },
    ],
    [
      'Viruses are acellular and obligate intracellular parasites.',
      'Binomial name uses Genus capitalized and species lowercase.',
      'Fungi are absorptive heterotrophs with chitin wall.',
      'Economic importance examples are high-yield.',
    ],
    [
      'Confusing bryophytes and pteridophytes.',
      'Calling gymnosperm seeds enclosed in fruit.',
      'Writing species name with capital letter.',
    ],
    [
      'Not memorizing examples.',
      'Mixing classification hierarchy order.',
      'Ignoring reproductive structure differences.',
    ],
  ),
  'biology::ecology and vegetation': chapterGuide(
    'Ecology and Vegetation covers ecosystem, interactions, biogeochemical cycles, ecological imbalance, vegetation, and adaptations. CEE asks definitions, examples, cycles, conservation, and pollution effects.',
    [
      'Revise energy flow, trophic levels, ecological pyramids, population interactions, nutrient cycles, adaptation, and ecological imbalance.',
      'Use flow diagrams for carbon/nitrogen cycles and tables for interactions.',
      'Pollution questions ask source, effect, and control.',
    ],
    [
      { label: 'Ecosystem', value: 'Biotic community + abiotic environment' },
      {
        label: 'Energy flow',
        value: 'Unidirectional; about 10% transfer to next trophic level',
      },
      {
        label: 'Interactions',
        value: 'Predation, parasitism, competition, mutualism, commensalism',
      },
      {
        label: 'Cycles',
        value:
          'Carbon, nitrogen, water, phosphorus move matter through ecosystem',
      },
      {
        label: 'Conservation',
        value: 'In-situ = natural habitat; ex-situ = outside natural habitat',
      },
    ],
    [
      'Energy flow is not cyclic, but matter cycles.',
      'Food webs are more stable than simple food chains.',
      'Adaptations match habitat stress.',
      'Ecological imbalance often results from human activity.',
    ],
    [
      'Mixing food chain and food web.',
      'Confusing in-situ and ex-situ conservation.',
      'Forgetting decomposers in nutrient cycles.',
    ],
    [
      'Not linking examples with interaction type.',
      'Ignoring direction of energy flow.',
      'Memorizing cycles without sequence.',
    ],
  ),
  'biology::cell biology': chapterGuide(
    'Cell Biology covers prokaryotic/eukaryotic cells, organelles, chromosomes, cilia/flagella, inclusions, cell cycle, amitosis, mitosis, meiosis, and significance of division.',
    [
      'Use organelle-function tables and cell division stage diagrams.',
      'CEE frequently tests mitochondria, chloroplast, ribosome, nucleus, chromosome, mitosis vs meiosis, and crossing over.',
      'Cell division sequences must be memorized visually.',
    ],
    [
      {
        label: 'Mitochondria',
        value: 'ATP production; double membrane; own DNA',
      },
      {
        label: 'Chloroplast',
        value: 'Photosynthesis; grana light reaction, stroma Calvin cycle',
      },
      { label: 'Ribosome', value: 'Protein synthesis; not membrane-bound' },
      {
        label: 'Mitosis',
        value: 'Equational division; maintains chromosome number',
      },
      {
        label: 'Meiosis',
        value: 'Reduction division; crossing over in prophase I',
      },
    ],
    [
      'Prokaryotes lack true nucleus and membrane-bound organelles.',
      'Metaphase has chromosomes at equator.',
      'Anaphase separates chromatids in mitosis, homologous chromosomes in meiosis I.',
      'Meiosis creates variation through crossing over and independent assortment.',
    ],
    [
      'Calling ribosome membrane-bound.',
      'Confusing meiosis I and meiosis II events.',
      'Mixing chromatin, chromatid, and chromosome.',
    ],
    [
      'Not drawing division stages.',
      'Forgetting organelle examples/functions.',
      'Mixing prokaryotic and eukaryotic features.',
    ],
  ),
  'biology::genetics': chapterGuide(
    'Genetics covers genetic material, Mendelian genetics, linkage, crossing over, sex-linked inheritance, mutation, polyploidy, and genetic disorders. CEE asks ratios, definitions, examples, and pedigree logic.',
    [
      'Practice monohybrid, dihybrid, test cross, incomplete dominance, codominance, linkage, and sex-linked inheritance.',
      'Ratios are scoring only if genotype/phenotype distinction is clear.',
      'DNA/RNA differences and mutation types are frequent recall points.',
    ],
    [
      {
        label: 'Monohybrid',
        value: 'F2 phenotype 3:1; genotype 1:2:1 for complete dominance',
      },
      {
        label: 'Dihybrid',
        value: 'F2 phenotype 9:3:3:1 when independent assortment applies',
      },
      {
        label: 'Test cross',
        value: 'Cross with homozygous recessive to determine genotype',
      },
      {
        label: 'Linkage',
        value: 'Genes on same chromosome inherited together',
      },
      {
        label: 'Sex-linked',
        value: 'X-linked traits show characteristic male predominance',
      },
    ],
    [
      'Law of segregation operates during gamete formation.',
      'Crossing over occurs in prophase I of meiosis.',
      'Mutation changes genetic material.',
      'Polyploidy is more common/tolerated in plants.',
    ],
    [
      'Using 9:3:3:1 for linked genes.',
      'Confusing genotype and phenotype ratios.',
      'Forgetting carrier females in X-linked recessive traits.',
    ],
    [
      'Not writing gametes before cross.',
      'Ignoring probability rules.',
      'Mixing DNA and RNA bases.',
    ],
  ),
  'biology::plant anatomy': chapterGuide(
    'Plant Anatomy covers tissues, vascular bundles, monocot/dicot root, stem, and leaf. CEE often asks diagram labels and monocot-dicot comparison.',
    [
      'Make side-by-side tables for monocot root/stem/leaf and dicot root/stem/leaf.',
      'Know xylem/phloem arrangement, cambium presence, vascular bundle type, pith, cortex, and stomata distribution.',
      'Diagram labels are usually more important than long theory.',
    ],
    [
      { label: 'Xylem', value: 'Water/mineral conduction and support' },
      { label: 'Phloem', value: 'Food conduction from source to sink' },
      {
        label: 'Dicot stem',
        value:
          'Vascular bundles in ring; cambium present; secondary growth possible',
      },
      {
        label: 'Monocot stem',
        value:
          'Scattered vascular bundles; closed bundles; no typical secondary growth',
      },
      { label: 'Root', value: 'Radial vascular bundles; exarch xylem' },
    ],
    [
      'Cambium enables secondary growth.',
      'Monocot and dicot vascular arrangements are high-yield.',
      'Root and stem anatomy differ in xylem arrangement.',
      'Leaf anatomy links to photosynthesis and transpiration.',
    ],
    [
      'Mixing monocot and dicot stem diagrams.',
      'Forgetting exarch xylem in roots.',
      'Confusing open and closed vascular bundles.',
    ],
    [
      'Not practicing diagrams.',
      'Memorizing tissues without location.',
      'Ignoring function of each tissue.',
    ],
  ),
  'biology::plant physiology': chapterGuide(
    'Plant Physiology includes water relations, transpiration, ascent of sap, absorption, imbibition, guttation, wilting, photosynthesis, respiration, growth, germination, and dormancy.',
    [
      'This is one of the most important Botany blocks for CEE. Use process flows and compare photosynthesis vs respiration.',
      'Know xylem/phloem transport, stomatal control, transpiration pull, C3/C4 basics, ATP production, and plant hormones.',
      'Questions often test sequence, site, product, and limiting factor.',
    ],
    [
      {
        label: 'Transpiration',
        value:
          'Water vapor loss mainly through stomata; creates pull for ascent of sap',
      },
      {
        label: 'Photosynthesis',
        value: 'Light reaction in grana; Calvin cycle in stroma',
      },
      {
        label: 'Respiration',
        value: 'Glycolysis -> Krebs cycle -> ETC; ATP release',
      },
      {
        label: 'Growth hormones',
        value:
          'Auxin, gibberellin, cytokinin promote growth; ABA inhibits/stress; ethylene ripening',
      },
      {
        label: 'Germination',
        value:
          'Needs water, oxygen, suitable temperature; dormancy delays germination',
      },
    ],
    [
      'Xylem carries water; phloem carries food.',
      'Dark reaction does not mean it occurs only in darkness.',
      'C4 plants reduce photorespiration.',
      'ABA is associated with stomatal closure and stress response.',
    ],
    [
      'Mixing transpiration pull and root pressure.',
      'Calling Calvin cycle a night-only reaction.',
      'Confusing hormone functions.',
    ],
    [
      'Not revising sites of reactions.',
      'Forgetting products of stages.',
      'Mixing C3/C4 features.',
    ],
  ),
  'biology::developmental botany': chapterGuide(
    'Developmental Botany covers asexual reproduction, sporogenesis, gametogenesis, pollination, fertilization, monocot/dicot embryo, and endosperm. CEE asks reproductive sequence and embryo sac facts.',
    [
      'Revise angiosperm reproduction as a flow: flower -> spore formation -> gametophyte -> pollination -> fertilization -> seed/fruit.',
      'Double fertilization and embryo sac structure are high-yield.',
      'Pollination adaptations and agents are common direct questions.',
    ],
    [
      {
        label: 'Pollination',
        value: 'Transfer of pollen from anther to stigma',
      },
      { label: 'Embryo sac', value: 'Usually 7-celled and 8-nucleate' },
      {
        label: 'Double fertilization',
        value: 'Syngamy forms zygote; triple fusion forms triploid endosperm',
      },
      { label: 'Endosperm', value: 'Nutritive tissue for embryo' },
      {
        label: 'Embryo',
        value: 'Monocot has one cotyledon; dicot has two cotyledons',
      },
    ],
    [
      'Angiosperms show double fertilization.',
      'Pollen tube carries male gametes to embryo sac.',
      'Endosperm is usually triploid.',
      'Asexual reproduction produces genetically similar offspring.',
    ],
    [
      'Confusing pollination with fertilization.',
      'Forgetting triple fusion product.',
      'Mixing microsporogenesis and megasporogenesis.',
    ],
    [
      'Not memorizing embryo sac labels.',
      'Skipping sequence diagrams.',
      'Confusing monocot and dicot embryo parts.',
    ],
  ),
  'biology::applied botany': chapterGuide(
    'Applied Botany covers tissue culture, genetic engineering, biofertilizers, green manure, plant breeding, bio-engineering, and food safety/security. CEE asks purpose, method, and examples.',
    [
      'Study each application as principle -> method -> benefit -> example.',
      'Tissue culture, totipotency, plant breeding, biofertilizer organisms, and genetic engineering tools are high-yield.',
      'Food security connects biology with public health and agriculture.',
    ],
    [
      {
        label: 'Tissue culture',
        value: 'Growing plant cells/tissues on sterile nutrient medium',
      },
      {
        label: 'Totipotency',
        value: 'Single plant cell can regenerate whole plant',
      },
      {
        label: 'Biofertilizer',
        value:
          'Rhizobium, Azotobacter, cyanobacteria improve nutrient availability',
      },
      {
        label: 'Plant breeding',
        value: 'Selection and crossing for yield, resistance, quality',
      },
      {
        label: 'Genetic engineering',
        value:
          'DNA manipulation using restriction enzymes, vectors, and host cells',
      },
    ],
    [
      'Sterility is essential in tissue culture.',
      'Micropropagation rapidly produces many identical plants.',
      'Biofertilizers reduce chemical fertilizer dependence.',
      'Plant breeding improves disease resistance and productivity.',
    ],
    [
      'Confusing tissue culture with ordinary seed germination.',
      'Forgetting totipotency.',
      'Mixing biofertilizer and pesticide roles.',
    ],
    [
      'Memorizing terms without examples.',
      'Ignoring method sequence.',
      'Not linking application to benefit.',
    ],
  ),
  'biology::evolutionary biology': chapterGuide(
    'Evolutionary Biology covers origin of life, Oparin-Haldane theory, Miller-Urey experiment, evidences, theories, and human evolution. CEE asks theory names, evidence types, and sequence.',
    [
      'Know chemical evolution, experimental evidence, fossils, homologous/analogous organs, Darwinism, mutation theory, and human evolutionary sequence.',
      'Evidence-based comparison questions are common.',
      'Human evolution is best revised as a timeline.',
    ],
    [
      {
        label: 'Oparin-Haldane',
        value: 'Life originated chemically in primitive reducing atmosphere',
      },
      {
        label: 'Miller-Urey',
        value: 'Simulated primitive atmosphere and produced amino acids',
      },
      {
        label: 'Homologous organs',
        value: 'Same origin, different function; divergent evolution',
      },
      {
        label: 'Analogous organs',
        value: 'Different origin, same function; convergent evolution',
      },
      {
        label: 'Natural selection',
        value: 'Differential survival and reproduction of favorable variations',
      },
    ],
    [
      'Fossils are direct evidence of evolution.',
      'Homology supports common ancestry.',
      'Analogous organs show adaptation to similar function.',
      'Evolution acts on populations over generations.',
    ],
    [
      'Confusing homologous and analogous organs.',
      'Calling Miller-Urey proof of complete life formation.',
      'Mixing Lamarckism and Darwinism.',
    ],
    [
      'Not memorizing examples of evidences.',
      'Ignoring human evolution sequence.',
      'Mixing theory and experiment names.',
    ],
  ),
  'biology::animal diversity and classification': chapterGuide(
    'Animal Diversity covers protozoa to chordata. CEE asks phylum features, examples, symmetry, coelom, segmentation, body systems, and distinguishing characters.',
    [
      'Make phylum tables with level of organization, symmetry, germ layers, coelom, segmentation, special feature, and examples.',
      'Examples are extremely high-yield.',
      'Chordata vs non-chordata and vertebrate classes are common traps.',
    ],
    [
      { label: 'Porifera', value: 'Cellular level; pores; canal system' },
      { label: 'Cnidaria', value: 'Cnidoblasts; radial symmetry' },
      {
        label: 'Platyhelminthes',
        value: 'Acoelomate, dorsoventrally flattened',
      },
      { label: 'Annelida', value: 'True coelom, metameric segmentation' },
      {
        label: 'Chordata',
        value:
          'Notochord, dorsal hollow nerve cord, pharyngeal gill slits at some stage',
      },
    ],
    [
      'Symmetry and coelom are key classification criteria.',
      'Arthropoda is the largest phylum.',
      'Echinoderms are adults radial but larvae bilateral.',
      'Chordates possess notochord at least embryonically.',
    ],
    [
      'Mixing coelomate, pseudocoelomate, and acoelomate.',
      'Forgetting examples.',
      'Confusing adult and larval symmetry in echinoderms.',
    ],
    [
      'Memorizing without tables.',
      'Skipping diagnostic features.',
      'Mixing phylum and class examples.',
    ],
  ),
  'biology::animal tissues and histology': chapterGuide(
    'Animal Tissues and Histology covers epithelial, connective, muscular, and nervous tissues. CEE asks location, function, cell type, and distinguishing structure.',
    [
      'Revise tissue type -> location -> function -> example.',
      'Epithelial tissue questions often ask shape and function.',
      'Muscle and nerve tissue questions ask structure-function matching.',
    ],
    [
      {
        label: 'Epithelial',
        value: 'Covering/lining; protection, absorption, secretion',
      },
      {
        label: 'Connective',
        value: 'Binding/support; includes blood, bone, cartilage, adipose',
      },
      {
        label: 'Muscle',
        value:
          'Skeletal voluntary striated; smooth involuntary non-striated; cardiac striated involuntary',
      },
      {
        label: 'Nervous',
        value: 'Neuron conducts impulses; neuroglia supports',
      },
    ],
    [
      'Structure of tissue reflects function.',
      'Cardiac muscle is striated, branched, and involuntary.',
      'Blood is a connective tissue.',
      'Neurons have dendrites, cell body, and axon.',
    ],
    [
      'Calling cardiac muscle voluntary.',
      'Forgetting blood as connective tissue.',
      'Mixing simple squamous and cuboidal epithelium locations.',
    ],
    [
      'Not learning locations.',
      'Mixing tissue examples.',
      'Ignoring diagrams of neuron and muscle.',
    ],
  ),
  'biology::study of selected animals': chapterGuide(
    'Study of Selected Animals covers Plasmodium, earthworm/Pheretima, and frog/Rana. CEE asks life cycle, morphology, systems, and economic/medical importance.',
    [
      'Plasmodium is high-yield for disease cycle and host stages.',
      'Earthworm and frog questions focus on anatomy, organ systems, and adaptations.',
      'Diagrams and labeled structures are important.',
    ],
    [
      {
        label: 'Plasmodium',
        value: 'Causes malaria; female Anopheles mosquito vector',
      },
      {
        label: 'Earthworm',
        value: 'Segmented annelid; helps soil aeration and fertility',
      },
      { label: 'Frog', value: 'Amphibian; adaptations for land and water' },
      {
        label: 'Life cycle',
        value: 'Know host, infective stage, and site of multiplication',
      },
    ],
    [
      'Malaria transmission involves female Anopheles.',
      'Earthworm has closed circulatory system.',
      'Frog respiration can be cutaneous, buccal, and pulmonary.',
      'Selected animal anatomy is best revised with diagrams.',
    ],
    [
      'Mixing mosquito sex/vector.',
      'Forgetting earthworm segmentation features.',
      'Confusing frog respiratory modes.',
    ],
    [
      'Skipping life cycles.',
      'Not revising labeled diagrams.',
      'Mixing organ locations.',
    ],
  ),
  'biology::human biology and physiology': chapterGuide(
    'Human Biology and Physiology is one of the most scoring Zoology units. It covers digestion, respiration, circulation, excretion, nervous system, sense organs, endocrinology, and reproduction.',
    [
      'Study each system as organ -> secretion/structure -> function -> regulation -> disorder.',
      'Hormone source-action tables, enzyme tables, blood flow, nephron flow, reflex arc, and reproductive hormones are high-yield.',
      'Sequence questions are common: digestion pathway, blood circulation, urine formation, nerve impulse, menstrual cycle.',
    ],
    [
      {
        label: 'Digestion',
        value: 'Enzyme source, substrate, product, and action site',
      },
      {
        label: 'Respiration',
        value:
          'Alveolar exchange; O2 mostly by hemoglobin, CO2 mainly as bicarbonate',
      },
      {
        label: 'Circulation',
        value: 'Double circulation; pulmonary and systemic routes',
      },
      {
        label: 'Excretion',
        value: 'Filtration -> reabsorption -> secretion -> concentration',
      },
      {
        label: 'Endocrine',
        value:
          'Pituitary, thyroid, pancreas, adrenal, gonads: source and action',
      },
    ],
    [
      'Pulmonary artery carries deoxygenated blood; pulmonary vein carries oxygenated blood.',
      'Nephron is the functional unit of kidney.',
      'Insulin lowers blood glucose; glucagon raises it.',
      'Reflex arc bypasses conscious brain processing for quick response.',
    ],
    [
      'Mixing pulmonary artery/vein.',
      'Confusing enzyme source and action site.',
      'Forgetting hormone feedback control.',
      'Mixing sympathetic and parasympathetic effects.',
    ],
    [
      'Not using flowcharts.',
      'Forgetting endocrine source-action pairs.',
      'Skipping physiological disorders.',
    ],
  ),
  'biology::microbial diseases and immunology': chapterGuide(
    'Microbial Diseases and Immunology covers typhoid, TB, HIV/AIDS, cholera, influenza, hepatitis, candidiasis, innate/acquired immunity, antigens, antibodies, and vaccines.',
    [
      'Make disease tables: pathogen -> transmission -> symptoms -> prevention/control.',
      'Immunity questions test innate vs acquired, active vs passive, antigen-antibody, and vaccination.',
      'Do not over-study medical-level details; CEE asks clean fundamentals.',
    ],
    [
      { label: 'Innate immunity', value: 'Non-specific, present from birth' },
      {
        label: 'Acquired immunity',
        value: 'Specific, develops after exposure/vaccination',
      },
      {
        label: 'Antibody',
        value: 'Produced by plasma cells; reacts with antigen',
      },
      { label: 'Vaccine', value: 'Induces active immunity and memory' },
      { label: 'HIV', value: 'Attacks helper T cells, reducing immunity' },
    ],
    [
      'Typhoid is bacterial; TB is bacterial; influenza and hepatitis are viral; candidiasis is fungal.',
      'Vaccination gives active artificial immunity.',
      'Passive immunity gives ready-made antibodies.',
      'Antigen is the foreign molecule that triggers immune response.',
    ],
    [
      'Mixing pathogen types.',
      'Confusing active and passive immunity.',
      'Writing antibiotics for viral diseases as prevention.',
    ],
    [
      'Not memorizing transmission mode.',
      'Ignoring prevention measures.',
      'Mixing antibody and antigen definitions.',
    ],
  ),
  'biology::medical technology and applied biology': chapterGuide(
    'Medical Technology and Applied Biology covers transplantation, IVF, amniocentesis, transgenic animals, and applied microbiology. CEE asks purpose, process, ethical point, and examples.',
    [
      'Study method -> purpose -> biological principle -> limitation/ethical concern.',
      'IVF and amniocentesis are commonly confused.',
      'Transgenic animal questions ask why genes are inserted and what use results.',
    ],
    [
      {
        label: 'Transplantation',
        value:
          'Replacement of damaged tissue/organ; rejection controlled by matching/immunosuppression',
      },
      {
        label: 'IVF',
        value: 'Fertilization outside body followed by embryo transfer',
      },
      {
        label: 'Amniocentesis',
        value:
          'Testing fetal cells/fluid for genetic/chromosomal abnormalities',
      },
      {
        label: 'Transgenic animals',
        value:
          'Animals carrying foreign gene for research, medicine, or production',
      },
      {
        label: 'Applied microbiology',
        value: 'Microbes used in food, medicine, industry, agriculture',
      },
    ],
    [
      'IVF does not mean cloning.',
      'Amniocentesis is diagnostic and has ethical/legal concerns.',
      'Organ rejection is immune-mediated.',
      'Transgenic organisms express introduced genes.',
    ],
    [
      'Confusing IVF and amniocentesis.',
      'Ignoring immune rejection in transplantation.',
      'Calling all genetically similar organisms transgenic.',
    ],
    [
      'Not learning purpose of each technology.',
      'Skipping ethical angle.',
      'Mixing method sequence.',
    ],
  ),
  'biology::biota, environment and conservation': chapterGuide(
    'Biota, Environment and Conservation covers animal behavior, pollution, adaptations, and conservation biology. CEE asks examples, causes, effects, and control strategies.',
    [
      'Connect behavior/adaptation to survival advantage.',
      'Pollution topics should be revised as source -> pollutant -> effect -> control.',
      'Conservation biology requires in-situ/ex-situ examples and biodiversity value.',
    ],
    [
      {
        label: 'Animal behavior',
        value: 'Innate/learned behavior improves survival and reproduction',
      },
      {
        label: 'Pollution',
        value: 'Air, water, soil, noise; each has source and biological effect',
      },
      {
        label: 'Adaptation',
        value: 'Structural, physiological, or behavioral feature for survival',
      },
      {
        label: 'Conservation',
        value: 'Protection of species, habitat, and genetic diversity',
      },
    ],
    [
      'Adaptations are habitat-specific.',
      'Bioaccumulation and biomagnification are common pollution concepts.',
      'Habitat loss is a major cause of biodiversity decline.',
      'Protected areas are examples of in-situ conservation.',
    ],
    [
      'Confusing adaptation with acclimatization.',
      'Mixing bioaccumulation and biomagnification.',
      'Forgetting habitat protection in conservation.',
    ],
    [
      'Not linking pollutant with effect.',
      'Ignoring examples from Nepal when relevant.',
      'Mixing conservation methods.',
    ],
  ),
  'mat::verbal reasoning': chapterGuide(
    'Verbal Reasoning includes analogy, classification, series completion, coding-decoding, blood relation, direction sense, logical arrangement, statements, cause-effect, and assertion-reason.',
    [
      'The key is relationship recognition, not memorization.',
      'Convert words into structure: pair relation, code shift, family tree, direction map, or statement logic.',
      'Do not use outside knowledge in statement-based reasoning unless the question demands common facts.',
    ],
    [
      {
        label: 'Analogy',
        value:
          'Find relationship: tool-user, part-whole, cause-effect, class-member, synonym/antonym',
      },
      {
        label: 'Coding',
        value:
          'Check letter shift, reverse order, position value, alternate letters',
      },
      {
        label: 'Blood relation',
        value: 'Draw family tree; do not assume gender',
      },
      {
        label: 'Direction',
        value:
          'Draw compass and trace turns from the person’s facing direction',
      },
    ],
    [
      'Relationship must match exactly, not just topic.',
      'Check every letter in coding-decoding.',
      'Rough diagrams save time in relation and direction questions.',
      'In statements, accept given information as true.',
    ],
    [
      'Matching analogy by subject instead of relation.',
      'Applying code to first letter only.',
      'Confusing left/right after direction change.',
    ],
    [
      'Solving relation questions mentally when diagram is needed.',
      'Ignoring words like not, except, only, all, some.',
      'Rushing similar options.',
    ],
  ),
  'mat::numerical reasoning': chapterGuide(
    'Numerical Reasoning covers number series, alphabet-number series, missing number, fractions, ratio, percentage, average, arithmetic reasoning, data interpretation, and quantitative comparison.',
    [
      'Use pattern order: difference -> multiplication/division -> square/cube/prime -> alternate pattern -> mixed operation.',
      'For arithmetic, identify the base quantity before calculating.',
      'For data interpretation, read the question first, then only the needed data.',
    ],
    [
      {
        label: 'Series',
        value:
          'Check difference, second difference, multiplication, squares/cubes, alternate terms',
      },
      { label: 'Percentage', value: 'Percent = per 100; always identify base' },
      { label: 'Ratio', value: 'Same units before comparison' },
      { label: 'Average', value: 'Average = total/number' },
      {
        label: 'DI',
        value: 'Question first, relevant data second, calculation last',
      },
    ],
    [
      'Verify pattern with all terms.',
      'Approximation is useful when options are far apart.',
      'Percentage increase/decrease base changes the answer.',
      'Quantitative comparison may not require full calculation.',
    ],
    [
      'Deciding pattern after two terms.',
      'Using wrong base in percentage.',
      'Reading entire chart before reading question.',
    ],
    [
      'Arithmetic slips under time pressure.',
      'Ignoring units.',
      'Not checking alternate series.',
    ],
  ),
  'mat::logical sequencing': chapterGuide(
    'Logical Sequencing covers arrangements, ranking/order, event sequence, calendar/time sequence, pattern logic, syllogism, assumptions, arguments, and deductive reasoning.',
    [
      'Translate text into positions, tables, or Venn diagrams.',
      'Ranking questions often use total = rank from one side + rank from opposite side - 1.',
      'Syllogism must be solved from the statements only.',
    ],
    [
      {
        label: 'Ranking',
        value: 'Total = left/top rank + right/bottom rank - 1',
      },
      {
        label: 'Arrangement',
        value: 'Use table slots; place fixed clues first',
      },
      {
        label: 'Calendar',
        value: 'Normal year 1 odd day; leap year 2 odd days',
      },
      {
        label: 'Syllogism',
        value: 'All = subset; Some = overlap; No = separate',
      },
    ],
    [
      'Draw before solving complex arrangements.',
      'Use only statement information in syllogism.',
      'Calendar questions depend on odd days and leap-year rules.',
      'Deductive reasoning rewards certainty, not possibility unless asked.',
    ],
    [
      'Forgetting minus one in rank formula.',
      'Using outside knowledge in syllogism.',
      'Confusing assumption with conclusion.',
    ],
    [
      'Not making a table.',
      'Overlooking negative clues.',
      'Mixing possible and definite conclusions.',
    ],
  ),
  'mat::spatial relation / abstract reasoning': chapterGuide(
    'Spatial and Abstract Reasoning covers figure series, completion, mirror/water image, paper folding, embedded figure, matrix pattern, rotation, shape position, and pattern recognition.',
    [
      'Track one feature at a time: number, position, direction, rotation, shading, size, and missing part.',
      'Mirror image reverses left-right; water image reverses top-bottom.',
      'Matrix questions may work row-wise, column-wise, or diagonally.',
    ],
    [
      {
        label: 'Figure series',
        value: 'Observe rotation, movement, number, shading, size',
      },
      { label: 'Mirror image', value: 'Left-right reversal' },
      { label: 'Water image', value: 'Top-bottom reversal' },
      {
        label: 'Matrix',
        value: 'Check row, column, diagonal, addition/removal of elements',
      },
      {
        label: 'Embedded figure',
        value: 'Match unique angle/line and ignore extra lines',
      },
    ],
    [
      'Predict next figure before checking options.',
      'Separate each changing feature.',
      'Paper folding needs fold order and punch/cut symmetry.',
      'Rotation direction must be checked carefully.',
    ],
    [
      'Choosing a similar-looking but incorrectly oriented option.',
      'Confusing mirror and water image.',
      'Checking only row pattern in matrix.',
    ],
    [
      'Trying to process the whole figure at once.',
      'Ignoring shading changes.',
      'Not practicing visual questions regularly.',
    ],
  ),
}

function chapterGuide(
  overview: string,
  focus: string[],
  keyItems: OneShotKeyItem[],
  remember: string[],
  traps: string[],
  mistakes: string[],
): ChapterGuide {
  return { overview, focus, keyItems, remember, traps, mistakes }
}

const generatedSyllabusNotes = buildSyllabusOneShotNotes(starterOneShotNotes)

export const oneShotNotes: OneShotNote[] = [
  ...starterOneShotNotes,
  ...generatedSyllabusNotes,
]

function getGeneratedProfile(
  title: string,
  subject: OneShotSubject,
  chapter: string,
  keyType: OneShotKeySectionType,
): GeneratedProfile {
  const text = `${title} ${chapter}`.toLowerCase()
  const chapterGuide = getChapterGuide(subject, chapter)
  const source =
    subject === 'Physics'
      ? physicsProfiles.find((profile) =>
          profile.match.some((word) => text.includes(word)),
        )
      : subject === 'Chemistry'
        ? chemistryProfiles.find((profile) =>
            profile.match.some((word) => text.includes(word)),
          )
        : subject === 'MAT'
          ? matProfiles.find((profile) =>
              profile.match.some((word) => text.includes(word)),
            )
          : biologyProfiles.find((profile) =>
              profile.match.some((word) => text.includes(word)),
            )

  const fallbackRemember = getFallbackRemember(title, subject, chapter)
  const sourceRemember = source?.remember ?? fallbackRemember
  const remember = uniqueText([
    ...(chapterGuide?.focus ?? []),
    ...(chapterGuide?.remember ?? []),
    ...sourceRemember,
  ]).slice(0, 9)
  const traps = uniqueText([
    ...(chapterGuide?.traps ?? []),
    ...(source?.traps ?? getFallbackTraps(title, subject)),
  ]).slice(0, 7)
  const sourceKeyItems =
    source && 'formulas' in source
      ? source.formulas
      : (source?.items ?? getFallbackKeyItems(title, subject, chapter, keyType))
  const keyItems = uniqueKeyItems([
    ...(chapterGuide?.keyItems ?? []),
    ...sourceKeyItems,
  ]).slice(0, 9)
  const mistakes = uniqueText([
    ...(chapterGuide?.mistakes ?? []),
    ...getFallbackMistakes(title, subject),
  ]).slice(0, 6)

  return {
    concept: withChapterOverview(
      getProfileConcept(title, subject, chapter),
      chapterGuide,
    ),
    whyItMatters: withChapterOverview(
      getProfileWhy(title, subject, chapter),
      chapterGuide,
    ),
    mustRemember: remember,
    diagram: getProfileDiagram(title, subject, chapter, chapterGuide),
    keyItems,
    traps,
    mistakes,
    finalRevision: getProfileFinal(
      title,
      subject,
      chapter,
      remember,
      chapterGuide,
    ),
    mcqs: getProfileMcqs(title, subject, chapter, remember, chapterGuide),
  }
}

function getChapterGuide(subject: OneShotSubject, chapter: string) {
  return chapterGuides[
    `${subjectToSlug(subject)}::${normalizeChapter(chapter)}`
  ]
}

function normalizeChapter(chapter: string) {
  return chapter
    .replace(/^[^:]+:\s*/, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueText(items: string[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function uniqueKeyItems(items: OneShotKeyItem[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${item.label.toLowerCase()}::${item.value.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function withChapterOverview(value: string, chapterGuide?: ChapterGuide) {
  if (!chapterGuide) return value
  return `${value} ${chapterGuide.overview}`
}

function getProfileConcept(
  title: string,
  subject: OneShotSubject,
  chapter: string,
) {
  if (subject === 'Physics') {
    return `${title} is part of ${chapter}. For CEE, study it as a compact problem-solving unit: definition, formula, SI unit, graph or direction rule, and the standard numerical pattern. The aim is not long derivation; it is fast recognition of which relation applies.`
  }

  if (subject === 'Chemistry') {
    return `${title} belongs to ${chapter}. For CEE, revise the definition, main equation or trend, important exception, reagent/test if present, and the exact observation or condition that separates close options.`
  }

  if (subject === 'MAT') {
    return `${title} is a reasoning pattern used in the MAT section. The scoring method is to identify the rule, test it on the full question, eliminate look-alike options, and avoid spending too long on one item.`
  }

  return `${title} belongs to ${chapter}. For CEE Biology, revise it through one-line meaning, diagram labels, examples, function, sequence, and common confusion. Keep recall visual and table-based because Biology options often differ by one term.`
}

function getProfileWhy(
  title: string,
  subject: OneShotSubject,
  chapter: string,
) {
  if (subject === 'Physics') {
    return `CEE usually asks ${title} through direct formula use, conceptual comparison, graph reading, unit checking, or a short numerical from ${chapter}.`
  }

  if (subject === 'Chemistry') {
    return `CEE can ask ${title} as a factual line, trend, exception, product, reagent, observation, formula, or small numerical. It is high-value because one remembered condition often decides the answer.`
  }

  if (subject === 'MAT') {
    return `${title} is valuable because MAT marks are usually faster than science marks when the pattern is familiar. Repeated practice builds speed and protects rank.`
  }

  return `CEE commonly tests ${title} through diagrams, examples, classification, process order, source-function pairs, disease/organism tables, or hormone/enzyme/action matching from ${chapter}.`
}

function getProfileDiagram(
  title: string,
  subject: OneShotSubject,
  chapter: string,
  chapterGuide?: ChapterGuide,
) {
  const chapterFlow = chapterGuide
    ? ` Chapter focus -> ${chapterGuide.focus.slice(0, 2).join(' -> ')}.`
    : ''

  if (subject === 'Physics') {
    return `${title} MCQ -> list given values -> convert units -> choose formula from ${chapter} -> substitute -> check sign/direction -> estimate option.${chapterFlow}`
  }

  if (subject === 'Chemistry') {
    return `${title} -> definition/trend/test -> reagent or condition -> product/observation/exception -> compare options.${chapterFlow}`
  }

  if (subject === 'MAT') {
    return `${title} question -> observe one feature -> form rule -> test all terms/figures -> eliminate traps -> mark only after verification.${chapterFlow}`
  }

  return `${title} -> definition -> diagram/example -> source or structure -> function/process -> exception/trap -> final recall.${chapterFlow}`
}

function getProfileFinal(
  title: string,
  subject: OneShotSubject,
  chapter: string,
  remember: string[],
  chapterGuide?: ChapterGuide,
) {
  const core = remember.slice(0, 2).join(' ')
  const chapterClose = chapterGuide
    ? ` Chapter checklist: ${chapterGuide.keyItems
        .slice(0, 3)
        .map((item) => item.label)
        .join(', ')}.`
    : ''

  if (subject === 'Physics') {
    return `${title}: revise the formula set, SI units, assumptions, and one standard numerical from ${chapter}. ${core}${chapterClose}`
  }

  if (subject === 'Chemistry') {
    return `${title}: revise the rule, exception, reagent/test/formula, and observation from ${chapter}. ${core}${chapterClose}`
  }

  if (subject === 'MAT') {
    return `${title}: use a fixed solving order, verify the rule on the full question, and skip if it starts consuming time. ${core}${chapterClose}`
  }

  return `${title}: revise the one-line meaning, diagram or flow, examples, function, and common confusion from ${chapter}. ${core}${chapterClose}`
}

function getProfileMcqs(
  title: string,
  subject: OneShotSubject,
  chapter: string,
  remember: string[],
  chapterGuide?: ChapterGuide,
): OneShotMcq[] {
  const slug = slugify(title)
  const firstPoint = remember[0] ?? `Revise the main idea of ${title}.`
  const trapPoint = getFallbackTraps(title, subject)[0]
  const chapterPoint = chapterGuide?.keyItems[0]

  if (subject === 'Physics') {
    return [
      {
        id: `${slug}-concept`,
        question: `While solving a ${title} MCQ, what should be checked before substituting values?`,
        optionA: 'Only the final option',
        optionB: 'Formula condition and SI units',
        optionC: 'The longest option',
        optionD: 'Whether the topic is theoretical',
        answer: 'B',
        explanation:
          'Most CEE Physics mistakes come from using the right formula with wrong condition, unit, or sign.',
      },
      {
        id: `${slug}-chapter-focus`,
        question: `Which chapter-level point is most useful while revising ${title}?`,
        optionA: chapterPoint?.value ?? firstPoint,
        optionB: 'Ignore units and formulas',
        optionC: 'Read only the option labels',
        optionD: 'Avoid diagrams completely',
        answer: 'A',
        explanation: chapterPoint
          ? `${chapterPoint.label}: ${chapterPoint.value}`
          : firstPoint,
      },
      {
        id: `${slug}-chapter`,
        question: `${title} is best revised under which CEE Physics area?`,
        optionA: chapter,
        optionB: 'Organic Chemistry',
        optionC: 'Plant Anatomy',
        optionD: 'Verbal Reasoning',
        answer: 'A',
        explanation: `${title} appears in the ${chapter} part of the CEE syllabus map.`,
      },
      {
        id: `${slug}-trap`,
        question: `Which revision habit is most useful for ${title}?`,
        optionA: 'Memorize symbols without units',
        optionB: 'Avoid numerical practice',
        optionC: firstPoint,
        optionD: 'Ignore sign convention',
        answer: 'C',
        explanation: firstPoint,
      },
    ]
  }

  if (subject === 'Chemistry') {
    return [
      {
        id: `${slug}-condition`,
        question: `In ${title}, what often changes the correct CEE answer?`,
        optionA: 'Reagent, condition, trend, or exception',
        optionB: 'Question font size',
        optionC: 'Only the option order',
        optionD: 'Ignoring observations',
        answer: 'A',
        explanation:
          'Chemistry MCQs often depend on exact condition, exception, reagent, product, or observation.',
      },
      {
        id: `${slug}-chapter-focus`,
        question: `Which chapter-level recall point helps most in ${title}?`,
        optionA: chapterPoint?.value ?? firstPoint,
        optionB: 'Ignore reagent or observation',
        optionC: 'Memorize no exceptions',
        optionD: 'Skip balanced equations forever',
        answer: 'A',
        explanation: chapterPoint
          ? `${chapterPoint.label}: ${chapterPoint.value}`
          : firstPoint,
      },
      {
        id: `${slug}-chapter`,
        question: `${title} belongs to which syllabus area?`,
        optionA: chapter,
        optionB: 'Human Physiology',
        optionC: 'Circular Motion',
        optionD: 'Figure Series',
        answer: 'A',
        explanation: `${title} is listed under ${chapter} in the MEDQAS CEE syllabus map.`,
      },
      {
        id: `${slug}-trap`,
        question: `Which mistake should be avoided in ${title}?`,
        optionA: trapPoint,
        optionB: 'Reading the question carefully',
        optionC: 'Checking exceptions',
        optionD: 'Balancing equations when needed',
        answer: 'A',
        explanation: trapPoint,
      },
    ]
  }

  if (subject === 'MAT') {
    return [
      {
        id: `${slug}-method`,
        question: `What is the best method for ${title} in MAT?`,
        optionA: 'Guess immediately',
        optionB: 'Find the rule and verify it on the full question',
        optionC: 'Use science formulas',
        optionD: 'Spend unlimited time',
        answer: 'B',
        explanation:
          'MAT rewards fast rule recognition plus verification, not blind guessing.',
      },
      {
        id: `${slug}-chapter-focus`,
        question: `For ${title}, which chapter-level strategy is most useful?`,
        optionA: chapterPoint?.value ?? firstPoint,
        optionB: 'Guess without checking',
        optionC: 'Avoid rough work always',
        optionD: 'Spend unlimited time',
        answer: 'A',
        explanation: chapterPoint
          ? `${chapterPoint.label}: ${chapterPoint.value}`
          : firstPoint,
      },
      {
        id: `${slug}-trap`,
        question: `What is a common trap in ${title}?`,
        optionA: trapPoint,
        optionB: 'Drawing rough work when needed',
        optionC: 'Checking all terms',
        optionD: 'Moving on from a time-consuming item',
        answer: 'A',
        explanation: trapPoint,
      },
      {
        id: `${slug}-chapter`,
        question: `${title} belongs to which MAT area?`,
        optionA: chapter,
        optionB: 'Thermodynamics',
        optionC: 'Plant Physiology',
        optionD: 'Inorganic Chemistry',
        answer: 'A',
        explanation: `${title} is grouped under ${chapter} in the MAT syllabus map.`,
      },
    ]
  }

  return [
    {
      id: `${slug}-recall`,
      question: `For ${title}, what should you revise first for CEE Biology?`,
      optionA: 'One-line meaning, example, and function',
      optionB: 'Only very advanced university theory',
      optionC: 'Unrelated formulas',
      optionD: 'Random facts without diagrams',
      answer: 'A',
      explanation:
        'Biology MCQs are easier when definition, example, function, and diagram labels are clear.',
    },
    {
      id: `${slug}-chapter-focus`,
      question: `Which chapter-level recall point supports ${title}?`,
      optionA: chapterPoint?.value ?? firstPoint,
      optionB: 'Ignore diagrams and examples',
      optionC: 'Only memorize spelling',
      optionD: 'Skip functions and sequence',
      answer: 'A',
      explanation: chapterPoint
        ? `${chapterPoint.label}: ${chapterPoint.value}`
        : firstPoint,
    },
    {
      id: `${slug}-chapter`,
      question: `${title} is most closely connected with which Biology area?`,
      optionA: chapter,
      optionB: 'Current Electricity',
      optionC: 'Coding-Decoding',
      optionD: 'Chemical Kinetics',
      answer: 'A',
      explanation: `${title} appears under ${chapter} in the CEE syllabus map.`,
    },
    {
      id: `${slug}-trap`,
      question: `Which CEE trap should be avoided in ${title}?`,
      optionA: trapPoint,
      optionB: 'Using diagrams for recall',
      optionC: 'Remembering examples',
      optionD: 'Checking sequence order',
      answer: 'A',
      explanation: trapPoint,
    },
  ]
}

function getFallbackRemember(
  title: string,
  subject: OneShotSubject,
  chapter: string,
) {
  if (subject === 'Physics') {
    return [
      `Know the definition and condition for ${title}.`,
      'Write formula with SI units before solving.',
      'Check whether the quantity is scalar or vector.',
      `Practice one short numerical from ${chapter}.`,
    ]
  }

  if (subject === 'Chemistry') {
    return [
      `Connect ${title} with its main rule, formula, reaction, or test.`,
      'Write the important exception beside the rule.',
      'Remember reagent/condition/observation together when applicable.',
      `Compare ${title} with nearby topics from ${chapter}.`,
    ]
  }

  if (subject === 'MAT') {
    return [
      `Use a fixed solving order for ${title}.`,
      'Verify the pattern with all given terms or figures.',
      'Use rough work for relations, ranking, direction, and arrangement.',
      'Skip and return if the answer is not visible quickly.',
    ]
  }

  return [
    `Know the definition and example of ${title}.`,
    'Use diagrams, tables, or flowcharts for recall.',
    'Remember source, function, sequence, and exception.',
    `Link ${title} with other facts in ${chapter}.`,
  ]
}

function getFallbackTraps(title: string, subject: OneShotSubject) {
  if (subject === 'Physics') {
    return [
      `Applying a ${title} formula without checking condition or units.`,
      'Ignoring direction, sign convention, or graph slope.',
      'Selecting an option without estimating the answer range.',
    ]
  }

  if (subject === 'Chemistry') {
    return [
      `Confusing the general rule of ${title} with its exception.`,
      'Ignoring reagent, medium, temperature, or observation.',
      'Comparing mass directly when mole ratio is required.',
    ]
  }

  if (subject === 'MAT') {
    return [
      `Accepting the first visible ${title} pattern without verification.`,
      'Missing keywords such as not, except, left, right, clockwise, or opposite.',
      'Spending too long on one question.',
    ]
  }

  return [
    `Memorizing ${title} without example, function, or diagram context.`,
    'Mixing similar biological terms in options.',
    'Forgetting sequence order in process-based questions.',
  ]
}

function getFallbackMistakes(title: string, subject: OneShotSubject) {
  if (subject === 'Physics') {
    return [
      `Reading ${title} passively without solving MCQs.`,
      'Forgetting unit conversion.',
      'Not writing given and required quantities before calculation.',
    ]
  }

  if (subject === 'Chemistry') {
    return [
      `Revising ${title} without exceptions or observations.`,
      'Not balancing equations before stoichiometry.',
      'Mixing similar reagents, tests, or periodic trends.',
    ]
  }

  if (subject === 'MAT') {
    return [
      `Overthinking a simple ${title} pattern.`,
      'Not drawing rough diagrams where needed.',
      'Guessing before eliminating options.',
    ]
  }

  return [
    `Writing long notes for ${title} instead of recall points.`,
    'Forgetting examples and labels.',
    'Mixing source, structure, function, and product.',
  ]
}

function getFallbackKeyItems(
  title: string,
  subject: OneShotSubject,
  chapter: string,
  type: OneShotKeySectionType,
): OneShotKeyItem[] {
  if (type === 'formula') {
    return [
      { label: 'Topic', value: title, note: chapter },
      {
        label: 'Formula habit',
        value: 'Write known values, unknown value, formula, and SI unit.',
      },
      {
        label: 'Graph habit',
        value: 'Check slope, area, intercept, and sign where graphs appear.',
      },
      {
        label: 'Numerical habit',
        value: 'Estimate answer before selecting the option.',
      },
    ]
  }

  if (type === 'reaction') {
    return [
      { label: 'Conversion', value: `Identify what ${title} changes into.` },
      { label: 'Reagent', value: 'Write reagent with condition and medium.' },
      {
        label: 'Observation',
        value: 'Color change, precipitate, gas, or product must be remembered.',
      },
      { label: 'Exception', value: 'Write special cases separately.' },
    ]
  }

  if (type === 'shortcut') {
    return [
      { label: 'Observe', value: 'Find the visible relation or movement.' },
      { label: 'Test', value: 'Verify the rule on every term or figure.' },
      { label: 'Eliminate', value: 'Remove options that break the rule.' },
      {
        label: 'Time control',
        value: 'Move on if the pattern is not clear quickly.',
      },
    ]
  }

  if (subject === 'Biology') {
    return [
      { label: 'Definition', value: `One-line meaning of ${title}.` },
      { label: 'Example', value: 'Remember two standard CEE-level examples.' },
      {
        label: 'Function/process',
        value: `Connect ${title} with its role in ${chapter}.`,
      },
      {
        label: 'Diagram hook',
        value: 'Attach the idea to one label, flow, or table.',
      },
    ]
  }

  return [
    { label: 'Topic', value: title },
    { label: 'Chapter', value: chapter },
    {
      label: 'Exam use',
      value: 'Direct concept check and close-option elimination.',
    },
    {
      label: 'Revision action',
      value: 'Turn the note into 3 flashcard questions.',
    },
  ]
}

function getGeneratedConcept(
  title: string,
  subject: OneShotSubject,
  chapter: string,
) {
  return getGeneratedProfile(
    title,
    subject,
    chapter,
    getGeneratedKeyType(subject, chapter),
  ).concept
}

function getGeneratedWhyItMatters(
  title: string,
  subject: OneShotSubject,
  chapter: string,
) {
  return getGeneratedProfile(
    title,
    subject,
    chapter,
    getGeneratedKeyType(subject, chapter),
  ).whyItMatters
}

function getGeneratedMustRemember(
  title: string,
  subject: OneShotSubject,
  chapter: string,
) {
  return getGeneratedProfile(
    title,
    subject,
    chapter,
    getGeneratedKeyType(subject, chapter),
  ).mustRemember
}

function getGeneratedDiagram(title: string, subject: OneShotSubject) {
  return getGeneratedProfile(
    title,
    subject,
    '',
    getGeneratedKeyType(subject, ''),
  ).diagram
}

function getGeneratedKeySectionTitle(subject: OneShotSubject) {
  if (subject === 'Physics') return 'Formula and unit focus'
  if (subject === 'Chemistry') return 'Reaction, trend, or table focus'
  if (subject === 'MAT') return 'Shortcut and solving order'
  return 'Process and function focus'
}

function getGeneratedKeyItems(
  title: string,
  subject: OneShotSubject,
  chapter: string,
  type: OneShotKeySectionType,
): OneShotKeyItem[] {
  return getGeneratedProfile(title, subject, chapter, type).keyItems
}

function getGeneratedTraps(title: string, subject: OneShotSubject) {
  return getGeneratedProfile(
    title,
    subject,
    '',
    getGeneratedKeyType(subject, ''),
  ).traps
}

function getGeneratedMistakes(title: string, subject: OneShotSubject) {
  return getGeneratedProfile(
    title,
    subject,
    '',
    getGeneratedKeyType(subject, ''),
  ).mistakes
}

function getGeneratedFinalRevision(
  title: string,
  subject: OneShotSubject,
  chapter: string,
) {
  return getGeneratedProfile(
    title,
    subject,
    chapter,
    getGeneratedKeyType(subject, chapter),
  ).finalRevision
}

function getGeneratedMcqs(
  title: string,
  subject: OneShotSubject,
  chapter: string,
): OneShotMcq[] {
  return getGeneratedProfile(
    title,
    subject,
    chapter,
    getGeneratedKeyType(subject, chapter),
  ).mcqs
}
