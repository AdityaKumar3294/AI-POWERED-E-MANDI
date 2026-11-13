import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProduceGrade } from '@/types';

export function MarketplaceFilters() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

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
    });

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
    { label: t('marketplace.allGrades', 'All Grades'), value: null },
    { label: t('grades.gradeA', 'Grade A'), value: 'A' },
    { label: t('grades.gradeB', 'Grade B'), value: 'B' },
    { label: t('grades.gradeC', 'Grade C'), value: 'C' },
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
            placeholder={t('marketplace.searchPlaceholder', 'Search tomatoes, produce, or varieties...')}
            aria-label="Search produce"
            className="touch-target block w-full rounded-xl border border-stone-300 bg-stone-50/50 py-2.5 pl-10 pr-9 text-base text-stone-900 transition placeholder:text-stone-400 focus:border-brand-700 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500"
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
            className="touch-target cursor-pointer rounded-xl border border-stone-300 bg-white py-2.5 pl-3 pr-8 text-sm font-semibold text-stone-800 focus:border-brand-700 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          >
            <option value="newest" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">{t('marketplace.newest', 'Newest First')}</option>
            <option value="price_asc" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">{t('marketplace.priceAsc', 'Price: Low to High')}</option>
            <option value="price_desc" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">{t('marketplace.priceDesc', 'Price: High to Low')}</option>
            <option value="quantity_desc" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">Stock: High to Low</option>
          </select>
        </div>
      </div>

      {/* Middle Row: Grade Filter Chips & Price Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 dark:border-stone-800">
        {/* Grade Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
            {t('common.grade', 'Grade')}:
          </span>
          {gradeOptions.map((opt) => {
            const isSelected = selectedGrade === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setGradeFilter(opt.value)}
                className={`touch-target rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Price Range Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              placeholder={t('marketplace.minPrice', 'Min ₹')}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
              className="touch-target w-20 rounded-xl border border-stone-300 bg-stone-50/50 px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-700 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
            <span className="text-stone-400">-</span>
            <input
              type="number"
              min="0"
              placeholder={t('marketplace.maxPrice', 'Max ₹')}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceApply()}
              className="touch-target w-20 rounded-xl border border-stone-300 bg-stone-50/50 px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-700 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>
          <button
            type="button"
            onClick={handlePriceApply}
            className="touch-target rounded-xl bg-stone-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 transition"
          >
            {t('common.filter', 'Filter')}
          </button>
        </div>
      </div>

      {/* Active Filter Clear Tag */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-xs dark:border-stone-800">
          <span className="text-stone-500">Filters applied</span>
          <button
            type="button"
            onClick={clearAllFilters}
            className="font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400 underline"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
