'use client'

import { Suspense } from 'react'

function ResetPasswordInner() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-3 rounded-lg bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Password resets are handled by administrators. Please contact the site
          administrator to reset your password.
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  )
}
