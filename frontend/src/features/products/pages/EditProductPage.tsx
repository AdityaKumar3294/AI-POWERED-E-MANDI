import { useState, useEffect, useTransition } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  Lock, 
  ShieldCheck, 
  Coins, 
  X, 
  Loader2 
} from 'lucide-react';
import { productEditSchema, type ProductEditInput } from '../schemas';
import { useProduct, useUpdateProduct } from '../hooks';
import { uploadUrl } from '@/lib/api';
import { compressImage } from '@/lib/image-compress';
import { formatCurrency, formatWeight } from '@/lib/format';
import { GradePill } from '@/components/ui/GradePill';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useProduct(id || '');
  const updateProductMutation = useUpdateProduct();

  const [replacementImageFile, setReplacementImageFile] = useState<File | null>(null);
  const [replacementPreviewUrl, setReplacementPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [, startTransition] = useTransition();

  const product = data?.product;
  const isCertified = Boolean(product?.certificateId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductEditInput>({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      pricePerKg: 0,
      grade: 'A',
      status: 'available',
    },
  });

  const watchedQuantity = watch('quantity') || 0;
  const watchedPrice = watch('pricePerKg') || 0;
  const watchedStatus = watch('status');
  const estimatedGross = watchedQuantity * watchedPrice;

  // Populate form with existing product data once fetched
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        quantity: product.quantity,
        pricePerKg: product.pricePerKg,
        grade: product.grade,
        status: product.status,
      });
    }
  }, [product, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 2 * 1024 * 1024);
      setReplacementImageFile(compressed);

      if (replacementPreviewUrl) {
        URL.revokeObjectURL(replacementPreviewUrl);
      }
      setReplacementPreviewUrl(URL.createObjectURL(compressed));
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCancelImageReplacement = () => {
    if (replacementPreviewUrl) {
      URL.revokeObjectURL(replacementPreviewUrl);
    }
    setReplacementPreviewUrl(null);
    setReplacementImageFile(null);
  };

  const onSubmit = (formDataValues: ProductEditInput) => {
    if (!product) return;

    startTransition(() => {
      const formData = new FormData();
      formData.append('name', formDataValues.name.trim());
      formData.append('quantity', String(formDataValues.quantity));
      formData.append('pricePerKg', String(formDataValues.pricePerKg));
      formData.append('status', formDataValues.status);

      if (!isCertified && formDataValues.grade) {
        formData.append('grade', formDataValues.grade);
      }

      if (replacementImageFile) {
        formData.append('image', replacementImageFile);
      }

      updateProductMutation.mutate(
        { id: product._id, formData },
        {
          onSuccess: () => {
            navigate('/farmer/products');
          },
        }
      );
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Product Not Found"
          message="Could not locate this produce lot on the mandi server."
          onRetry={refetch}
        />
        <div className="mt-4 text-center">
          <Link
            to="/farmer/products"
            className="text-xs font-bold text-brand-700 underline dark:text-brand-400"
          >
            Return to My Produce Lots
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <title>Edit Produce Lot | AI E-Mandi</title>

      {/* Back Link & Header */}
      <div>
        <Link
          to="/farmer/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 transition-colors hover:text-brand-700 dark:text-stone-400 dark:hover:text-brand-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Produce Lots</span>
        </Link>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
          Edit Produce Listing
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Update lot inventory, wholesale price, listing status, or produce photo.
        </p>
      </div>

      {/* Certificate Notice if Certified */}
      {isCertified && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                AI Certified Produce Lot
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Linked to Certificate #{(product.certificateId as any)?.certificateId || product._id}. Produce grade is strictly verified.
              </p>
            </div>
          </div>
          <GradePill grade={product.grade} size="sm" />
        </div>
      )}

      {/* Main Edit Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900"
      >
        {/* Produce Name */}
        <div>
          <label htmlFor="edit-name" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
            Produce Variety / Lot Name <span className="text-red-500">*</span>
          </label>
          <input
            id="edit-name"
            type="text"
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

        {/* Quality Grade Field */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-stone-800 dark:text-stone-200">
              Produce Quality Grade
            </label>
            {isCertified && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Lock className="h-3 w-3" />
                Locked by AI Certificate
              </span>
            )}
          </div>

          {isCertified ? (
            <div className="mt-1.5 flex h-12 w-full items-center justify-between rounded-xl border border-stone-300 bg-stone-100 px-4 text-sm font-bold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
              <span className="flex items-center gap-2">
                <GradePill grade={product.grade} size="sm" />
                <span>Grade {product.grade} (Fixed by Certificate)</span>
              </span>
              <span className="text-xs font-medium text-stone-500">Read-Only</span>
            </div>
          ) : (
            <select
              {...register('grade')}
              className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800 shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              <option value="A">Grade A (Premium & Fresh)</option>
              <option value="B">Grade B (Standard Market)</option>
              <option value="C">Grade C (Processing/Canning)</option>
            </select>
          )}
        </div>

        {/* Quantity & Price Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Stock in KG */}
          <div>
            <label htmlFor="edit-quantity" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
              Available Stock (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="edit-quantity"
                type="number"
                min="0"
                step="1"
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

          {/* Price per KG */}
          <div>
            <label htmlFor="edit-price" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
              Wholesale Rate (₹ / kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-stone-500">
                ₹
              </span>
              <input
                id="edit-price"
                type="number"
                min="1"
                step="0.5"
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

        {/* Listing Visibility Status */}
        <div>
          <label htmlFor="edit-status" className="block text-sm font-bold text-stone-800 dark:text-stone-200">
            Marketplace Visibility Status <span className="text-red-500">*</span>
          </label>
          <select
            id="edit-status"
            {...register('status')}
            className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm font-bold text-stone-800 shadow-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-hidden dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <option value="available">🟢 Available (Visible in Marketplace)</option>
            <option value="sold_out">⚪ Sold Out (Stock Depleted)</option>
            <option value="inactive">🟡 Inactive (Temporarily Hidden)</option>
          </select>
          {watchedQuantity === 0 && watchedStatus === 'available' && (
            <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Note: Lots with 0 kg stock will automatically be marked Sold Out by the mandi server.
            </p>
          )}
        </div>

        {/* Projected Lot Valuation Banner */}
        <div className="flex items-center justify-between rounded-xl bg-brand-50 p-4 text-brand-950 dark:bg-brand-950/40 dark:text-brand-100">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-brand-700 dark:text-brand-400" />
            <div>
              <span className="block text-xs font-bold text-brand-800 dark:text-brand-300">
                Projected Lot Gross Valuation
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

        {/* Image Replacement Section */}
        <div>
          <label className="block text-sm font-bold text-stone-800 dark:text-stone-200">
            Produce Photo
          </label>

          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Current Image */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 p-2 text-center dark:border-stone-800">
              <span className="block pb-2 text-xs font-semibold text-stone-500">
                Current Image
              </span>
              <div className="aspect-4/3 w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                <img
                  src={uploadUrl(product.image)}
                  alt="Current Produce"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Replacement Preview or Upload Box */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 p-2 text-center dark:border-stone-800">
              <span className="block pb-2 text-xs font-semibold text-stone-500">
                {replacementPreviewUrl ? 'New Replacement Image' : 'Replace Photo'}
              </span>

              {replacementPreviewUrl ? (
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                  <img
                    src={replacementPreviewUrl}
                    alt="Replacement Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleCancelImageReplacement}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/80 text-white backdrop-blur-xs transition-colors hover:bg-red-600"
                    title="Cancel replacement"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex aspect-4/3 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/40">
                  {isCompressing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                      <span className="text-xs font-bold text-stone-600">Compressing...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Upload className="h-6 w-6 text-stone-400" />
                        <Camera className="h-6 w-6 text-stone-400" />
                      </div>
                      <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                        Upload a new photo to replace
                      </p>
                      <label
                        htmlFor="replace-photo-input"
                        className="mt-2 inline-flex h-9 cursor-pointer items-center justify-center rounded-xl bg-stone-900 px-3 text-xs font-bold text-white transition-colors hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
                      >
                        Choose Photo
                      </label>
                      <input
                        id="replace-photo-input"
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
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-5 dark:border-stone-800">
          <Link
            to="/farmer/products"
            className="flex h-12 min-w-[100px] items-center justify-center rounded-xl border border-stone-300 px-5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={updateProductMutation.isPending || isCompressing}
            className="flex h-12 min-w-[160px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden disabled:opacity-50"
          >
            {updateProductMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
