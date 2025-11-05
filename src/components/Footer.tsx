'use client'

import Link from 'next/link'
import { Instagram, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* About */}
        <section className="rounded-lg bg-card p-6">
          <h2 className="heading-gradient mb-2 text-sm font-semibold tracking-wide">
            About MEDQAS
          </h2>
          <div className="space-y-2 text-xs leading-6 text-muted-foreground">
            <p>
              MEDQAS is a personal project developed by former medical aspirants
              who are now working in the field of AI. Our platform is designed
              to provide comprehensive support for entrance exam preparation and
              to offer reliable, up-to-date medical knowledge. With a focus on
              MCQs, we aim to help students and healthcare professionals master
              key concepts and excel in their exams.
            </p>
            <p>
              We leverage cutting-edge AI technology to provide intelligent,
              AI-generated content that adapts to your learning needs. Whether
              you&apos;re preparing for medical entrance exams or just looking
              to enhance your medical knowledge, MEDQAS is here to help you
              achieve your goals.
            </p>
            <p>
              We are not a registered business yet; instead, we are a
              community-driven initiative, and every contribution goes directly
              toward ensuring the sustainability and future of this platform.
              Thank you for supporting our mission!
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-lg bg-card p-6">
          <h2 className="heading-gradient mb-3 text-sm font-semibold tracking-wide">
            Get in Touch
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-foreground" aria-hidden />
              <a
                className="text-foreground underline"
                href="mailto:medqas.np@gmail.com"
              >
                medqas.np@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-foreground" aria-hidden />
              <div className="flex flex-wrap items-center gap-x-3">
                <a
                  className="text-foreground underline"
                  href="tel:+9779803526374"
                >
                  +977 9803526374
                </a>
                <a
                  className="text-foreground underline"
                  href="tel:+9779869031319"
                >
                  +977 9869031319
                </a>
                <a
                  className="text-foreground underline"
                  href="tel:+9779761806844"
                >
                  +977 9761806844
                </a>
              </div>
            </li>
          </ul>
        </section>

        {/* Social */}
        <section className="rounded-lg bg-card p-6">
          <h2 className="heading-gradient mb-3 text-sm font-semibold tracking-wide">
            Follow Us
          </h2>
          <Link
            className="accent-link inline-flex items-center gap-2 text-sm"
            href="https://www.instagram.com/medqas.np?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="h-4 w-4" aria-hidden />
            <span>@medqas.np</span>
          </Link>
        </section>

        <div className="text-center text-xs text-muted-foreground">
          © 2025 MEDQAS. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
