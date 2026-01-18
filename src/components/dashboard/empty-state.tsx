import { memo } from 'react'

interface EmptyStateProps {
  message: string
}

export const EmptyState = memo(function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
})
