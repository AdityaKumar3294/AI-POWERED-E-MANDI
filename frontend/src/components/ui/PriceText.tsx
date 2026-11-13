import { formatCurrency } from '@/lib/format';

interface PriceTextProps {
  amount: number;
  className?: string;
  perKg?: boolean;
}

export function PriceText({ amount, className = '', perKg = false }: PriceTextProps) {
  return (
    <span className={`font-semibold tracking-tight ${className}`}>
      {formatCurrency(amount)}
      {perKg && <span className="text-xs font-normal text-stone-500 dark:text-stone-400"> / kg</span>}
    </span>
  );
}

