import { Link } from 'react-router-dom';
import { Award, Camera } from 'lucide-react';

import { useMyCertificates } from '../hooks';
import { CertificateCard } from '../components/CertificateCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export default function CertificatesPage() {
  const { data, isLoading, isError, error, refetch } = useMyCertificates();

  const certificates = data?.certificates || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* React 19 Document Metadata */}
      <title>Digital Quality Certificates | AI-Powered E-Mandi</title>
      <meta
        name="description"
        content="View, download, and share your verifiable AI crop quality certificates."
      />

      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 sm:text-3xl dark:text-stone-100">
              Quality Certificates
            </h1>
            {!isLoading && (
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {certificates.length} {certificates.length === 1 ? 'Certificate' : 'Certificates'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            एआई द्वारा जारी डिजिटल गुणवत्ता प्रमाण पत्र (PDF डाउनलोड और QR सत्यापन)
          </p>
        </div>

        <Link
          to="/farmer/grading"
          className="touch-target inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-brand-800 transition"
        >
          <Camera className="h-4 w-4" />
          <span>Grade & Mint New Certificate</span>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load certificates"
          message={(error as any)?.message || 'Failed to fetch quality certificates from server.'}
          onRetry={() => refetch()}
        />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No digital certificates issued yet"
          description="Grade your tomato crop using the AI camera to automatically verify quality and mint your first tamper-proof digital certificate."
          action={{
            label: 'Scan Produce with AI Camera',
            onClick: () => {
              window.location.href = '/farmer/grading';
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <CertificateCard key={cert._id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
