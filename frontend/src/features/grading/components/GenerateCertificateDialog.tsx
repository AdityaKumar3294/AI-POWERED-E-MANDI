import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface GenerateCertificateDialogProps {
  open: boolean;
  gradingReportId: string;
  defaultProduceName?: string;
  grade: string;
  onClose: () => void;
}

export function GenerateCertificateDialog({
  open,
  gradingReportId,
  defaultProduceName = 'Hybrid Tomatoes',
  grade,
  onClose,
}: GenerateCertificateDialogProps) {
  const navigate = useNavigate();
  const [produceName, setProduceName] = useState(defaultProduceName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produceName.trim()) {
      toast.error('Please enter a produce variety name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient<{ success: boolean; message: string; certificate: any }>('/api/certificates', {
        method: 'POST',
        body: JSON.stringify({
          gradingReportId,
          produceName: produceName.trim(),
        }),
      });

      if (response.success) {
        toast.success('Digital Quality Certificate issued successfully!');
        onClose();
        navigate('/farmer/certificates');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to issue certificate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 id="cert-dialog-title" className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Issue Quality Certificate
              </h2>
              <p className="text-xs text-stone-500">
                Mint tamper-proof Grade {grade} Certificate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target inline-flex items-center justify-center rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="produceName" className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
              Produce Variety / Title (उपज का नाम)
            </label>
            <input
              id="produceName"
              type="text"
              required
              value={produceName}
              onChange={(e) => setProduceName(e.target.value)}
              placeholder="e.g. Hybrid Roma Tomatoes"
              className="touch-target mt-1.5 block w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-base text-stone-900 focus:border-brand-700 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:focus:bg-stone-800 dark:text-stone-100"
            />
            <p className="mt-1 text-xs text-stone-500">
              This name will appear on the official scannable PDF certificate.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Includes Public QR Verification</span>
            </div>
            <p className="opacity-90">
              Buyers can scan the certificate QR code anytime to verify the AI test score.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="touch-target rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="touch-target inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-brand-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Award className="h-4 w-4" />
              )}
              <span>Generate Certificate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

