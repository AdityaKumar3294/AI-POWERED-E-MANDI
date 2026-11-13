import { Link } from 'react-router-dom';
import { Camera, ChevronLeft, Calendar, ArrowRight } from 'lucide-react';

import { useGradingReports } from '../hooks';
import { uploadUrl } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function GradingReportsPage() {
  const { data, isLoading, isError, error, refetch } = useGradingReports();

  const reports = data?.reports || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* React 19 Document Metadata */}
      <title>Grading Reports History | AI-Powered E-Mandi</title>

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/farmer/grading"
          className="touch-target inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-brand-700 dark:text-stone-400"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Grading Camera</span>
        </Link>

        <Link
          to="/farmer/grading"
          className="touch-target inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-brand-800 transition"
        >
          <Camera className="h-4 w-4" />
          <span>Grade New Batch</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-stone-900 sm:text-3xl dark:text-stone-100">
          Inspection History & Reports
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          आपके द्वारा पहले जांची गई सभी फसल लॉट और उनके परिणाम
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          {Array.from({ length: 4 }).map((_, idx) => (
            <TableRowSkeleton key={idx} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load grading reports"
          message={(error as any)?.message || 'Failed to fetch grading history.'}
          onRetry={() => refetch()}
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No grading reports yet"
          description="You haven't scanned or graded any tomato batches yet. Use the camera to run your first AI assessment."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {reports.map((report) => (
              <div
                key={report._id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-stone-50 dark:hover:bg-stone-850/50 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 overflow-hidden rounded-xl bg-stone-100 shrink-0 dark:bg-stone-800">
                    <img
                      src={uploadUrl(report.imageUrl)}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/placeholder-produce.svg';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-stone-400">#{report._id.slice(-6)}</span>
                      <GradePill grade={report.grade} size="sm" />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Total {report.total} tomatoes • {report.defectPercentage}% defects
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                      <Calendar className="h-3 w-3 text-stone-400" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    to={`/farmer/grading/${report._id}`}
                    className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    <span>View Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

