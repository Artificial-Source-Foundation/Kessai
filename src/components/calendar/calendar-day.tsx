import { cn } from '@/lib/utils'
import type { DayPayment } from '@/hooks/use-calendar-stats'

interface CalendarDayProps {
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  payments: DayPayment[]
  totalAmount: number
  onClick: () => void
}

export function CalendarDay({
  dayOfMonth,
  isCurrentMonth,
  isToday,
  isSelected,
  payments,
  onClick,
}: CalendarDayProps) {
  const hasPayments = payments.length > 0
  const maxVisible = 2
  const visiblePayments = payments.slice(0, maxVisible)
  const remainingCount = payments.length - maxVisible

  return (
    <button
      onClick={onClick}
      className={cn(
        'border-border bg-background hover:bg-muted/50 flex min-h-[100px] flex-col gap-1 border p-2 text-left',
        !isCurrentMonth && 'text-muted-foreground/40',
        isCurrentMonth && 'text-foreground font-medium',
        isToday && 'bg-primary/5',
        isSelected && 'bg-primary/10 ring-primary/60 z-10 ring-2'
      )}
    >
      <span
        className={cn(
          'mb-1',
          isToday &&
            'bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full font-bold'
        )}
      >
        {dayOfMonth}
      </span>

      {hasPayments &&
        visiblePayments.map((p) => {
          const color = p.subscription.color || '#8655f6'
          return (
            <div
              key={`${p.subscription.id}-${p.dueDate}`}
              className={cn(
                'flex items-center gap-1.5 truncate rounded-lg border px-2 py-1.5 text-xs font-semibold shadow-sm',
                p.isPaid || p.isSkipped ? 'opacity-70 grayscale' : ''
              )}
              style={{
                backgroundColor: `${color}20`,
                borderColor: `${color}30`,
                color: `${color}`,
              }}
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{p.subscription.name}</span>
            </div>
          )
        })}

      {remainingCount > 0 && (
        <span className="text-muted-foreground pl-1 text-[10px] font-semibold">
          +{remainingCount} more
        </span>
      )}
    </button>
  )
}
