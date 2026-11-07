/**
 * ProtectedRoute Guard
 * Verifies authentication and role-based permissions
 */

import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/appStore';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { locale, setCurrentView } = useAppStore();

  React.useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('login');
    }
  }, [isAuthenticated, setCurrentView]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {locale === 'ar' ? 'غير مصرح لك بالدخول' : 'Access Restricted'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {locale === 'ar'
              ? 'لا تملك الصلاحيات الكافية للوصول إلى هذا القسم. يرجى مراجعة مدير المكتب.'
              : 'You do not have the necessary permissions to access this view. Please contact the administrator.'}
          </p>
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <span>{locale === 'ar' ? 'العودة للوحة التحكم الرئيسية' : 'Return to Main Dashboard'}</span>
            <ArrowLeft className={`w-4 h-4 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
