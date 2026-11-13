import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Download,
  Share2,
  Check,
  Calendar,
  PackagePlus,
  ExternalLink,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

import type { Certificate } from '@/types';
import { downloadCertificatePdf } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Frontend public verification URL
  const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(certificate.certificateId)}`;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadCertificatePdf(certificate._id, certificate.certificateId);
      toast.success('Certificate PDF downloaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download certificate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      toast.success('Verification link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${certificate.produceName} - Quality Certificate`,
          text: `Check out the verified Grade ${certificate.grade} AI quality certificate on E-Mandi.`,
          url: verifyUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-emerald-300/80 bg-white p-5 shadow-xs transition hover:shadow-lg dark:border-emerald-800 dark:bg-stone-900">
      {/* Background Watermark */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 text-emerald-50 dark:text-emerald-950/20">
        <Award className="h-40 w-40" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {certificate.certificateId}
              </span>
              {certificate.valid ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  VALID
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
                  REVOKED
                </span>
              )}
            </div>
            <h3 className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">
              {certificate.produceName || 'Tomatoes'}
            </h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
              <Calendar className="h-3 w-3 text-stone-400" />
              <span>Issued {formatDate(certificate.issuedAt)}</span>
            </div>
          </div>

          <GradePill grade={certificate.grade} size="md" />
        </div>

        {/* QR Code & Metrics Section */}
        <div className="flex items-center gap-4 rounded-xl bg-stone-50 p-3.5 dark:bg-stone-850">
          {/* QR Code Thumbnail */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white p-1 dark:border-stone-700">
            {certificate.qrCodeDataUrl ? (
              <img
                src={certificate.qrCodeDataUrl}
                alt="Verification QR Code"
                className="h-full w-full object-contain"
              />
            ) : (
              <QrCode className="h-10 w-10 text-stone-400" />
            )}
          </div>

          {/* Key Metrics */}
          <div className="flex-1 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Defects:</span>
              <strong className="text-stone-900 dark:text-stone-100">
                {certificate.defectPercentage}%
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Sample Count:</span>
              <strong className="text-stone-900 dark:text-stone-100">
                {certificate.healthyProduce} / {certificate.totalProduce}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Produce Size:</span>
              <strong className="capitalize text-stone-900 dark:text-stone-100">
                {certificate.averageSize || 'Medium'}
              </strong>
            </div>
          </div>
        </div>

        {/* Public Verify URL preview */}
        <div className="flex items-center justify-between rounded-lg bg-emerald-50/60 px-3 py-1.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="truncate max-w-[200px] font-mono opacity-80">{verifyUrl}</span>
          <Link
            to={`/verify/${encodeURIComponent(certificate.certificateId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold hover:underline shrink-0 ml-2"
          >
            <span>Verify</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="relative z-10 mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {/* Authenticated PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="touch-target col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-800 disabled:opacity-50 transition"
          >
            {isDownloading ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Official PDF</span>
          </button>

          {/* Web Share / Copy */}
          <button
            type="button"
            onClick={handleShare}
            className="touch-target inline-flex items-center justify-center gap-1 rounded-xl border border-stone-300 bg-stone-50 px-2 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 transition"
            title="Share or Copy Link"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>

        {/* Quick Action: List as Marketplace Produce */}
        <Link
          to={`/farmer/products/new?certificateId=${certificate._id}`}
          className="touch-target flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/80 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300 transition"
        >
          <PackagePlus className="h-4 w-4" />
          <span>List as Marketplace Lot</span>
        </Link>
      </div>
    </div>
  );
}
