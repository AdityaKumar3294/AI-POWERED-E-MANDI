import { useActionState, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, MapPin, Eye, EyeOff, Sprout, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { registerSchema } from '../schemas';
import { authApi } from '../api';
import { RoleToggle } from '../components/RoleToggle';

interface ActionState {
  errors?: Record<string, string[]>;
  error?: string | null;
  success?: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [showPassword, setShowPassword] = useState(false);

  // React 19 useActionState form action
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');
      const location = String(formData.get('location') || '').trim();
      const selectedRole = String(formData.get('role') || role) as 'farmer' | 'buyer';

      const validation = registerSchema.safeParse({
        name,
        email,
        password,
        role: selectedRole,
        location,
      });

      if (!validation.success) {
        return {
          errors: validation.error.flatten().fieldErrors,
          error: null,
          success: false,
        };
      }

      try {
        const response = await authApi.register({
          name,
          email,
          password,
          role: selectedRole,
          location,
        });

        if (response.success) {
          toast.success('Registration successful! Please log in with your credentials.');
          navigate('/login', { replace: true });
          return { success: true, error: null, errors: {} };
        }
        return { success: false, error: response.message || 'Registration failed', errors: {} };
      } catch (err: any) {
        const message = err.message || 'Registration failed. This email may already be registered.';
        toast.error(message);
        return { success: false, error: message, errors: {} };
      }
    },
    { success: false, error: null, errors: {} }
  );

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* React 19 Document Metadata */}
      <title>Register | AI-Powered E-Mandi</title>
      <meta name="description" content="Register as a farmer or buyer on the AI-Powered E-Mandi platform." />

      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8 dark:border-stone-800 dark:bg-stone-900">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-md">
            <Sprout className="h-8 w-8" />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-100">
            Create an Account
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            ई-मंडी पर अपना खाता बनाएं
          </p>
        </div>

        {/* Global Error Banner */}
        {state.error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            {state.error}
          </div>
        )}

        {/* Registration Form */}
        <form action={formAction} className="space-y-4">
          {/* Account Role Selector */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-stone-700 dark:text-stone-300">
              I want to register as (खाता प्रकार चुनें)
            </label>
            <RoleToggle value={role} onChange={setRole} disabled={isPending} />
            <input type="hidden" name="role" value={role} />
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              Full Name (पूरा नाम)
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <User className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder={role === 'farmer' ? 'e.g. Ramesh Kumar' : 'e.g. Rajesh Wholesalers'}
                aria-invalid={Boolean(state.errors?.name)}
                aria-describedby={state.errors?.name ? 'name-error' : undefined}
                className={`touch-target block w-full rounded-xl border bg-stone-50/50 py-3 pl-10 pr-4 text-base text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:outline-none dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-850 ${
                  state.errors?.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-stone-300 focus:border-brand-700 dark:border-stone-700'
                }`}
              />
            </div>
            {state.errors?.name && (
              <p id="name-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              Email Address (ईमेल)
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                aria-invalid={Boolean(state.errors?.email)}
                aria-describedby={state.errors?.email ? 'email-error' : undefined}
                className={`touch-target block w-full rounded-xl border bg-stone-50/50 py-3 pl-10 pr-4 text-base text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:outline-none dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-850 ${
                  state.errors?.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-stone-300 focus:border-brand-700 dark:border-stone-700'
                }`}
              />
            </div>
            {state.errors?.email && (
              <p id="email-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              Location / Mandi (स्थान / मंडी)
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="location"
                name="location"
                type="text"
                required
                placeholder="e.g. Nashik, Maharashtra"
                aria-invalid={Boolean(state.errors?.location)}
                aria-describedby={state.errors?.location ? 'location-error' : undefined}
                className={`touch-target block w-full rounded-xl border bg-stone-50/50 py-3 pl-10 pr-4 text-base text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:outline-none dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-850 ${
                  state.errors?.location
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-stone-300 focus:border-brand-700 dark:border-stone-700'
                }`}
              />
            </div>
            {state.errors?.location && (
              <p id="location-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {state.errors.location[0]}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-stone-700 dark:text-stone-300"
            >
              Password (पासवर्ड - कम से कम 6 अक्षर)
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="••••••••"
                aria-invalid={Boolean(state.errors?.password)}
                aria-describedby={state.errors?.password ? 'password-error' : undefined}
                className={`touch-target block w-full rounded-xl border bg-stone-50/50 py-3 pl-10 pr-11 text-base text-stone-900 transition placeholder:text-stone-400 focus:bg-white focus:outline-none dark:bg-stone-800 dark:text-stone-100 dark:focus:bg-stone-850 ${
                  state.errors?.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-stone-300 focus:border-brand-700 dark:border-stone-700'
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
            className="touch-target mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 px-4 text-base font-bold text-white shadow-md hover:bg-brand-800 disabled:opacity-60 transition"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Registering Account...</span>
              </div>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Complete Registration</span>
                <ArrowRight className="h-4 w-4 opacity-75" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center text-sm text-stone-600 dark:text-stone-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Sign In Here (लॉग इन करें)
          </Link>
        </div>
      </div>
    </div>
  );
}
