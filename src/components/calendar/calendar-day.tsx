import { cn } from '@/lib/utils';
import { PaymentIndicatorStack } from './payment-indicator';
import { motion } from 'framer-motion';
import type { Subscription } from '@/types/subscription';

interface DayPayment {
  subscription: Subscription;
  amount: number;
  isPaid: boolean;
  isSkipped: boolean;
  dueDate: string;
}

interface CalendarDayProps {
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  payments: DayPayment[];
  totalAmount: number;
  onClick: () => void;
}

export function CalendarDay({
  dayOfMonth,
  isCurrentMonth,
  isToday,
  isSelected,
  payments,
  onClick,
}: CalendarDayProps) {
  const hasPayments = payments.length > 0;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'relative h-12 w-full rounded-lg transition-all duration-200',
        'flex flex-col items-center justify-center gap-0.5',
        'backdrop-blur-sm border',
        isCurrentMonth
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          : 'bg-transparent border-transparent text-muted-foreground/50',
        isToday && 'ring-2 ring-violet-500/50 bg-violet-500/10 border-violet-500/30',
        isSelected && 'bg-violet-500/20 border-violet-500/50',
        hasPayments && !isSelected && 'bg-white/8'
      )}
    >
      <span
        className={cn(
          'text-sm font-medium',
          isToday && 'text-violet-400',
          isSelected && 'text-violet-300'
        )}
      >
        {dayOfMonth}
      </span>

      {hasPayments && (
        <PaymentIndicatorStack
          payments={payments.map((p) => ({
            color: p.subscription.color || '#8b5cf6',
            isPaid: p.isPaid,
            isSkipped: p.isSkipped,
          }))}
          maxVisible={3}
        />
      )}

      {isToday && (
        <motion.div
          layoutId="today-glow"
          className="absolute inset-0 rounded-lg bg-violet-500/20 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}
