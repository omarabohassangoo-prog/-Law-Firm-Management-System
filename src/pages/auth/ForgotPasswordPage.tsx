/**
 * ForgotPasswordPage Component
 * Sends password reset link without user enumeration, with 60s cooldown timer.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../core/api/client';
import { Scale, Mail, Loader2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { locale, setCurrentView, showToast } = useAppStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || loading) return;

    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() });
      setLoading(false);
      setSent(true);
      setCooldown(60);
      showToast(
        locale === 'ar'
          ? 'إذا كان البريد مسجلاً، ستصلك رسالة الاستعادة خلال دقائق'
          : 'If this email is registered, you will receive a reset link shortly'
      );
    } catch {
      setLoading(false);
      setSent(true);
      setCooldown(60);
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
            {locale === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'أدخل بريدك الإلكتروني المسجل لإرسال رابط آمن لإعادة تعيين كلمة المرور'
              : 'Enter your registered email to receive a secure password reset link'}
          </p>
        </div>

        {sent ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'تم إرسال رابط الاستعادة' : 'Reset Link Sent'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {locale === 'ar'
                ? `إذا كان البريد ${email} مسجلاً في النظام، ستصلك رسالة تحتوي على رابط الاستعادة (صالح لمدة ساعة واحدة).`
                : `If ${email} is registered with us, you will receive an email with reset instructions shortly.`}
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={cooldown > 0 || loading}
                className="w-full py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {cooldown > 0
                  ? `${locale === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in'} ${cooldown}s`
                  : locale === 'ar'
                  ? 'إعادة إرسال الرابط'
                  : 'Resend Email'}
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
              >
                {locale === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.includes('@')}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                </>
              ) : (
                <span>{locale === 'ar' ? 'إرسال رابط استعادة كلمة المرور' : 'Send Reset Link'}</span>
              )}
            </button>

            <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:underline"
              >
                {locale === 'ar' ? 'الرجوع إلى صفحة الدخول' : 'Back to Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
