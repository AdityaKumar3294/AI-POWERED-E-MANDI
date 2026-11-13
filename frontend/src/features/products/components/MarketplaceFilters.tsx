import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import type { ProduceGrade } from '@/types';

export function MarketplaceFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for instant search responsiveness
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const selectedGrade = (searchParams.get('grade') as ProduceGrade) || null;
  const currentSort = searchParams.get('sortBy') || 'createdAt';
  const currentOrder = searchParams.get('order') || 'desc';

  // 300ms debounced search syncing to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (searchTerm.trim()) {
            next.set('search', searchTerm.trim());
          } else {
            next.delete('search');
          }
          return next;
        });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearchParams]);

  const setGradeFilter = (grade: ProduceGrade | null) => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (grade) {
          next.set('grade', grade);
        } else {
          next.delete('grade');
        }
        return next;
      });
    });
  };

  const handlePriceApply = () => {
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (minPrice && Number(minPrice) >= 0) {
          next.set('minPrice', minPrice);
        } else {
          next.delete('minPrice');
        }
        if (maxPrice && Number(maxPrice) >= 0) {
          next.set('maxPrice', maxPrice);
        } else {
          next.delete('maxPrice');
        }
        return next;
      });
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (val === 'price_asc') {
          next.set('sortBy', 'pricePerKg');
          next.set('order', 'asc');
        } else if (val === 'price_desc') {
          next.set('sortBy', 'pricePerKg');
          next.set('order', 'desc');
        } else if (val === 'quantity_desc') {
          next.set('sortBy', 'quantity');
          next.set('order', 'desc');
        } else {
          next.set('sortBy', 'createdAt');
          next.set('order', 'desc');
        }
        return next;
      });
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    startTransition(() => {
      setSearchParams({});
    });
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
    selectedGrade ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('sortBy')
  );

  const gradeOptions: { label: string; value: ProduceGrade | null }[] = [
    { label: 'All Grades', value: null },
    { label: 'Grade A', value: 'A' },
    { label: 'Grade B', value: 'B' },
    { label: 'Grade C', value: 'C' },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
      {/* Top Row: Search Input & Sort Dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Debounced Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tomatoes, produce, or varieties..."
            aria-label="Search produce"
            className="touch-target block w-full rounded-xl border border-stone-300 bg-stone-50/50 py-2.5 pl-10 pr-9 text-base text-stone-900 transition placeholder:text-stone-400 focus:border-brand-700 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="touch-target absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-stone-500 shrink-0" />
          <select
            value={
              currentSort === 'pricePerKg' && currentOrder === 'asc'
                ? 'price_asc'
                : currentSort === 'pricePerKg' && currentOrder === 'desc'
                ? 'price_desc'
                : currentSort === 'quantity'
                ? 'quantity_desc'
                : 'newest'
            }
            onChange={handleSortChange}
            aria-label="Sort listings"
            className="touch-target cursor-pointer rounded-xl border border-stone-300 bg-stone-50/50 py-2.5 pl-3 pr-8 text-sm font-semibold text-stone-800 focus:border-brand-700 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="quantity_desc">Available Stock: High</option>
          </select>
        </div>
      </div>

      {/* Middle Row: Grade Filter Chips & Price Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 dark:border-stone-800">
        {/* Grade Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
            Grade:
          </span>
          {gradeOptions.map((opt) => {
            const isSelected = selectedGrade === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setGradeFilter(opt.value)}
                className={`touch-target rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Price Range Inputs */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-stone-400" />
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            ₹/kg:
          </span>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-18 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
          <span className="text-stone-400">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-18 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1.5 text-xs text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
          <button
            type="button"
            onClick={handlePriceApply}
            className="touch-target rounded-lg bg-stone-800 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Active Filter Indicators & Transition Status */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div>{isPending && <span className="text-brand-600 font-medium animate-pulse">Updating listings...</span>}</div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 underline decoration-dashed"
          >
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );
}

