import { useState, useEffect, useTransition } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  Lock, 
  ShieldCheck, 
  Coins, 
  Sparkles, 
  X, 
  Loader2 
} from 'lucide-react';
import { productFormSchema, type ProductFormInput } from '../schemas';
import { useCreateProduct } from '../hooks';
import { useMyCertificates } from '@/features/certificates/hooks';
import { compressImage } from '@/lib/image-compress';
import { formatCurrency, formatWeight } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';
import type { Certificate, ProduceGrade } from '@/types';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const certIdParam = searchParams.get('certificateId');

  const { data: certData, isLoading: certsLoading } = useMyCertificates();
  const createProductMutation = useCreateProduct();

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [, startTransition] = useTransition();

  const certificates = certData?.certificates || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      quantity: 100,
      pricePerKg: 25,
      grade: 'A',
      status: 'available',
      certificateId: null,
      gradingReportId: null,
    },
  });

  const watchedQuantity = watch('quantity') || 0;
  const watchedPrice = watch('pricePerKg') || 0;
  const watchedGrade = watch('grade');
  const estimatedGross = watchedQuantity * watchedPrice;

  // Handle URL param ?certificateId=... or certificate selection
  useEffect(() => {
    if (certificates.length > 0 && certIdParam) {
      const match = certificates.find(
        (c) => c._id === certIdParam || c.certificateId === certIdParam
      );
      if (match) {
        handleSelectCertificate(match);
      }
    }
  }, [certificates, certIdParam]);

  const handleSelectCertificate = (cert: Certificate | null) => {
    setSelectedCert(cert);
    if (cert) {
      // Backend ENFORCES grade must match certificate grade
      setValue('grade', cert.grade as ProduceGrade);
      setValue('certificateId', cert._id);

      const reportId =
        typeof cert.gradingReportId === 'object' && cert.gradingReportId !== null
          ? (cert.gradingReportId as any)._id
          : cert.gradingReportId;
      setValue('gradingReportId', reportId || null);

      if (cert.produceName) {
        setValue('name', cert.produceName);
      }
    } else {
      setValue('certificateId', null);
      setValue('gradingReportId', null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 2 * 1024 * 1024);
      setSelectedImageFile(compressed);

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(URL.createObjectURL(compressed));
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setSelectedImageFile(null);
  };

  const onSubmit = (data: ProductFormInput) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('quantity', String(data.quantity));
      formData.append('pricePerKg', String(data.pricePerKg));
      formData.append('grade', data.grade);

      if (data.certificateId) {
        formData.append('certificateId', data.certificateId);
      }
      if (data.gradingReportId) {
        formData.append('gradingReportId', data.gradingReportId);
      }
      if (selectedImageFile) {
        formData.append('image', selectedImageFile);
      }

      createProductMutation.mutate(formData, {
        onSuccess: () => {
          navigate('/farmer/products');
        },
      });
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <title>List New Produce | AI E-Mandi</title>

      {/* Back navigation & Title */}
      <div>
        <Link
          to="/farmer/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 transition-colors hover:text-brand-700 dark:text-stone-400 dark:hover:text-brand-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Produce Lots</span>
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
          List Wholesale Produce Lot
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Publish your harvest lot directly to verified mandi wholesale buyers.
        </p>
      </div>

      {/* Certificate Linking Banner / Selection */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Link AI Quality Certificate
            </h2>
          </div>
          {selectedCert && (
            <button
              type="button"
              onClick={() => handleSelectCertificate(null)}
              className="text-xs font-bold text-red-600 hover:underline dark:text-red-400"
            >
              Unlink Certificate
            </button>
          )}
        </div>

        {selectedCert ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Certificate #{selectedCert.certificateId}
                  </span>
                  <GradePill grade={selectedCert.grade} size="sm" />
                </div>
                <p className="mt-1 text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  {selectedCert.produceName || 'Verified Tomato Harvest'}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Defect Rate: {selectedCert.defectPercentage.toFixed(1)}% • Healthy Produce:{' '}
                  {selectedCert.healthyProduce} of {selectedCert.totalProduce} units
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                <Lock className="h-3.5 w-3.5" />
                <span>Grade Locked to {selectedCert.grade}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Link one of your AI-certified grading reports to display a verified trust badge to wholesale buyers.
            </p>

            {certsLoading ? (
              <p className="text-xs text-stone-500">Checking your issued certificates...</p>
            ) : certificates.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="cert-picker" className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Select Certificate:
                </label>
                <select
                  id="cert-picker"
                  onChange={(e) => {
                    const cert = certificates.find((c) => c._id === e.target.value) || null;
                    handleSelectCertificate(cert);
                  }}
                  defaultValue=""
                  className="h-10 rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-800 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                >
                  <option value="">-- Choose an AI Certificate --</option>
                  {certificates.map((c) => (
                    <option key={c._id} value={c._id}>
                      #{c.certificateId} — Grade {c.grade} ({c.produceName || 'Produce'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    No active certificates yet. You can list produce uncertified or run an AI crop scan.
                  </span>
                </div>
                <Link
                  to="/farmer/grading"
                  className="shrink-0 font-bold underline hover:text-amber-950 dark:hover:text-amber-100"
                >
                  Grade Now
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Listing Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900"
      >
        {/* Produce Name */}
        <div>
          <label htmlFor="produce-name" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
            Produce Variety / Lot Name <span className="text-red-500">*</span>
          </label>
          <input
            id="produce-name"
            type="text"
            placeholder="e.g. Fresh Hybrid Red Tomatoes"
            {...register('name')}
            className={`mt-1.5 h-12 w-full rounded-xl border px-4 text-sm font-medium shadow-xs focus:outline-hidden ${
              errors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Grade Field (Locked if Certificate is Selected) */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="produce-grade" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
              Produce Quality Grade <span className="text-red-500">*</span>
            </label>
            {selectedCert && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Lock className="h-3 w-3" />
                Locked by AI Certificate
              </span>
            )}
          </div>

          {selectedCert ? (
            <div className="mt-1.5 flex h-12 w-full items-center justify-between rounded-xl border border-stone-300 bg-stone-100 px-4 text-sm font-bold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
              <span className="flex items-center gap-2">
                <GradePill grade={watchedGrade} size="sm" />
                <span>Verified Grade {watchedGrade} (Mandatory match)</span>
              </span>
              <span className="text-xs font-medium text-stone-500">Fixed</span>
            </div>
          ) : (
            <select
              id="produce-grade"
              {...register('grade')}
              className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800 shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              <option value="A">Grade A (Premium & Fresh, Defect &lt; 10%)</option>
              <option value="B">Grade B (Standard Market, Defect 10%–25%)</option>
              <option value="C">Grade C (Processing/Canning, Defect &gt; 25%)</option>
            </select>
          )}
          {errors.grade && (
            <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
              {errors.grade.message}
            </p>
          )}
        </div>

        {/* Quantity & Price Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Quantity in KG */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
              Lot Stock Volume (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 500"
                {...register('quantity', { valueAsNumber: true })}
                className={`h-12 w-full rounded-xl border pr-12 pl-4 text-sm font-bold shadow-xs focus:outline-hidden ${
                  errors.quantity
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'
                }`}
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-stone-500">
                KG
              </span>
            </div>
            {errors.quantity && (
              <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Price Per KG in INR */}
          <div>
            <label htmlFor="pricePerKg" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
              Wholesale Rate (₹ / kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-stone-500">
                ₹
              </span>
              <input
                id="pricePerKg"
                type="number"
                min="1"
                step="0.5"
                placeholder="e.g. 30"
                {...register('pricePerKg', { valueAsNumber: true })}
                className={`h-12 w-full rounded-xl border pr-16 pl-9 text-sm font-bold shadow-xs focus:outline-hidden ${
                  errors.pricePerKg
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-stone-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'
                }`}
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-bold text-stone-500">
                / KG
              </span>
            </div>
            {errors.pricePerKg && (
              <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {errors.pricePerKg.message}
              </p>
            )}
          </div>
        </div>

        {/* Real-time Lot Gross Estimation Banner */}
        <div className="flex items-center justify-between rounded-xl bg-brand-50 p-4 text-brand-950 dark:bg-brand-950/40 dark:text-brand-100">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-brand-700 dark:text-brand-400" />
            <div>
              <span className="block text-xs font-bold text-brand-800 dark:text-brand-300">
                Projected Lot Gross Revenue
              </span>
              <span className="text-xs text-brand-600 dark:text-brand-400">
                {formatWeight(watchedQuantity)} × {formatCurrency(watchedPrice)}/kg
              </span>
            </div>
          </div>
          <span className="text-xl font-black text-brand-800 dark:text-brand-300">
            {formatCurrency(estimatedGross)}
          </span>
        </div>

        {/* Lot Photo Upload with Camera support */}
        <div>
          <label className="block text-sm font-bold text-stone-800 dark:text-stone-200">
            Produce Lot Photo (Optional)
          </label>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            High-quality lot photos increase wholesale buyer confidence. (Auto-compressed to under 2MB).
          </p>

          {imagePreviewUrl ? (
            <div className="relative mt-2 aspect-16/9 w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800">
              <img
                src={imagePreviewUrl}
                alt="Selected lot preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/80 text-white backdrop-blur-xs transition-colors hover:bg-red-600"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center dark:border-stone-700 dark:bg-stone-800/40">
              {isCompressing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                    Optimizing produce photo...
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Upload className="h-8 w-8 text-stone-400" />
                    <Camera className="h-8 w-8 text-stone-400" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Drag and drop, choose from gallery, or take a picture
                  </p>
                  <label
                    htmlFor="photo-upload"
                    className="mt-3 inline-flex h-9 cursor-pointer items-center justify-center rounded-xl bg-stone-900 px-4 text-xs font-bold text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
                  >
                    Select Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-5 dark:border-stone-800">
          <Link
            to="/farmer/products"
            className="flex h-12 min-w-[100px] items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={createProductMutation.isPending || isCompressing}
            className="flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden disabled:opacity-50"
          >
            {createProductMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing Lot...</span>
              </>
            ) : (
              <span>Publish to Mandi</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
