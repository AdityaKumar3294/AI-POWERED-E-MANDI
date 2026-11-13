import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, Plus, Minus, MapPin, AlertCircle, LogIn } from 'lucide-react';

import type { Product } from '@/types';
import { createOrderSchema, type CreateOrderInput } from '@/features/orders/schemas';
import { useCreateOrder } from '@/features/orders/hooks';
import { useAuthStore } from '@/stores/auth';
import { formatCurrency, formatWeight } from '@/lib/format';

interface OrderFormProps {
  product: Product;
}

export function OrderForm({ product }: OrderFormProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const createOrderMutation = useCreateOrder();

  const isSoldOut = product.quantity <= 0 || product.status === 'sold_out';
  const isFarmer = user?.role === 'farmer';

  const defaultQty = Math.min(Math.max(1, 10), product.quantity || 1);
  const [quantity, setQuantity] = useState(defaultQty);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      productId: product._id,
      quantity: defaultQty,
      deliveryAddress: user?.location ? `Shop/Warehouse, ${user.location}` : '',
    },
  });

  const handleQuantityChange = (newQty: number) => {
    const clamped = Math.max(1, Math.min(newQty, product.quantity));
    setQuantity(clamped);
    setValue('quantity', clamped, { shouldValidate: true });
  };

  const onSubmit = (data: CreateOrderInput) => {
    createOrderMutation.mutate({
      productId: product._id,
      quantity: Number(data.quantity),
      deliveryAddress: data.deliveryAddress.trim(),
    });
  };

  const totalPrice = quantity * product.pricePerKg;

  // Unauthenticated Call-to-Action
  if (!isAuthenticated) {
    const nextUrl = encodeURIComponent(location.pathname);
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-stone-900 dark:text-stone-100">
          Want to purchase this produce?
        </h3>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Sign in as a wholesale buyer to place orders directly with the farmer.
        </p>
        <Link
          to={`/login?next=${nextUrl}`}
          className="touch-target mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-brand-800 transition"
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In to Place Order</span>
        </Link>
      </div>
    );
  }

  // Farmer Restriction Alert
  if (isFarmer) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <p className="font-bold">Farmer Account Notice</p>
          <p className="mt-1">
            You are logged in with a Farmer account. Orders on the marketplace can only be placed by Wholesale Buyer accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <h3 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
        Purchase Order
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
        <input type="hidden" {...register('productId')} value={product._id} />

        {/* Quantity Stepper Capped at Stock */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="order-quantity" className="font-semibold text-stone-700 dark:text-stone-300">
              Quantity (मात्रा)
            </label>
            <span className="text-xs text-stone-500">
              Available: <strong className="text-stone-800 dark:text-stone-200">{formatWeight(product.quantity)}</strong>
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            {/* Decrement Button */}
            <button
              type="button"
              disabled={quantity <= 1 || isSoldOut}
              onClick={() => handleQuantityChange(quantity - 1)}
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>

            {/* Direct Number Input */}
            <div className="relative flex-1">
              <input
                id="order-quantity"
                type="number"
                min="1"
                max={product.quantity}
                disabled={isSoldOut}
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="touch-target block w-full rounded-xl border border-stone-300 bg-stone-50/50 py-2.5 px-3 text-center text-lg font-extrabold text-stone-900 focus:border-brand-700 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-stone-400">
                kg
              </span>
            </div>

            {/* Increment Button */}
            <button
              type="button"
              disabled={quantity >= product.quantity || isSoldOut}
              onClick={() => handleQuantityChange(quantity + 1)}
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Increment Shortcuts */}
          {!isSoldOut && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-stone-400">Quick add:</span>
              {[10, 50, 100].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => handleQuantityChange(quantity + step)}
                  disabled={quantity + step > product.quantity}
                  className="rounded-md border border-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-30 dark:border-stone-700 dark:text-stone-400"
                >
                  +{step} kg
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuantityChange(product.quantity)}
                className="rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
              >
                Max Stock
              </button>
            </div>
          )}

          {errors.quantity && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* Delivery Address */}
        <div>
          <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
            Delivery / Mandi Destination (डिलीवरी का पता)
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute top-3 left-3 text-stone-400">
              <MapPin className="h-5 w-5" />
            </div>
            <textarea
              id="deliveryAddress"
              rows={2}
              disabled={isSoldOut}
              placeholder="e.g. Gala No. 12, APMC Fruit & Veg Market, Vashi, Navi Mumbai"
              {...register('deliveryAddress')}
              className="touch-target block w-full rounded-xl border border-stone-300 bg-stone-50/50 py-2.5 pl-10 pr-3 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-brand-700 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>
          {errors.deliveryAddress && (
            <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
              {errors.deliveryAddress.message}
            </p>
          )}
        </div>

        {/* Live Total Calculation */}
        <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-850">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Rate</span>
            <span>{formatCurrency(product.pricePerKg)} × {quantity} kg</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-stone-200 pt-2 dark:border-stone-700">
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100">Total Amount:</span>
            <span className="text-2xl font-black text-brand-800 dark:text-brand-400">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        {/* Submit Order Button */}
        <button
          type="submit"
          disabled={isSoldOut || createOrderMutation.isPending}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 px-4 text-base font-bold text-white shadow-md hover:bg-brand-800 disabled:opacity-50 transition"
        >
          {createOrderMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Reserving Stock & Placing Order...</span>
            </div>
          ) : isSoldOut ? (
            <span>Sold Out (उपलब्ध नहीं है)</span>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" />
              <span>Confirm & Place Order</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

