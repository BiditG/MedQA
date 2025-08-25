export function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border p-8 text-center">
      <div className="mb-2 text-xl font-medium">{title}</div>
      {message ? (
        <p className="mb-4 text-sm text-muted-foreground">{message}</p>
      ) : null}
      {action}
    </div>
  )
}
