'use client'

import { useState } from 'react'
import { cn } from '@/utils/tailwind'
import { Copy } from 'lucide-react'

export function ChatBubble({
  role,
  children,
  className,
  typing = false,
}: {
  role: 'user' | 'assistant' | 'patient'
  children?: React.ReactNode
  className?: string
  typing?: boolean
}) {
  const isUser = role === 'user'
  const isAssistant = role === 'assistant'
  const isPatient = role === 'patient'
  const [copied, setCopied] = useState(false)

  async function copyText() {
    try {
      if (typeof children === 'string') {
        await navigator.clipboard.writeText(children)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }
    } catch {}
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className={cn(
            'mt-1 h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-medium',
            isAssistant &&
              'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            isPatient && 'border-amber-200 bg-amber-50 text-amber-700',
          )}
          aria-hidden
        >
          {isAssistant ? 'AI' : 'P'}
        </div>
      )}

      <div className="relative max-w-[85%]">
        <div
          className={cn(
            'break-words rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'ml-auto border-primary/20 bg-primary/10 text-foreground'
              : isAssistant
                ? 'bg-surface-50 dark:bg-surface-800 border-gray-200 dark:border-gray-700'
                : 'border-emerald-100 bg-emerald-50 text-emerald-800',
            className,
          )}
        >
          {typing ? (
            <span className="inline-flex items-center gap-2 opacity-80">
              <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0.15s]" />
            </span>
          ) : (
            children
          )}
        </div>

        {isAssistant && !typing && (
          <button
            type="button"
            onClick={copyText}
            aria-label={copied ? 'Copied' : 'Copy answer'}
            className="absolute -bottom-7 right-0 inline-flex items-center gap-2 rounded-full bg-muted/30 px-2 py-1 text-xs opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 dark:bg-muted/20"
          >
            <Copy className="h-3 w-3" />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      {isUser && (
        <div
          className="mt-1 h-8 w-8 flex-shrink-0 rounded-full border border-primary/30 bg-primary/20"
          aria-hidden
        />
      )}
    </div>
  )
}
