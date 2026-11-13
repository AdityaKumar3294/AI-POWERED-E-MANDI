import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError();

  let errorMessage = 'An unexpected error occurred.';
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-950 dark:text-red-400">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
        {statusCode === 404 ? 'Page Not Found' : 'Something went wrong'}
      </h1>
      <p className="mt-2 max-w-md text-base text-stone-600 dark:text-stone-400">
        {errorMessage}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="touch-target inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Reload Page
        </button>
        <Link
          to="/"
          className="touch-target inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 transition"
        >
          <Home className="h-4 w-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}

