import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <Languages className="h-4 w-4 text-stone-500" aria-hidden="true" />
      <select
        value={i18n.resolvedLanguage || 'en'}
        onChange={(e) => changeLanguage(e.target.value)}
        aria-label="Select language"
        className="touch-target cursor-pointer rounded-md border border-stone-200 bg-transparent py-1 pl-2 pr-6 text-sm font-medium text-stone-700 hover:border-stone-400 focus:border-brand-700 focus:outline-none dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-600"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="mr">मराठी (Marathi)</option>
      </select>
    </div>
  );
}

