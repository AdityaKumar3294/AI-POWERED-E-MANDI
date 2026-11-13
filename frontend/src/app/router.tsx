import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout';
import { FarmerLayout } from './layouts/FarmerLayout';
import { BuyerLayout } from './layouts/BuyerLayout';
import { RequireRole } from './RequireRole';
import { RouteErrorBoundary } from './ErrorBoundary';

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
      <span className="text-sm font-medium text-stone-500">Loading page...</span>
    </div>
  );
}

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Lazy Loaded Routes
const LandingPage = React.lazy(() => import('@/features/landing/pages/LandingPage'));
const LoginPage = React.lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('@/features/auth/pages/RegisterPage'));

const MarketplacePage = React.lazy(() => import('@/features/products/pages/MarketplacePage'));
const ProductDetailPage = React.lazy(() => import('@/features/products/pages/ProductDetailPage'));

const GradingPage = React.lazy(() => import('@/features/grading/pages/GradingPage'));
const GradingReportsPage = React.lazy(() => import('@/features/grading/pages/GradingReportsPage'));
const GradingDetailPage = React.lazy(() => import('@/features/grading/pages/GradingDetailPage'));
const CertificatesPage = React.lazy(() => import('@/features/certificates/pages/CertificatesPage'));

const FarmerProductsPage = React.lazy(() => import('@/features/products/pages/FarmerProductsPage'));
const CreateProductPage = React.lazy(() => import('@/features/products/pages/CreateProductPage'));
const EditProductPage = React.lazy(() => import('@/features/products/pages/EditProductPage'));

const FarmerOrdersPage = React.lazy(() => import('@/features/orders/pages/FarmerOrdersPage'));
const BuyerOrdersPage = React.lazy(() => import('@/features/orders/pages/BuyerOrdersPage'));

const FarmerDashboardPage = React.lazy(() => import('@/features/dashboard/pages/FarmerDashboardPage'));
const BuyerDashboardPage = React.lazy(() => import('@/features/dashboard/pages/BuyerDashboardPage'));

const PublicVerifyPage = React.lazy(() => import('@/features/certificates/pages/PublicVerifyPage'));
const NotFoundPage = React.lazy(() => import('@/features/misc/pages/NotFoundPage'));

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: withSuspense(LandingPage) },
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'register', element: withSuspense(RegisterPage) },
      { path: 'marketplace', element: <Navigate to="/buyer/marketplace" replace /> },
    ],
  },

  // Standalone Public Verification Route (No App Chrome)
  {
    path: '/verify/:certificateId',
    element: withSuspense(PublicVerifyPage),
    errorElement: <RouteErrorBoundary />,
  },

  // Protected Farmer Portal Routes
  {
    path: '/farmer',
    element: (
      <RequireRole role="farmer">
        <FarmerLayout />
      </RequireRole>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/farmer/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(FarmerDashboardPage) },
      { path: 'grading', element: withSuspense(GradingPage) },
      { path: 'grading/reports', element: withSuspense(GradingReportsPage) },
      { path: 'grading/:id', element: withSuspense(GradingDetailPage) },
      { path: 'certificates', element: withSuspense(CertificatesPage) },
      { path: 'products', element: withSuspense(FarmerProductsPage) },
      { path: 'products/new', element: withSuspense(CreateProductPage) },
      { path: 'products/:id/edit', element: withSuspense(EditProductPage) },
      { path: 'orders', element: withSuspense(FarmerOrdersPage) },
    ],
  },

  // Buyer Portal Routes (Marketplace is public, but layout provides buyer chrome)
  {
    path: '/buyer',
    element: <BuyerLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/buyer/marketplace" replace /> },
      { path: 'marketplace', element: withSuspense(MarketplacePage) },
      { path: 'product/:id', element: withSuspense(ProductDetailPage) },
      {
        path: 'orders',
        element: (
          <RequireRole role="buyer">
            {withSuspense(BuyerOrdersPage)}
          </RequireRole>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <RequireRole role="buyer">
            {withSuspense(BuyerDashboardPage)}
          </RequireRole>
        ),
      },
    ],
  },

  // Catch-All 404
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
]);

