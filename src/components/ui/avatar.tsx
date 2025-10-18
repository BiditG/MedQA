'use client'

import * as React from 'react'

export const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={`inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  )
})
Avatar.displayName = 'Avatar'

export const AvatarImage = ({
  src,
  alt,
  ...props
}: {
  src?: string | null
  alt?: string
} & React.ImgHTMLAttributes<HTMLImageElement>) => {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt ?? 'avatar'}
      className="h-full w-full object-cover"
      {...props}
    />
  )
}

export const AvatarFallback = ({
  children,
}: {
  children?: React.ReactNode
}) => <div className="text-sm font-medium text-foreground/90">{children}</div>

export default Avatar
