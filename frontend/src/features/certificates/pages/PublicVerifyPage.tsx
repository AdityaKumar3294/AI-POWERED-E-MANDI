import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Sprout,
  CheckCircle2,
  ExternalLink,
  Home
} from 'lucide-react';

import { useVerifyCertificate } from '../hooks';
import { formatDateTime } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';

export default function PublicVerifyPage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { data, isLoading, isError } = useVerifyCertificate(certificateId || '');

  const certificate = data?.certificate;
  const isVerified = Boolean(data?.success && data?.verified && certificate?.valid);
  const isRevoked = Boolean(data?.success && data?.verified === false);
  const isNotFound = isError || (data && !data.success && !data.verified);

  const farmer = typeof certificate?.farmerId === 'object' ? certificate.farmerId : null;

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8 dark:bg-stone-950 font-sans">
      {/* React 19 Document Metadata */}
      <title>
        {isVerified
          ? `Verified: ${certificate?.produceName || 'Produce'} (Grade ${certificate?.grade}) | AI E-Mandi`
          : 'Certificate Verification | AI E-Mandi'}
      </title>
      <meta
        name="description"
        content="Official digital certificate verification portal for AI-Powered E-Mandi agricultural produce."
      />

      <div className="mx-auto max-w-xl">
        {/* Minimalist Portal Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-xs">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-brand-900 dark:text-brand-300">
                AI E-Mandi
              </span>
              <span className="text-xs text-stone-500 block">Verification Registry</span>
            </div>
          </Link>

          <Link
            to="/buyer/marketplace"
            className="touch-target inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
          >
            <span>Visit Marketplace</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-lg dark:border-stone-800 dark:bg-stone-900">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
            <h2 className="mt-4 text-lg font-bold text-stone-900 dark:text-stone-100">
              Verifying Certificate Authenticity...
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Querying E-Mandi registry for <span className="font-mono">{certificateId}</span>
            </p>
          </div>
        )}

        {/* State 1: OFFICIALLY VERIFIED & VALID */}
        {!isLoading && isVerified && certificate && (
          <div className="overflow-hidden rounded-3xl border-2 border-emerald-400 bg-white shadow-2xl dark:border-emerald-700 dark:bg-stone-900 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Verification Ribbon */}
            <div className="bg-emerald-600 px-6 py-4 text-center text-white">
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-700/80 p-2 text-white">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="mt-2 text-lg font-black tracking-wide uppercase sm:text-xl">
                Official Quality Certificate
              </h2>
              <p className="text-xs font-medium text-emerald-100">
                VERIFIED AUTHENTIC & ACTIVE ON E-MANDI
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Certificate Identifier & Grade Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-5 dark:border-stone-800">
                <div>
                  <span className="block text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                    Certificate ID
                  </span>
                  <span className="font-mono text-base font-extrabold text-stone-900 dark:text-stone-100">
                    {certificate.certificateId}
                  </span>
                  <h3 className="mt-1 text-2xl font-black text-brand-900 dark:text-brand-300">
                    {certificate.produceName}
                  </h3>
                </div>

                <GradePill grade={certificate.grade} size="lg" />
              </div>

              {/* Producer & Origin Details */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-850">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Certified Producer & Origin
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                      {farmer?.name || 'Registered Farmer'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <MapPin className="h-3.5 w-3.5 text-stone-400" />
                      <span>{farmer?.location || 'Mandi Producer'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Inspection Summary Table */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  AI Computer Vision Quality Inspection Summary
                </span>

                <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                  <div className="flex justify-between p-3 bg-stone-50/60 dark:bg-stone-850/60">
                    <span className="text-stone-600 dark:text-stone-400">Assigned Quality Grade</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                      Grade {certificate.grade}
                    </strong>
                  </div>

                  <div className="flex justify-between p-3">
                    <span className="text-stone-600 dark:text-stone-400">Sample Defect Percentage</span>
                    <strong className="text-stone-900 dark:text-stone-100 font-extrabold">
                      {certificate.defectPercentage}%
                    </strong>
                  </div>

                  <div className="flex justify-between p-3 bg-stone-50/60 dark:bg-stone-850/60">
                    <span className="text-stone-600 dark:text-stone-400">Healthy Tomatoes Detected</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {certificate.healthyProduce} of {certificate.totalProduce}
                    </strong>
                  </div>

                  <div className="flex justify-between p-3">
                    <span className="text-stone-600 dark:text-stone-400">Defective / Rotten Count</span>
                    <strong className="text-red-600 font-bold">
                      {certificate.defectiveProduce}
                    </strong>
                  </div>

                  <div className="flex justify-between p-3 bg-stone-50/60 dark:bg-stone-850/60">
                    <span className="text-stone-600 dark:text-stone-400">Average Tomato Size</span>
                    <strong className="capitalize text-stone-900 dark:text-stone-100 font-bold">
                      {certificate.averageSize || 'Medium'}
                    </strong>
                  </div>

                  <div className="flex justify-between p-3">
                    <span className="text-stone-600 dark:text-stone-400">Date of Inspection</span>
                    <div className="flex items-center gap-1 font-semibold text-stone-900 dark:text-stone-100">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" />
                      <span>{formatDateTime(certificate.issuedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Signal Footer */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Official E-Mandi Tamper-Proof Cryptographic ID</span>
                </div>
                <p className="opacity-85 leading-relaxed">
                  This certificate was digitally signed following automated YOLO11n computer vision inference. It is not an official government AGMARK certificate.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 2: REVOKED OR EXPIRED */}
        {!isLoading && isRevoked && (
          <div className="rounded-3xl border-2 border-amber-300 bg-white p-8 text-center shadow-xl dark:border-amber-700 dark:bg-stone-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="h-9 w-9" />
            </div>
            <h2 className="mt-4 text-xl font-black text-amber-900 dark:text-amber-300">
              Certificate Revoked or Invalid
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
              This certificate record (<span className="font-mono">{certificateId}</span>) was found, but has been invalidated or expired by the issuer.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="touch-target inline-flex items-center gap-2 rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-stone-900 transition"
              >
                <Home className="h-4 w-4" />
                <span>Return to E-Mandi</span>
              </Link>
            </div>
          </div>
        )}

        {/* State 3: NOT FOUND (404) */}
        {!isLoading && isNotFound && (
          <div className="rounded-3xl border-2 border-red-300 bg-white p-8 text-center shadow-xl dark:border-red-800 dark:bg-stone-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <ShieldAlert className="h-9 w-9" />
            </div>
            <h2 className="mt-4 text-xl font-black text-red-900 dark:text-red-300">
              Certificate Not Found
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
              The Certificate ID <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{certificateId}</span> does not exist in the official E-Mandi registry.
            </p>
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              Please verify that the QR code or URL link was not modified or fraudulent.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="touch-target inline-flex items-center gap-2 rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-stone-900 transition"
              >
                <Home className="h-4 w-4" />
                <span>Return to E-Mandi Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-stone-400">
          AI-Powered E-Mandi Public Verification Registry • Designed for Indian Agriculture
        </div>
      </div>
    </div>
  );
}
