<h1 align="center">🚀 MEDQAS</h1>

<p align="center">
 MEDQAS — focused medical MCQ practice with AI assistance
</p>

<div align="center">

<img alt="GitHub License" src="https://img.shields.io/github/license/michaeltroya/supa-next-starter">

  <a href="https://twitter.com/intent/follow?screen_name=michaeltroya_">
   <img alt="X (formerly Twitter) Follow" src="https://img.shields.io/twitter/follow/michaeltroya_">
  </a>
</div>

<div align="center">
  <sub>Created by <a href="https://twitter.com/michaeltroya_">Michael Troya</a>
</div>

<br/>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#quickstart"><strong>Quickstart</strong></a> ·
  <a href="#documentation"><strong>Documentation</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
</p>
<br/>

## Features

- ⚡️ Next.js 14 (App Router)
- 🔐 Supabase authentication and database
- ⚛️ React 18
- ⛑ TypeScript
- 📦 [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- 🎨 [Tailwind](https://tailwindcss.com/)
- 🔌 [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components that you can copy and paste into your apps.
- 🧪 Jest w/SWC + React Testing Library - Unit tests for all of your code.
- 🎛️ [MSW](https://mswjs.io/)v2 - Intercept requests inside your tests (set up for testing only)
- 🪝[TanStackQuery](https://tanstack.com/query/v5)v5 - The best way to fetch data on the client
- 📏 ESLint — To find and fix problems in your code
- 💖 Prettier — Code Formatter for consistent style
- 🐶 Husky — For running scripts before committing
- 🚫 lint-staged — Run ESLint and Prettier against staged Git files
- 👷 Github Actions — Run Type Checks, Tests, and Linters on Pull Requests
- 🗂 Path Mapping — Import components or images using the `@` prefix
- ⚪⚫ Dark mode - Toggle theme modes with [next-themes](https://github.com/pacocoursey/next-themes)
- ✨ Next Top Loader - Render a pleasent top loader on navigation with [nextjs-toploader](https://github.com/TheSGJ/nextjs-toploader)
- 🔋 Lots Extras - Next Bundle Analyzer, Vercel Analytics, Vercel Geist Font

## Quickstart

1) Prerequisites

- Node.js >= 18.17.0
- pnpm 8
- A Supabase project (free tier works).

2) Configure environment

Create `.env.local` in the project root (do not commit). Minimal example:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optional: set an initial admin for the seed script

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecret
```

3) Install and run

```bash
pnpm install
pnpm dev
```

The app will be available at http://localhost:3000.

4) Seed an admin user

```powershell
$env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="supersecret"; node scripts/seed-admin.js
```

Alternatively, set ADMIN_EMAIL and ADMIN_PASSWORD in `.env.local` and simply run:

```bash
node scripts/seed-admin.js
```

5) Log in

- Visit /login and use the seeded credentials.
- Or POST to /api/auth/login with JSON `{ "email": "admin@example.com", "password": "supersecret" }`.
  Successful login returns a JWT; the app stores it client-side and may set an HttpOnly cookie when enabled.

## Showcase

MEDQAS is built from a Next.js starter. This repository contains the MEDQAS application code.

## Documentation

### Requirements

- Node.js >= 18.17.0
- pnpm 8

### Scripts

- `pnpm dev` — Starts the application in development mode at `http://localhost:3000`.
- `pnpm build` — Creates an optimized production build of your application.
- `pnpm start` — Starts the application in production mode.
- `pnpm type-check` — Validate code using TypeScript compiler.
- `pnpm lint` — Runs ESLint for all files in the `src` directory.
- `pnpm format-check` — Runs Prettier and checks if any files have formatting issues.
- `pnpm format` — Runs Prettier and formats files.
- `pnpm test` — Runs all the jest tests in the project.
- `pnpm test:ci` — Runs all the jest tests in the project, Jest will assume it is running in a CI environment.
- `pnpm analyze` — Builds the project and opens the bundle analyzer.

### Auth overview

- Email/password auth with Supabase (issued at `POST /api/auth/login`).
- User data stored in Supabase `auth.users` and `public.profiles` table.
- Admin-only user management at `/admin/users` backed by `/api/profiles`.

Environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` — required. Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required. Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY` — required. Supabase service role key.

Note: JWT auth has been removed in favor of Supabase.

### Paths

TypeScript is pre-configured with custom path mappings. To import components or files, use the `@` prefix.

```tsx
import { Button } from '@/components/ui/Button'

// To import images or other files from the public folder
import avatar from '@/public/avatar.png'
```

### Switch to Yarn/npm

This project uses pnpm by default, but you can switch to Yarn/npm. Delete `pnpm-lock.yaml`, reinstall, and update any CI/Husky commands accordingly.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for more information.

## Feedback and issues

Please file feedback and issues in this repository.
