'use client'

import * as React from 'react'
import { cn } from '@/utils/tailwind'

type SheetContextValue = {
  open: boolean
  setOpen: (v: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  children: React.ReactNode
}) {
  const [internal, setInternal] = React.useState(false)
  const isControlled = typeof open === 'boolean'
  const actualOpen = isControlled ? !!open : internal
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternal(v)
    onOpenChange?.(v)
  }
  const value = React.useMemo(
    () => ({ open: actualOpen, setOpen }),
    [actualOpen, setOpen],
  )
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
}

export function SheetTrigger({
  asChild,
  children,
}: {
  asChild?: boolean
  children: React.ReactElement
}) {
  const ctx = React.useContext(SheetContext)
  if (!ctx) return children
  const props = {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e)
      ctx.setOpen(true)
    },
    'aria-haspopup': 'dialog',
  } as const
  return React.cloneElement(children, props)
}

export function SheetContent({
  side = 'right',
  className,
  children,
}: {
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(SheetContext)
  const panelRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!ctx?.open) return
    const prev = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') ctx.setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [ctx?.open, ctx?.setOpen])
  if (!ctx) return null
  if (!ctx.open) return null
  const sideClasses = {
    right: 'right-0 top-0 h-full w-[90vw] max-w-sm border-l',
    left: 'left-0 top-0 h-full w-[90vw] max-w-sm border-r',
    top: 'left-0 top-0 w-full max-h-[90vh] border-b',
    bottom: 'left-0 bottom-0 w-full max-h-[90vh] border-t',
  }[side]
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'absolute bg-background p-4 shadow-lg outline-none',
          'transition-transform duration-200 ease-out',
          side === 'right' && 'translate-x-0',
          side === 'left' && 'translate-x-0',
          side === 'top' && 'translate-y-0',
          side === 'bottom' && 'translate-y-0',
          sideClasses,
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5 pb-4 pt-1">{children}</div>
}
export function SheetTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-medium leading-none tracking-tight">
      {children}
    </h3>
  )
}
export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}
