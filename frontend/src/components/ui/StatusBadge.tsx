import type { OrderStatus, ProductStatus } from '@/types';

type AnyStatus = OrderStatus | ProductStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    // Product statuses
    available: {
      label: 'Available',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    sold_out: {
      label: 'Sold Out',
      bg: 'bg-stone-100 dark:bg-stone-900',
      text: 'text-stone-600 dark:text-stone-400',
      border: 'border-stone-300 dark:border-stone-700',
    },
    inactive: {
      label: 'Inactive',
      bg: 'bg-stone-100 dark:bg-stone-900',
      text: 'text-stone-500 dark:text-stone-400',
      border: 'border-stone-200 dark:border-stone-800',
    },

    // Order statuses
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-red-50 dark:bg-red-950/60',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-stone-100 dark:bg-stone-900',
      text: 'text-stone-600 dark:text-stone-400',
      border: 'border-stone-300 dark:border-stone-700',
    },
  };

  const current = statusConfig[normalized] || {
    label: status,
    bg: 'bg-stone-100 dark:bg-stone-900',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-200 dark:border-stone-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {current.label}
    </span>
  );
}

