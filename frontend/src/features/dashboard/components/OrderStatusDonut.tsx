interface OrderCounts {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled?: number;
  rejected?: number;
}

interface OrderStatusDonutProps {
  orders: OrderCounts;
  className?: string;
}

export function OrderStatusDonut({ orders, className = '' }: OrderStatusDonutProps) {
  const total = orders.total || 0;
  const pending = orders.pending || 0;
  const confirmed = orders.confirmed || 0;
  const completed = orders.completed || 0;
  const failed = (orders.cancelled || 0) + (orders.rejected || 0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327

  // Calculate segment lengths and cumulative offsets
  const segments = [
    { label: 'Completed', count: completed, color: '#10b981', bgClass: 'bg-emerald-500' },
    { label: 'Confirmed', count: confirmed, color: '#3b82f6', bgClass: 'bg-blue-500' },
    { label: 'Pending', count: pending, color: '#f59e0b', bgClass: 'bg-amber-500' },
    { label: 'Cancelled / Rejected', count: failed, color: '#ef4444', bgClass: 'bg-red-500' },
  ].filter((s) => s.count > 0);

  let accumulatedLength = 0;

  return (
    <div
      className={`flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around ${className}`}
      role="region"
      aria-label="Order status breakdown"
    >
      {/* SVG Donut Circle */}
      <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90 transform"
          aria-hidden="true"
        >
          {/* Base background ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-stone-100 dark:text-stone-800"
          />

          {total > 0 &&
            segments.map((segment) => {
              const segmentRatio = segment.count / total;
              const dashLength = segmentRatio * circumference;
              const offset = accumulatedLength;
              accumulatedLength += dashLength;

              return (
                <circle
                  key={segment.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="12"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
        </svg>

        {/* Center Text (Counter) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-stone-900 dark:text-stone-100">
            {total}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Total Orders
          </span>
        </div>
      </div>

      {/* Legend & Breakdown Details */}
      <div className="w-full max-w-xs space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Order Status Breakdown
        </h4>

        {total === 0 ? (
          <p className="text-xs text-stone-500 dark:text-stone-400">
            No orders have been recorded in the system yet.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {segments.map((seg) => {
              const percentage = Math.round((seg.count / total) * 100);

              return (
                <div
                  key={seg.label}
                  className="flex items-center justify-between rounded-lg bg-stone-50 p-2 dark:bg-stone-800/60"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${seg.bgClass}`} />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {seg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {seg.count}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
