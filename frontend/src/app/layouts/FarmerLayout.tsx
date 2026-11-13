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
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export function FarmerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farmer/grading', label: 'AI Crop Grading', icon: Camera },
    { to: '/farmer/certificates', label: 'Quality Certs', icon: Award },
    { to: '/farmer/products', label: 'My Produce', icon: Package },
    { to: '/farmer/orders', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-16 sm:pb-0 dark:bg-stone-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/farmer/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
                <Sprout className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-brand-800 dark:text-brand-400">
                  AI E-Mandi
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  Farmer Portal
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
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {user.name}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {user.location || 'Farmer'}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="touch-target hidden sm:inline-flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
              title="Logout"
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
            <div className="mb-3 border-b border-stone-100 pb-2 dark:border-stone-800">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{user?.name}</p>
              <p className="text-xs text-stone-500">{user?.location}</p>
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
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Bottom Sticky Mobile Tab Bar (For 360px Android devices) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 md:hidden">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center py-1 transition ${
                  isActive
                    ? 'text-brand-700 dark:text-brand-400 font-bold'
                    : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

