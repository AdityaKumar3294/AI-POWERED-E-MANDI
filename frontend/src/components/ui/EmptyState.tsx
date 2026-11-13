import type { LucideIcon } from 'lucide-react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = PackageOpen,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 p-8 text-center dark:border-stone-800 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-900 dark:text-stone-400">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-stone-600 dark:text-stone-400">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="touch-target mt-5 inline-flex items-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-800 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

