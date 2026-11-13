import type { ProduceGrade } from '@/types';

interface GradePillProps {
  grade: ProduceGrade | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GradePill({ grade, className = '', size = 'md' }: GradePillProps) {
  const normalized = (grade || 'C').toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm font-semibold',
    lg: 'px-4 py-1.5 text-base font-bold',
  };

  let colorClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900';

  if (normalized === 'A') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  } else if (normalized === 'B') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs tracking-wide ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          normalized === 'A'
            ? 'bg-emerald-600 dark:bg-emerald-400'
            : normalized === 'B'
            ? 'bg-amber-600 dark:bg-amber-400'
            : 'bg-red-600 dark:bg-red-400'
        }`}
        aria-hidden="true"
      />
      Grade {normalized}
    </span>
  );
}

