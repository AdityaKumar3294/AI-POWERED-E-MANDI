import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Award, Calendar } from 'lucide-react';

import { useGradingReport } from '../hooks';
import { GradingMetricsCard } from '../components/GradingMetricsCard';
import { GenerateCertificateDialog } from '../components/GenerateCertificateDialog';
import { uploadUrl } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function GradingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useGradingReport(id || '');
  const [certDialogOpen, setCertDialogOpen] = useState(false);

  const report = data?.report;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-1/2" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="aspect-4/3 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <ErrorState
          title="Grading report not found"
          message={(error as any)?.message || 'The requested grading report could not be found or you are not authorized.'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Link to="/farmer/grading" className="text-sm font-bold text-brand-700">
            ← Return to AI Grading
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = uploadUrl(report.imageUrl);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* React 19 Document Metadata */}
      <title>{`Grading Report #${report._id.slice(-6)} | AI-Powered E-Mandi`}</title>

      {/* Breadcrumb */}
      <div>
        <Link
          to="/farmer/grading"
          className="touch-target inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-brand-700 dark:text-stone-400"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Grading</span>
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase text-stone-500">
            Report ID: {report._id}
          </span>
          <h1 className="text-2xl font-black text-stone-900 sm:text-3xl dark:text-stone-100">
            Grading Assessment Details
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
            <Calendar className="h-3.5 w-3.5 text-stone-400" />
            <span>Assessed on {formatDate(report.createdAt)}</span>
          </div>
        </div>

        <GradePill grade={report.grade} size="lg" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Photo */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <img
            src={imageUrl}
            alt="Batch inspect"
            className="h-auto w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/placeholder-produce.svg';
            }}
          />
        </div>

        {/* Metrics & Certificate Action */}
        <div className="space-y-5">
          <GradingMetricsCard result={report} />

          <button
            type="button"
            onClick={() => setCertDialogOpen(true)}
            className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 px-4 text-base font-bold text-white shadow-md hover:bg-brand-800 transition"
          >
            <Award className="h-5 w-5" />
            <span>Generate Quality Certificate</span>
          </button>
        </div>
      </div>

      {/* Certificate Dialog */}
      <GenerateCertificateDialog
        open={certDialogOpen}
        gradingReportId={report._id}
        grade={report.grade}
        onClose={() => setCertDialogOpen(false)}
      />
    </div>
  );
}
