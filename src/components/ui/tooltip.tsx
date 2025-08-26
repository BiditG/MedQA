import React from 'react'

// Minimal tooltip stub used for builds and simple UIs.
// Replace with a real tooltip implementation (Radix or shadcn) if you need advanced features.
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div>{children}</div>

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="inline-block">{children}</div>

export const TooltipTrigger: React.FC<
  React.ComponentProps<'div'> & { asChild?: boolean }
> = ({ children, asChild, ...props }) => {
  // when asChild is true, consumer expects to render the child directly; we just clone
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, props as any)
  }
  return <div {...(props as any)}>{children}</div>
}

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div role="tooltip" className="rounded bg-muted p-2 text-xs">
    {children}
  </div>
)

export default Tooltip
