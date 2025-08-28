import * as React from 'react'

export function Separator({ className }: { className?: string }) {
  return (
    <hr
      className={`shrink-0 border-t border-gray-200 dark:border-gray-700 ${
        className || ''
      }`}
    />
  )
}
