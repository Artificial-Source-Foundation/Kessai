import { cn } from '@/lib/utils'

export interface ToggleProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Toggle({
  checked = false,
  onCheckedChange,
  disabled = false,
  size = 'md',
  className,
}: ToggleProps) {
  const sizes = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
  }

  const { track, thumb, translate } = sizes[size]

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200',
        'focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
        track,
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          'translate-x-0.5',
          checked && translate,
          thumb
        )}
        style={{ marginTop: '2px' }}
      />
    </button>
  )
}
