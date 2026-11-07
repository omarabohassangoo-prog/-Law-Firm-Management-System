/**
 * Session Timeout Warning Modal
 * Displays 2-minute countdown warning before automatic logout due to inactivity
 */

import React from 'react';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import { useAppStore } from '../../store/appStore';
import { Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export const SessionTimeoutModal: React.FC = () => {
  const { showWarning, secondsRemaining, extendSession, logoutNow } = useSessionTimeout();
  const { locale } = useAppStore();

  if (!showWarning) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'تنبيه: اقتراب انتهاء الجلسة' : 'Session Expiring Soon'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {locale === 'ar'
              ? 'نظراً لعدم وجود نشاط، سيتم تسجيل خروجك تلقائياً للحفاظ على سرية ملفات القضايا خلال:'
              : 'Due to inactivity, you will be automatically logged out to protect case files in:'}
          </p>
        </div>

        {/* Big countdown badge */}
        <div className="py-2.5 px-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-2xl font-mono font-bold text-amber-700 dark:text-amber-300 inline-block">
          {formattedTime}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={extendSession}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {locale === 'ar' ? 'تمديد الجلسة ومتابعة العمل' : 'Extend Session'}
          </button>
          <button
            type="button"
            onClick={() => logoutNow()}
            className="w-full sm:w-auto py-2.5 px-4 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {locale === 'ar' ? 'تسجيل الخروج الآن' : 'Log Out Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
