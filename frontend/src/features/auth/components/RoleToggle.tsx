import { Sprout, ShoppingBag } from 'lucide-react';

interface RoleToggleProps {
  value: 'farmer' | 'buyer';
  onChange: (role: 'farmer' | 'buyer') => void;
  disabled?: boolean;
}

export function RoleToggle({ value, onChange, disabled = false }: RoleToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select Account Type"
      className="grid grid-cols-2 gap-3"
    >
      {/* Farmer Option */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'farmer'}
        disabled={disabled}
        onClick={() => onChange('farmer')}
        className={`touch-target flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition ${
          value === 'farmer'
            ? 'border-brand-700 bg-brand-50/80 text-brand-900 shadow-xs dark:border-brand-500 dark:bg-brand-950/60 dark:text-brand-200'
            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400'
        }`}
      >
        <Sprout className={`h-6 w-6 ${value === 'farmer' ? 'text-brand-700 dark:text-brand-400' : 'text-stone-400'}`} />
        <span className="mt-1 text-sm font-bold">Farmer</span>
        <span className="text-[11px] opacity-75">किसान (Producer)</span>
      </button>

      {/* Buyer Option */}
      <button
        type="button"
        role="radio"
        aria-checked={value === 'buyer'}
        disabled={disabled}
        onClick={() => onChange('buyer')}
        className={`touch-target flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center transition ${
          value === 'buyer'
            ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-xs dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-200'
            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400'
        }`}
      >
        <ShoppingBag className={`h-6 w-6 ${value === 'buyer' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
        <span className="mt-1 text-sm font-bold">Buyer</span>
        <span className="text-[11px] opacity-75">थोक व्यापारी (Wholesale)</span>
      </button>
    </div>
  );
}
