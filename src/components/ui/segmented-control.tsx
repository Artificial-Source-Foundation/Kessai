import { cn } from '@/lib/utils'

export interface SegmentedControlOption {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onValueChange: (value: string) => void
  size?: 'sm' | 'md'
  className?: string
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  size = 'md',
  className,
}: SegmentedControlProps) {
  const sizes = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm',
  }

  const buttonSizes = {
    sm: 'px-2.5 py-1',
    md: 'px-3 py-1.5',
  }

  return (
    <div
      className={cn('inline-flex rounded-lg bg-black/20 backdrop-blur-sm', sizes[size], className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onValueChange(option.value)}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-200',
            buttonSizes[size],
            value === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}
