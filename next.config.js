const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Applies to public/notes/biology/* files
        source: '/notes/biology/:path*',
        headers: [
          // Render inline in the browser instead of forcing download
          { key: 'Content-Disposition', value: 'inline' },
          // Avoid caching sensitive study materials
          { key: 'Cache-Control', value: 'no-store' },
          // Basic clickjacking hardening
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        // Applies to public/notes/chemistry/* files
        source: '/notes/chemistry/:path*',
        headers: [
          // Render inline in the browser instead of forcing download
          { key: 'Content-Disposition', value: 'inline' },
          // Avoid caching sensitive study materials
          { key: 'Cache-Control', value: 'no-store' },
          // Basic clickjacking hardening
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        // Applies to public/notes/physics/* files
        source: '/notes/physics/:path*',
        headers: [
          // Render inline in the browser instead of forcing download
          { key: 'Content-Disposition', value: 'inline' },
          // Avoid caching sensitive study materials
          { key: 'Cache-Control', value: 'no-store' },
          // Basic clickjacking hardening
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
