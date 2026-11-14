import { useActionState, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Lock, Mail, Sprout, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { loginSchema } from '../schemas';
import { authApi } from '../api';
import { useAuthStore } from '@/stores/auth';

interface ActionState {
  errors?: Record<string, string[]>;
  error?: string | null;
  success?: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (next) {
        navigate(decodeURIComponent(next), { replace: true });
      } else {
        navigate(currentUser.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace', {
          replace: true,
        });
      }
    }
  }, [isAuthenticated, currentUser, navigate, next]);

  // React 19 useActionState form action
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');

      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        return {
          errors: validation.error.flatten().fieldErrors,
          error: null,
          success: false,
        };
      }

      try {
        const response = await authApi.login({ email, password });
        if (response.token && response.user) {
          setAuth(response.token, response.user);
          toast.success(`Welcome back, ${response.user.name}!`);
          return { success: true, error: null, errors: {} };
        }
        return { success: false, error: 'Login failed', errors: {} };
      } catch (err: any) {
        const message = err.message || 'Invalid email or password';
        toast.error(message);
        return { success: false, error: message, errors: {} };
      }
    },
    { success: false, error: null, errors: {} }
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* React 19 Document Metadata */}
      <title>{t('auth.signInTitle', 'Sign In to E-Mandi')} | {t('brand', 'AI E-Mandi')}</title>
      <meta name="description" content="Log in to access your AI E-Mandi farmer or buyer portal." />

      <div className="w-full max-w-md space-y-6 sm:space-y-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-xl sm:p-8 dark:border-stone-800 dark:bg-stone-900">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-md">
            <Sprout className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
            {t('auth.signInTitle', 'Sign In to E-Mandi')}
          </h1>
          <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">
            {t('auth.signInSubtitle', 'Log in to access your farmer or buyer portal')}
          </p>
        </div>

        {/* Global Server Error Banner */}
        {state.error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            {state.error}
          </div>
        )}

        {/* Form with React 19 formAction */}
        <form action={formAction} className="mt-6 space-y-5">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              {t('auth.emailLabel', 'Email Address')}
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 dark:text-stone-500">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue="farmer@test.com"
                placeholder="name@example.com"
                aria-invalid={Boolean(state.errors?.email)}
                aria-describedby={state.errors?.email ? 'email-error' : undefined}
                className={`touch-target block w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-base text-stone-900 transition placeholder:text-stone-400 focus:outline-hidden dark:bg-stone-800 dark:focus:bg-stone-800 dark:text-stone-100 dark:focus:text-stone-100 dark:placeholder:text-stone-500 ${
                  state.errors?.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500'
                    : 'border-stone-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:focus:border-brand-500'
                }`}
              />
            </div>
            {state.errors?.email && (
              <p id="email-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              {t('auth.passwordLabel', 'Password')}
            </label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 dark:text-stone-500">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                defaultValue="123456"
                placeholder="••••••••"
                aria-invalid={Boolean(state.errors?.password)}
                aria-describedby={state.errors?.password ? 'password-error' : undefined}
                className={`touch-target block w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-base text-stone-900 transition placeholder:text-stone-400 focus:outline-hidden dark:bg-stone-800 dark:focus:bg-stone-800 dark:text-stone-100 dark:focus:text-stone-100 dark:placeholder:text-stone-500 ${
                  state.errors?.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500'
                    : 'border-stone-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:focus:border-brand-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="touch-target absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {state.errors?.password && (
              <p id="password-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 px-4 text-base font-bold text-white shadow-md hover:bg-brand-800 disabled:opacity-60 transition"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t('auth.signingIn', 'Signing In...')}</span>
              </div>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>{t('auth.signInBtn', 'Sign In')}</span>
                <ArrowRight className="h-4 w-4 opacity-75" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Tip for easy testing */}
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-100/80 p-3.5 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800/90 dark:text-stone-200">
          <p className="font-semibold text-stone-900 dark:text-stone-100">{t('auth.demoTipTitle', 'Demo Testing Tip:')}</p>
          <p className="mt-1 text-stone-600 dark:text-stone-300">
            {t('auth.demoTipDesc', 'Register a new farmer or buyer account below, or use your existing credentials to log in.')}
          </p>
        </div>

        {/* Footer Link */}
        <div className="pt-2 text-center text-sm text-stone-600 dark:text-stone-400">
          {t('auth.noAccount', "Don't have an account yet?")}{' '}
          <Link
            to="/register"
            className="font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {t('auth.createAccount', 'Create New Account')}
          </Link>
        </div>
      </div>
    </div>
  );
}
