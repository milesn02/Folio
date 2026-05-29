import { Skeleton, SkeletonDark } from './skeleton'

// Matches Snapshot layout: dark hero band → KPI tray → projection card → gap items → strategies table
export function SnapshotSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-enter">
      {/* Hero band + KPI tray */}
      <div className="rounded-xl overflow-hidden shadow-md">
        <div className="px-8 pt-8 pb-6" style={{ background: 'linear-gradient(135deg, #1a3f28 0%, #204d31 100%)' }}>
          <SkeletonDark className="h-8 w-52 mb-3" />
          <div className="flex gap-1.5">
            <SkeletonDark className="h-[26px] w-32 rounded-full" />
            <SkeletonDark className="h-[26px] w-24 rounded-full" />
            <SkeletonDark className="h-[26px] w-16 rounded-full" />
          </div>
        </div>
        <div
          className="grid gap-2 px-3 pb-3 pt-2"
          style={{ gridTemplateColumns: '5fr 2fr 2fr 2fr', background: 'linear-gradient(180deg, #1e4830 0%, #142c1d 100%)' }}
        >
          <SkeletonDark className="h-28" />
          <SkeletonDark className="h-28" />
          <SkeletonDark className="h-28" />
          <SkeletonDark className="h-28" />
        </div>
      </div>

      {/* Tax projection card */}
      <div className="rounded-xl bg-white border border-border shadow">
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="px-5 py-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
          <div className="px-5 py-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
      </div>

      {/* Gap analysis card */}
      <div className="rounded-xl bg-white border border-border shadow">
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-16" />
        </div>
        {[0, 1].map(i => (
          <div key={i} className="flex items-start gap-3.5 px-5 py-4 border-b border-border last:border-b-0">
            <Skeleton className="h-2 w-2 mt-1 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-1.5" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Strategies table */}
      <div className="rounded-xl bg-white border border-border shadow">
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0">
            <Skeleton className="h-4 w-44 flex-1" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-1 w-24 rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
        <div className="px-5 py-4 rounded-b-xl" style={{ background: 'linear-gradient(90deg, #1a3f28 0%, #204d31 100%)' }}>
          <div className="flex items-center justify-between">
            <SkeletonDark className="h-3 w-36" />
            <SkeletonDark className="h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Matches Salary Schedule: year pills row → 3 cards (Compensation, 401k, Paycheck)
export function SalarySkeleton() {
  return (
    <div className="flex flex-col gap-3.5 animate-enter">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border">
          {[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="h-7 w-14 rounded-md" />)}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
      </div>
      {/* Compensation card */}
      <div className="rounded-xl bg-white border border-border shadow">
        <div className="px-5 py-3.5 border-b border-border/60"><Skeleton className="h-4 w-52" /></div>
        <div className="p-5 grid grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
      {/* 401k card */}
      <div className="rounded-xl bg-white border border-border shadow">
        <div className="px-5 py-3.5 border-b border-border/60"><Skeleton className="h-4 w-28" /></div>
        <div className="p-5 grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-md" />)}
        </div>
      </div>
      {/* Paycheck table */}
      <div className="rounded-xl bg-white border border-border shadow overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60"><Skeleton className="h-4 w-40" /></div>
        <div className="h-8 bg-navy/80" />
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center px-4 py-2 border-t border-border">
            <Skeleton className="h-4 flex-1 mr-4" />
            <Skeleton className="h-4 w-24 mr-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
        <div className="h-12 bg-navy/80" />
      </div>
    </div>
  )
}

// Matches Individual Payments: year pills → single card with table
export function PaymentsSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 animate-enter">
      <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border">
        {[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="h-7 w-14 rounded-md" />)}
      </div>
      <div className="rounded-xl bg-white border border-border shadow">
        <div className="px-5 py-3.5 border-b border-border/60"><Skeleton className="h-4 w-48" /></div>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20 ml-auto" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0">
            <div className="w-[28%]">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Generic card skeleton for entity payments, tax savings, notes, etc.
export function CardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl bg-white border border-border shadow animate-enter">
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface">
        {[60, 40, 80, 60].map((w, i) => <Skeleton key={i} className={`h-3 w-${w >= 60 ? '[60px]' : '[40px]'}`} />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <div className="flex gap-1">
            <Skeleton className="h-7 w-12 rounded" />
            <Skeleton className="h-7 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
