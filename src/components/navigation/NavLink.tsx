'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/tailwind'

export function NavLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string
  icon?: any
  label: string
  onClick?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50',
          active
            ? 'border-primary/20 bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
        )}
      >
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
        <span className="truncate">{label}</span>
      </Link>
    </li>
  )
}
