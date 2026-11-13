import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'blue' | 'stone';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  className = '',
}: StatCardProps) {
  const iconVariants = {
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-400',
    stone: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${iconVariants[variant]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

