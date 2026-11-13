import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, User, ShieldCheck, Clock } from 'lucide-react';

import { useProduct } from '../hooks';
import { CertificatePreviewCard } from '../components/CertificatePreviewCard';
import { OrderForm } from '../components/OrderForm';
import { uploadUrl } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriceText } from '@/components/ui/PriceText';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useProduct(id || '');

  const product = data?.product;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-4/3 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <ErrorState
          title="Produce lot not found"
          message={(error as any)?.message || 'The requested produce listing does not exist or has been removed.'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Link
            to="/buyer/marketplace"
            className="text-sm font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400"
          >
            ← Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isCertified = Boolean(product.certificateId && product.certificateId.valid);
  const imageUrl = uploadUrl(product.image);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* React 19 Document Metadata */}
      <title>{`${product.name} | AI-Powered E-Mandi`}</title>
      <meta
        name="description"
        content={`Order ${product.name} directly from ${product.farmerId?.name || 'Farmer'} at ₹${product.pricePerKg}/kg with AI quality grading.`}
      />

      {/* Back Button & Breadcrumbs */}
      <div>
        <Link
          to="/buyer/marketplace"
          className="touch-target inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-brand-700 dark:text-stone-400 dark:hover:text-brand-300"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Visual Media & Certificate Preview (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Main Photo Container */}
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder-produce.svg';
              }}
            />

            {/* Quality Grade Floating Badge */}
            <div className="absolute top-4 left-4">
              <GradePill grade={product.grade} size="lg" />
            </div>

            {/* AI Verified Ribbon */}
            {isCertified && (
              <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Quality</span>
              </div>
            )}
          </div>

          {/* Certificate Preview Card if linked */}
          {product.certificateId && (
            <CertificatePreviewCard
              certificate={product.certificateId}
              gradingReport={product.gradingReportId}
            />
          )}
        </div>

        {/* Right Column: Details & Order Form (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Produce Title & Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={product.status} />
              <div className="flex items-center gap-1 text-xs text-stone-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Listed {formatDate(product.createdAt)}</span>
              </div>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
              {product.name}
            </h1>

            {/* Wholesale Price Tag */}
            <div className="rounded-2xl bg-brand-50/70 p-4 border border-brand-200/70 dark:bg-brand-950/40 dark:border-brand-900/60">
              <span className="block text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                Wholesale Price
              </span>
              <PriceText amount={product.pricePerKg} perKg className="text-3xl font-black text-brand-900 dark:text-brand-200" />
            </div>
          </div>

          {/* Farmer & Farm Location Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Producer & Origin
            </h4>
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {product.farmerId?.name || 'Local Producer'}
                </p>
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span>{product.farmerId?.location || 'Mandi Location'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Order Placement Form */}
          <OrderForm product={product} />
        </div>
      </div>
    </div>
  );
}
