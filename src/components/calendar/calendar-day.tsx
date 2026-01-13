import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { SubscriptionLogo } from '@/components/ui/subscription-logo'
import type { Subscription } from '@/types/subscription'

interface DayPayment {
  subscription: Subscription
  amount: number
  isPaid: boolean
  isSkipped: boolean
  dueDate: string
}

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
  const maxLogos = 3
  const visiblePayments = payments.slice(0, maxLogos)
  const remainingCount = payments.length - maxLogos

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative h-20 w-full rounded-lg transition-all duration-200',
        'flex flex-col items-center justify-start gap-1 pt-1',
        'border backdrop-blur-sm',
        isCurrentMonth
          ? 'border-glass-border bg-glass-surface hover:border-glass-border-hover hover:bg-glass-surface-hover'
          : 'text-muted-foreground/50 border-transparent bg-transparent',
        isToday && 'border-primary/30 bg-primary/10 ring-primary/50 ring-2',
        isSelected && 'border-primary/50 bg-primary/20 ring-primary/60 ring-2',
        hasPayments && !isSelected && 'bg-white/8'
      )}
    >
      <span
        className={cn(
          'text-sm font-medium',
          isToday &&
            'bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full shadow-[0_0_12px_rgba(137,90,246,0.6)]',
          isSelected && !isToday && 'text-primary'
        )}
      >
        {dayOfMonth}
      </span>

      {hasPayments && (
        <div className="flex flex-wrap items-center justify-center gap-1 px-1">
          {visiblePayments.map((p, idx) => (
            <SubscriptionLogo
              key={idx}
              logoUrl={p.subscription.logo_url}
              name={p.subscription.name}
              color={p.subscription.color}
              size="sm"
              className={cn(p.isPaid && 'opacity-60')}
            />
          ))}
          {remainingCount > 0 && (
            <span className="text-muted-foreground text-[10px]">+{remainingCount}</span>
          )}
        </div>
      )}

      {isToday && (
        <motion.div
          layoutId="today-glow"
          className="bg-primary/10 absolute inset-0 -z-10 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  )
}
