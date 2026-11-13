import { Link } from 'react-router-dom';
import { Award, ShieldCheck, QrCode, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import type { Certificate, GradingReport } from '@/types';
import { formatDate } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';

interface CertificatePreviewCardProps {
  certificate?: Certificate | null;
  gradingReport?: GradingReport | null;
}

export function CertificatePreviewCard({
  certificate,
  gradingReport,
}: CertificatePreviewCardProps) {
  if (!certificate || !certificate.valid) {
    return null;
  }

  const defectPct = certificate.defectPercentage ?? gradingReport?.defectPercentage ?? 0;
  const totalInspected = certificate.totalProduce ?? gradingReport?.total ?? 0;
  const healthyCount = certificate.healthyProduce ?? gradingReport?.healthy ?? 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 p-5 shadow-sm dark:border-emerald-800 dark:from-emerald-950/40 dark:via-stone-900 dark:to-emerald-950/20">
      {/* Background Watermark Icon */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 text-emerald-100/60 dark:text-emerald-900/20">
        <Award className="h-36 w-36" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-3 dark:border-emerald-800/60">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Digital Quality Certificate
              </h4>
              <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                {certificate.certificateId}
              </p>
            </div>
          </div>

          <GradePill grade={certificate.grade} size="md" />
        </div>

        {/* Quality Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/80 p-2.5 shadow-2xs dark:bg-stone-850">
            <span className="block text-[11px] font-semibold text-stone-500 uppercase">
              Defect Rate
            </span>
            <span className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              {defectPct}%
            </span>
          </div>

          <div className="rounded-xl bg-white/80 p-2.5 shadow-2xs dark:bg-stone-850">
            <span className="block text-[11px] font-semibold text-stone-500 uppercase">
              Fresh Produce
            </span>
            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
              {healthyCount} / {totalInspected}
            </span>
          </div>

          <div className="rounded-xl bg-white/80 p-2.5 shadow-2xs dark:bg-stone-850">
            <span className="block text-[11px] font-semibold text-stone-500 uppercase">
              Average Size
            </span>
            <span className="text-base font-extrabold capitalize text-stone-900 dark:text-stone-100">
              {certificate.averageSize || 'Medium'}
            </span>
          </div>

          <div className="rounded-xl bg-white/80 p-2.5 shadow-2xs dark:bg-stone-850">
            <span className="block text-[11px] font-semibold text-stone-500 uppercase">
              Issue Date
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-stone-800 dark:text-stone-200 mt-1">
              <Calendar className="h-3 w-3 text-stone-400" />
              <span>{formatDate(certificate.issuedAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Link to Public Verification Page */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>AI YOLO11n Tested • Tamper-proof Record</span>
          </div>

          <Link
            to={`/verify/${encodeURIComponent(certificate.certificateId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 dark:border-emerald-500 dark:bg-stone-800 dark:text-emerald-300 dark:hover:bg-stone-700 transition"
          >
            <QrCode className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Verify Live Record</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
        </div>
      </div>
    </div>
  );
}

