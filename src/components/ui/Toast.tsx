import React from 'react';
import { useAppStore } from '../../store/appStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 start-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        let borderClass = 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
          borderClass = 'border-rose-200 dark:border-rose-800/60 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
          borderClass = 'border-amber-200 dark:border-amber-800/60 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />;
          borderClass = 'border-sky-200 dark:border-sky-800/60 bg-sky-50/95 dark:bg-sky-950/90 text-sky-900 dark:text-sky-100';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-sm text-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-inherit"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
