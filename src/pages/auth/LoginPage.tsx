/**
 * LoginPage Component
 * Full-featured login with fingerprinting, password visibility toggle,
 * remember me (30-day session), rate limit handling, role-based navigation,
 * and quick-login demo accounts.
 */

import React, { useState } from 'react';
import { useAuthStore, ROLE_ROUTE_MAP } from '../../store/auth.store';
import { useAppStore, ROLES_CONFIG } from '../../store/appStore';
import { Scale, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuthStore();
  const { locale, switchRole, setCurrentView, showToast } = useAppStore();

  const [email, setEmail] = useState('admin@aladalah-law.com');
  const [password, setPassword] = useState('Password123!');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = email.trim().length > 3 && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setErrorMessage(null);

    const result = await login(email.trim(), password, remember);

    if (result.requiresOtp) {
      showToast(result.message || 'يرجى إدخال رمز التحقق الثنائي (OTP)', 'info');
      setCurrentView('otp');
      return;
    }

    if (result.success) {
      // Find user role from store or credentials
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role) {
        switchRole(currentUser.role);
      }
      showToast(locale === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully');
      setCurrentView('dashboard');
    } else {
      setErrorMessage(result.error || (locale === 'ar' ? 'البريد أو كلمة المرور غير صحيحة' : 'Invalid email or password'));
      showToast(result.error || (locale === 'ar' ? 'البريد أو كلمة المرور غير صحيحة' : 'Invalid email or password'), 'error');
    }
  };

  // Quick preset loader for evaluation
  const handleQuickPreset = (presetEmail: string, role: UserRole) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[440px] space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 dark:from-amber-400 dark:to-amber-500 dark:text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'تسجيل الدخول للنظام' : 'Sign In to Al-Adalah'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'المنصة الرقمية المتكاملة لإدارة مكتب المحاماة والاستشارات القانونية'
              : 'Secure access to law practice and case management system'}
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {locale === 'ar' ? 'حسابات الاختبار التجريبية (نقرة واحدة للملء):' : 'Test Accounts Preset:'}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300">Password123!</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPreset('admin@aladalah-law.com', 'admin')}
              className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/60 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 truncate text-center"
            >
              {locale === 'ar' ? 'مدير المكتب' : 'Admin'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('lawyer@aladalah-law.com', 'lawyer')}
              className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/60 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 truncate text-center"
            >
              {locale === 'ar' ? 'محامي' : 'Lawyer'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('client@horizon-tech.com', 'client')}
              className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/60 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 truncate text-center"
            >
              {locale === 'ar' ? 'عميل / موكل' : 'Client'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('assistant@aladalah-law.com', 'legal_assistant')}
              className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/60 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 truncate text-center"
            >
              {locale === 'ar' ? 'مساعد قانوني' : 'Assistant'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('accountant@aladalah-law.com', 'accountant')}
              className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/60 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 truncate text-center"
            >
              {locale === 'ar' ? 'محاسب' : 'Accountant'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('secretary@aladalah-law.com', 'secretary')}
              className="px-2 py-1 text-[11px] rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700/60 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 truncate text-center"
            >
              {locale === 'ar' ? 'سكرتير' : 'Secretary'}
            </button>
          </div>
        </div>

        {/* Card Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl space-y-4"
        >
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoFocus
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {locale === 'ar' ? 'كلمة المرور' : 'Password'} *
              </label>
              <button
                type="button"
                onClick={() => setCurrentView('forgot_password')}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 rounded"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {locale === 'ar' ? 'تذكرني لمدة 30 يوماً' : 'Remember me for 30 days'}
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{locale === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>{locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            <span>{locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"} </span>
            <button
              type="button"
              onClick={() => setCurrentView('register')}
              className="font-bold text-slate-900 dark:text-slate-100 hover:underline"
            >
              {locale === 'ar' ? 'سجّل الآن' : 'Register Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
