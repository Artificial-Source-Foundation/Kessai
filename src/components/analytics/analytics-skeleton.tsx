import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-64" />
      </header>

      {/* Velocity card */}
      <section className="glass-card p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </section>

      {/* Chart */}
      <section className="glass-card p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="h-[260px] w-full" />
      </section>

      {/* Year summary + category breakdown */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="glass-card p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <Skeleton className="mb-4 h-6 w-44" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-1.5 flex-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
