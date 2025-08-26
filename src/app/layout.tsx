import { GeistSans } from 'geist/font/sans'
import ThemeProvider from '@/providers/ThemeProvider'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { AppShell } from '@/components/navigation/AppShell'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'MEDQAS — All-in-One Medical App for Nepali Learners',
    template: '%s | MEDQAS',
  },
  description:
    'MEDQAS is Nepal’s all-in-one medical learning app: practice MCQs, explore a Nepali disease glossary, and track your progress to boost exam success.',
  openGraph: {
    title: 'MEDQAS — All-in-One Medical App for Nepali Students',
    description:
      'Practice thousands of clinical MCQs, learn Nepali disease names, and prepare smarter with MEDQAS — designed for Nepal’s future doctors.',
    url: defaultUrl,
    siteName: 'MEDQAS',
    images: [
      {
        url: `${defaultUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: 'MEDQAS – All-in-One Medical Learning App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MEDQAS — Nepal’s All-in-One Medical App',
    description:
      'MCQ practice, Nepali glossary, and progress tracking — MEDQAS helps Nepali medical students master exams faster.',
    images: [`${defaultUrl}/opengraph-image.png`],
  },
  keywords: [
    'medical app Nepal',
    'Nepali medical students',
    'all in one medical app',
    'practice MCQs',
    'Nepali disease glossary',
    'Nepali medicine learning',
    'medical entrance Nepal',
    'MCQ practice Nepal',
  ],
  authors: [{ name: 'MEDQAS Team' }],
  creator: 'MEDQAS',
  publisher: 'MEDQAS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={GeistSans.className}
      style={{ colorScheme: 'light' }}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        <NextTopLoader showSpinner={false} height={2} color="#2acf80" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AppShell>
              {children}
              <Analytics />{' '}
              {/* ^^ remove this if you are not deploying to vercel. See more at https://vercel.com/docs/analytics  */}
            </AppShell>
            <ReactQueryDevtools initialIsOpen={false} />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
