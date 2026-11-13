import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  ShoppingBag, 
  PackageCheck
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !user) return null;

  const isFarmer = user.role === 'farmer';
  const roleBadgeText = isFarmer ? t('roles.farmer', 'Farmer / Producer') : t('roles.buyer', 'Wholesale Buyer');
  const roleThemeColor = isFarmer 
    ? 'bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800' 
    : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';

  const avatarBg = isFarmer ? 'bg-brand-700' : 'bg-amber-600';

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl transition-all dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="touch-target absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
          aria-label="Close profile"
        >
          <X className="h-5 w-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 pt-1">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-md ${avatarBg}`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="profile-modal-title" className="truncate text-xl font-black text-stone-900 dark:text-stone-100">
              {user.name}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${roleThemeColor}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {roleBadgeText}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information List */}
        <div className="mt-6 space-y-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-stone-400 dark:text-stone-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{t('profile.email', 'Email Address')}</p>
              <p className="truncate font-semibold text-stone-900 dark:text-stone-100">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
            <MapPin className="h-4 w-4 text-stone-400 dark:text-stone-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{t('profile.location', 'Primary Location')}</p>
              <p className="truncate font-semibold text-stone-900 dark:text-stone-100">{user.location || t('profile.notSpecified', 'Not Specified')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
            <UserIcon className="h-4 w-4 text-stone-400 dark:text-stone-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{t('profile.userId', 'Account ID')}</p>
              <p className="font-mono text-xs font-semibold text-stone-600 dark:text-stone-300">
                {user.id ? `#${user.id.slice(-8).toUpperCase()}` : '#VERIFIED'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="mt-5 space-y-2">
          {isFarmer ? (
            <>
              <button
                type="button"
                onClick={() => handleNavigate('/farmer/dashboard')}
                className="touch-target flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700/60 transition"
              >
                <LayoutDashboard className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span>{t('common.dashboard', 'Farmer Dashboard')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/farmer/products')}
                className="touch-target flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700/60 transition"
              >
                <PackageCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span>{t('common.myProducts', 'My Listed Produce')}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavigate('/buyer/dashboard')}
                className="touch-target flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700/60 transition"
              >
                <LayoutDashboard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{t('common.dashboard', 'Buyer Dashboard')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/buyer/orders')}
                className="touch-target flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700/60 transition"
              >
                <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{t('common.orders', 'My Wholesale Orders')}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="touch-target mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 px-4 text-sm font-bold text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('common.logout', 'Sign Out')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
