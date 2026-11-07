/**
 * VerifyEmailPage Component
 * Automatically triggers POST /api/auth/verify-email on mount with loading,
 * success, and error states.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../core/api/client';
import { Scale, Loader2, CheckCircle2, XCircle, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { locale, setCurrentView, showToast } = useAppStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || 'demo-verification-token';

      try {
        const res = await api.post('/api/auth/verify-email', { token });
        if (!active) return;

        if (res.success) {
          setStatus('success');
          showToast(locale === 'ar' ? 'تم تأكيد بريدك الإلكتروني بنجاح' : 'Email verified successfully');
        } else {
          setStatus('error');
          setErrorMessage(res.error || (locale === 'ar' ? 'الرابط غير صالح أو منتهي الصلاحية' : 'Invalid or expired token'));
        }
      } catch (err: any) {
        if (!active) return;
        setStatus('error');
        setErrorMessage(err?.message || 'تعذر الاتصال بالخادم');
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [locale, showToast]);

  const handleResend = async () => {
    if (!resendEmail || !resendEmail.includes('@')) {
      showToast(locale === 'ar' ? 'أدخل بريداً إلكترونياً صحيحاً' : 'Enter a valid email', 'error');
      return;
    }

    try {
      await api.post('/api/auth/resend-verification', { email: resendEmail });
      setResendSent(true);
      showToast(locale === 'ar' ? 'تم إرسال رابط التفعيل الجديد' : 'New activation link sent');
    } catch {
      showToast(locale === 'ar' ? 'فشل إعادة الإرسال' : 'Resend failed', 'error');
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 dark:from-amber-400 dark:to-amber-500 dark:text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'تأكيد الحساب والبريد' : 'Account Verification'}
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-5">
          {status === 'loading' && (
            <div className="space-y-4 py-4">
              <Loader2 className="w-12 h-12 text-slate-900 dark:text-slate-100 animate-spin mx-auto" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'جارٍ التحقق من صلاحية الرابط...' : 'Verifying your activation link...'}
              </h2>
              <p className="text-xs text-slate-500">
                {locale === 'ar' ? 'يرجى الانتظار بضع ثوانٍ' : 'Please wait a moment'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'تم التحقق بنجاح!' : 'Verification Complete!'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {locale === 'ar'
                  ? 'تم تأكيد بريدك الإلكتروني وتفعيل حسابك الرسمي في نظام مكتب العدالة للمحاماة.'
                  : 'Your email has been verified. Your account is active and ready for use.'}
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
              >
                {locale === 'ar' ? 'الانتقال لتسجيل الدخول' : 'Proceed to Login'}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'تعذر تأكيد الرابط' : 'Verification Failed'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {errorMessage}
              </p>

              {resendSent ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                  {locale === 'ar' ? 'تم إرسال رابط تأكيد جديد إلى بريدك.' : 'New link dispatched to your inbox.'}
                </div>
              ) : (
                <div className="pt-2 space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder={locale === 'ar' ? 'أدخل بريدك لإعادة الإرسال' : 'Enter email to resend'}
                      className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {locale === 'ar' ? 'إعادة إرسال رابط التفعيل' : 'Resend Verification Link'}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
              >
                {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
