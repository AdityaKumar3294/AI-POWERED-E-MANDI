import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-500 px-4 py-2 text-xs font-bold text-amber-950 shadow-md transition-all"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0 text-amber-950" />
        <span>
          You are currently offline. Viewing cached mandi shell. Offline actions will sync once reconnected.
        </span>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 rounded-md bg-amber-600/40 px-2 py-1 text-xs text-amber-950 transition-colors hover:bg-amber-600/60"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );
}

