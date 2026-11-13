import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <title>Page Not Found | AI E-Mandi</title>
      <div className="rounded-full bg-stone-100 p-4 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
        404 — Page Not Found
      </h1>
      <p className="mt-2 max-w-sm text-base text-stone-600 dark:text-stone-400">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="touch-target mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-800 transition"
      >
        <Home className="h-4 w-4" />
        Return to Home
      </Link>
    </div>
  );
}

