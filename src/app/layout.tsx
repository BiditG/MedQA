import { GeistSans } from 'geist/font/sans'
import ThemeProvider from '@/providers/ThemeProvider'
import Script from 'next/script'
import NextTopLoader from 'nextjs-toploader'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { AppShell } from '@/components/navigation/AppShell'
import Footer from '@/components/Footer'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'MEDQAS: AI‑Powered All‑in‑One Medical Learning Platform',
    template: '%s | MEDQAS',
  },
  description:
    'MEDQAS is Nepal’s all-in-one medical learning app: practice MCQs, explore a Nepali disease glossary, and track your progress to boost exam success.',
  openGraph: {
    title: 'MEDQAS: AI‑Powered All‑in‑One Medical Learning Platform',
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
    title: 'MEDQAS: AI‑Powered All‑in‑One Medical Learning Platform',
    description:
      'MCQ practice, Nepali glossary, and progress tracking — MEDQAS helps Nepali medical students master exams faster.',
    images: [`${defaultUrl}/opengraph-image.png`],
  },
  icons: {
    icon: '/data/logo.jpg',
    shortcut: '/data/logo.jpg',
    apple: '/data/logo.jpg',
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
    'CEE questions',
    'CEE MCQs',
    'CEE entrance prep',
    'free MCQs entrance',
    'entrance exam MCQs',
    'MEDQAS',
    'AIIMS MCQs',
    'NEET PG MCQs',
    'medical exam questions',
    'Nepal medical entrance',
    'free medical MCQs',
    'entrance preparation',
    'medical quiz',
    'online medical questions',
    'Nepal doctor exam',
    'Nepali medical entrance',
    'Nepali MCQ practice',
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
      <head>
        <meta
          name="google-site-verification"
          content="03vsygovTI0osOJ9DE7g0rD33dOaNp6__r24cvFMFRM"
        />
        {/* favicon and platform meta tags */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="64x64"
          href="/favicon-64x64.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="128x128"
          href="/favicon-128x128.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        {/* Windows tile */}
        <meta name="msapplication-TileColor" content="#2acf80" />
        <meta name="msapplication-TileImage" content="/mstile-150x150.png" />
      </head>
      <body className="bg-background text-foreground">
        {/* Google tag (gtag.js) - Global site tag for Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y1T8QNPR2E"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-Y1T8QNPR2E');`}
        </Script>
        <NextTopLoader showSpinner={false} height={2} color="#2acf80" />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AppShell>
              <main>{children}</main>
              <Footer />
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
