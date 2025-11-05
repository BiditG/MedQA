'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/tailwind'

export function NavLink({
  href,
  icon: Icon,
  label,
  onClick,
  disabled,
  trailing,
}: {
  href: string
  icon?: any
  label: string
  onClick?: () => void
  disabled?: boolean
  trailing?: React.ReactNode
}) {
  const pathname = usePathname()
  const active = pathname === href
  const baseClass = cn(
    'group flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50',
    active
      ? 'border-primary/20 bg-primary/10 text-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-primary/5',
    disabled ? 'opacity-60' : '',
  )

  if (disabled) {
    return (
      <li>
        <button onClick={onClick} className={baseClass} aria-disabled>
          <div className="flex items-center gap-3">
            {Icon ? (
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-md p-1',
                  active
                    ? 'bg-gradient-to-br from-primary/30 to-accent/30'
                    : 'bg-primary/10',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    active ? 'text-primary' : 'text-foreground/70',
                  )}
                  aria-hidden
                />
              </span>
            ) : null}
            <span
              className={cn(
                'underline-animate truncate',
                active && 'underline-animate--active',
              )}
            >
              {label}
            </span>
          </div>
          {trailing && <div className="ml-3">{trailing}</div>}
        </button>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={baseClass}
      >
        <div className="flex items-center gap-3">
          {Icon ? (
            <Icon
              className={cn(
                'h-4 w-4',
                active
                  ? 'text-primary'
                  : 'text-foreground/70 group-hover:text-foreground',
              )}
              aria-hidden
            />
          ) : null}
          <span
            className={cn(
              'underline-animate truncate',
              active && 'underline-animate--active',
            )}
          >
            {label}
          </span>
        </div>
        {trailing && <div className="ml-3">{trailing}</div>}
      </Link>
    </li>
  )
}
