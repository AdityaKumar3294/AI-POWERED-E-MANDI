import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, LayoutDashboard, LogOut, Sprout } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export function BuyerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/buyer/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { to: '/buyer/orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 pb-16 sm:pb-0 dark:bg-stone-950">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/buyer/marketplace" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
                <Sprout className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-brand-800 dark:text-brand-400">
                  AI E-Mandi
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                  Buyer Portal
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `touch-target inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
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

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {user && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{user.name}</span>
                <span className="text-xs text-stone-500">{user.location || 'Buyer'}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Bottom Sticky Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 sm:hidden">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center py-1 transition ${
                  isActive
                    ? 'text-amber-700 dark:text-amber-400 font-bold'
                    : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

