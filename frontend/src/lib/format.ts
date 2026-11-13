/**
 * Formats a number to Indian Rupee (INR) currency format (e.g. ₹1,250.00).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Formats weights in kilograms with comma separators.
 */
export function formatWeight(kg: number): string {
  const formatted = new Intl.NumberFormat('en-IN').format(kg || 0);
  return `${formatted} kg`;
}

/**
 * Formats ISO date string to Indian localized human-readable date.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats ISO date string with time.
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

