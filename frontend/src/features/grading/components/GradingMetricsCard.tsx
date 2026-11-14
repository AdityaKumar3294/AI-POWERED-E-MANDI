import { Award, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import type { GradingResult } from '@/types';
import { GradePill } from '@/components/ui/GradePill';

interface GradingMetricsCardProps {
  result: GradingResult;
  className?: string;
}

export function GradingMetricsCard({ result, className = '' }: GradingMetricsCardProps) {
  const defectPct = Number(result.defectPercentage || 0);

  // Guard against zero produce detected (e.g. human face or background)
  if (!result.total || result.total === 0) {
    return (
      <div className={`space-y-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/40 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
              No Produce Detected (कोई टमाटर नहीं मिला)
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              The AI model could not detect any tomatoes in this image. The photo appears to contain a person, background, or non-crop objects. Please retake the photo with harvested tomatoes in view.
            </p>
          </div>
        </div>
      </div>
    );
  }

  let gradeDesc = 'Processing Grade (>25% defects)';
  if (result.grade === 'A') {
    gradeDesc = 'Premium Quality (<10% defects)';
  } else if (result.grade === 'B') {
    gradeDesc = 'Standard Market Quality (10-25% defects)';
  }

  // Progress bar color based on defect percentage
  const barColor =
    defectPct < 10
      ? 'bg-emerald-500'
      : defectPct <= 25
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div className={`space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 ${className}`}>
      {/* Header & Quality Grade */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
        <div>
          <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
            AI Assessment Result
          </span>
          <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
            Tomato Quality Inspection
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{gradeDesc}</p>
        </div>

        <GradePill grade={result.grade} size="lg" />
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Detected */}
        <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-850">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
            <BarChart3 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span className="truncate">Total Inspected</span>
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 truncate">
            {result.total}
          </p>
        </div>

        {/* Healthy Fresh */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Fresh Count</span>
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 truncate">
            {result.healthy}
          </p>
        </div>

        {/* Defective Rotten */}
        <div className="rounded-xl border border-red-100 bg-red-50/70 p-3 dark:border-red-900/50 dark:bg-red-950/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-800 dark:text-red-300">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="truncate">Rotten Count</span>
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black text-red-700 dark:text-red-300 truncate">
            {result.defective}
          </p>
        </div>

        {/* Average Size */}
        <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-850">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
            <Award className="h-3.5 w-3.5 text-stone-400 shrink-0" />
            <span className="truncate">Average Size</span>
          </div>
          <p className="mt-1 text-xl sm:text-2xl font-black capitalize text-stone-900 dark:text-stone-100 truncate">
            {result.averageSize || 'Medium'}
          </p>
        </div>
      </div>

      {/* Defect Rate Progress Bar */}
      <div className="space-y-1.5 rounded-xl border border-stone-100 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-850">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-stone-600 dark:text-stone-400">Defect Ratio</span>
          <span className={defectPct < 10 ? 'text-emerald-600' : defectPct <= 25 ? 'text-amber-600' : 'text-red-600'}>
            {defectPct.toFixed(1)}% Defects
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(100, Math.max(0, defectPct))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-stone-400">
          <span>0% (Perfect)</span>
          <span>10% (Grade A limit)</span>
          <span>25% (Grade B limit)</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

