import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sprout, ShoppingCart, LogIn, UserPlus, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileModal } from '@/components/ProfileModal';

export function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm shrink-0">
              <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-brand-800 dark:text-brand-400">
                {t('brand', 'AI E-Mandi')}
              </span>
              <span className="hidden text-xs text-stone-500 sm:inline sm:ml-2">ई-मंडी</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-3">
            <Link
              to="/buyer/marketplace"
              className="touch-target inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-brand-700 dark:text-stone-300 dark:hover:text-brand-400"
            >
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('nav.marketplace', 'Marketplace')}</span>
            </Link>

            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'}
                  className="touch-target inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.dashboard', 'Dashboard')}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowProfile(true)}
                  className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                  title={t('common.profile', 'Profile')}
                >
                  <User className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                  title={t('common.logout', 'Logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="touch-target inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t('common.login', 'Login')}</span>
                </Link>
                <Link
                  to="/register"
                  className="touch-target hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t('common.register', 'Register')}</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />

      <footer className="border-t border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            © {new Date().getFullYear()} AI-Powered E-Mandi. Empowering Indian Farmers with Computer Vision & Fair Value.
          </p>
        </div>
      </footer>
    </div>
  );
}
