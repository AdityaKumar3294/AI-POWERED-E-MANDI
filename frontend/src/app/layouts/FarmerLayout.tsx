import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Award,
  Package,
  ShoppingBag,
  LogOut,
  Sprout,
  Menu,
  X,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileModal } from '@/components/ProfileModal';

export function FarmerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/farmer/dashboard', label: t('nav.dashboard', 'Dashboard'), shortLabel: t('nav.shortDashboard', 'Home'), icon: LayoutDashboard },
    { to: '/farmer/grading', label: t('nav.cropGrading', 'AI Crop Grading'), shortLabel: t('nav.shortGrading', 'Grade'), icon: Camera },
    { to: '/farmer/certificates', label: t('nav.certificates', 'Quality Certs'), shortLabel: t('nav.shortCertificates', 'Certs'), icon: Award },
    { to: '/farmer/products', label: t('nav.myProduce', 'My Produce'), shortLabel: t('nav.shortProduce', 'Produce'), icon: Package },
    { to: '/farmer/orders', label: t('nav.myOrders', 'Orders'), shortLabel: t('nav.shortOrders', 'Orders'), icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-16 sm:pb-0 dark:bg-stone-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/farmer/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm shrink-0">
                <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-brand-800 dark:text-brand-400 leading-tight">
                  {t('brand', 'AI E-Mandi')}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  {t('nav.farmerPortal', 'Farmer Portal')}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `touch-target inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
                        : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {user && (
              <button
                type="button"
                onClick={() => setShowProfile(true)}
                className="touch-target flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-hidden"
                title={t('common.profile', 'View Profile')}
                aria-label={t('common.profile', 'View Profile')}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white shadow-2xs">
                  {user.name ? user.name[0].toUpperCase() : 'F'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {user.name}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {user.location || t('roles.farmer', 'Farmer')}
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="touch-target hidden sm:inline-flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
              title={t('common.logout', 'Logout')}
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Mobile hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="touch-target md:hidden inline-flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900 shadow-lg">
            <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{user?.name}</p>
                <p className="text-xs text-stone-500">{user?.location}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowProfile(true);
                }}
                className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
              >
                {t('common.profile', 'Profile')}
              </button>
            </div>
            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium ${
                        isActive
                          ? 'bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
                          : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <LogOut className="h-5 w-5" />
                {t('common.logout', 'Logout')}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Profile Modal */}
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />

      {/* Bottom Sticky Mobile Tab Bar (For 360px Android devices) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-stone-200 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 md:hidden">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center py-1 transition min-w-0 ${
                  isActive
                    ? 'text-brand-700 dark:text-brand-400 font-bold'
                    : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center">{item.shortLabel || item.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="flex flex-1 flex-col items-center justify-center py-1 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 min-w-0"
        >
          <User className="h-5 w-5 shrink-0" />
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center">{t('common.profile', 'Profile')}</span>
        </button>
      </nav>
    </div>
  );
}
