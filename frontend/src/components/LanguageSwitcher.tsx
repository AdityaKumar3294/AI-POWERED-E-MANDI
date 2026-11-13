import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <Languages className="h-4 w-4 text-stone-500 dark:text-stone-400" aria-hidden="true" />
      <select
        value={i18n.resolvedLanguage || 'en'}
        onChange={(e) => changeLanguage(e.target.value)}
        aria-label="Select language"
        className="touch-target cursor-pointer rounded-lg border border-stone-300 bg-white py-1.5 pl-2.5 pr-7 text-xs font-semibold text-stone-800 shadow-2xs hover:border-stone-400 focus:border-brand-700 focus:outline-hidden dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-stone-600"
      >
        <option value="en" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">English</option>
        <option value="hi" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">हिंदी (Hindi)</option>
        <option value="mr" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">मराठी (Marathi)</option>
      </select>
    </div>
  );
}

