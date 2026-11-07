/**
 * ResetPasswordPage Component
 * Handles setting a new password via reset token with password strength check,
 * session revocation, and auto-redirect countdown.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../core/api/client';
import { generateFingerprint } from '../../core/api/fingerprint';
import { Scale, Lock, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { locale, setCurrentView, showToast } = useAppStore();

  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Extract token from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        setToken(urlToken);
      } else {
        // Fallback or demo token if accessing directly
        setToken('demo-reset-token-sample');
      }
    }
  }, []);

  // Countdown redirect on success
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setRedirectCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCurrentView('login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, setCurrentView]);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = password.length >= 8 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setTokenError(null);

    try {
      const fp = await generateFingerprint();
      const res = await api.post('/api/auth/reset-password', {
        token,
        password,
        fingerprint: fp,
      });

      setLoading(false);

      if (res.success) {
        setSuccess(true);
        showToast(
          locale === 'ar'
            ? 'تم تحديث كلمة المرور بنجاح — تم إنهاء جميع الجلسات القديمة'
            : 'Password updated successfully — previous sessions revoked'
        );
      } else {
        setTokenError(res.error || (locale === 'ar' ? 'الرابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired link'));
      }
    } catch (err: any) {
      setLoading(false);
      setTokenError(err?.message || 'تعذر الاتصال بالخادم');
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 dark:from-amber-400 dark:to-amber-500 dark:text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'اختر كلمة مرور قوية لتأمين حسابك القضائي'
              : 'Choose a strong password to protect your account'}
          </p>
        </div>

        {success ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'تم الحفظ بنجاح' : 'Password Reset Complete'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {locale === 'ar'
                ? `تم تغيير كلمة المرور بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول خلال ${redirectCount} ثوانٍ...`
                : `Your password has been reset. Redirecting to login in ${redirectCount}s...`}
            </p>

            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
            >
              {locale === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In Now'}
            </button>
          </div>
        ) : tokenError ? (
          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-7 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'الرابط غير صالح أو منتهي' : 'Invalid or Expired Link'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {tokenError}
            </p>

            <button
              type="button"
              onClick={() => setCurrentView('forgot_password')}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
            >
              {locale === 'ar' ? 'طلب رابط استعادة جديد' : 'Request New Reset Link'}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl space-y-4"
          >
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ أحرف وأرقام"
                  className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تطابق كلمة المرور"
                  className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{locale === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Save New Password'}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
