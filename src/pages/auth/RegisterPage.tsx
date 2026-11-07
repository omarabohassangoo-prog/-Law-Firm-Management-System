/**
 * RegisterPage Component
 * Full registration flow with password complexity meter, Saudi phone validation,
 * role selection, and post-register email confirmation screen.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { api } from '../../core/api/client';
import { Scale, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { locale, setCurrentView, showToast } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+9665',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'lawyer' | 'secretary',
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: locale === 'ar' ? 'ضعيفة' : 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: locale === 'ar' ? 'متوسطة' : 'Medium', color: 'bg-amber-500' };
    if (score === 4) return { score: 3, label: locale === 'ar' ? 'قوية' : 'Strong', color: 'bg-emerald-500' };
    return { score: 4, label: locale === 'ar' ? 'قوية جداً' : 'Very Strong', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(formData.password);

  const passwordsMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;
  const isFormValid =
    formData.name.trim().length >= 2 &&
    formData.email.includes('@') &&
    formData.phone.length >= 10 &&
    formData.password.length >= 8 &&
    passwordsMatch &&
    formData.terms;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      });

      setLoading(false);

      if (res.success) {
        setRegisteredEmail(formData.email.trim());
        setResendCooldown(60);
        showToast(
          locale === 'ar'
            ? 'تم إنشاء الحساب بنجاح! تم إرسال رابط التفعيل لبريدك'
            : 'Registration successful! Verification link sent to your email'
        );
      } else {
        showToast(res.error || (locale === 'ar' ? 'تعذر إتمام التسجيل' : 'Registration failed'), 'error');
      }
    } catch (err: any) {
      setLoading(false);
      showToast(err?.message || 'خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail || resendCooldown > 0) return;
    try {
      await api.post('/api/auth/resend-verification', { email: registeredEmail });
      setResendCooldown(60);
      showToast(locale === 'ar' ? 'تمت إعادة إرسال رابط التفعيل' : 'Verification link resent');
    } catch {
      showToast(locale === 'ar' ? 'فشل إعادة الإرسال' : 'Resend failed', 'error');
    }
  };

  // If already submitted and awaiting email verification
  if (registeredEmail) {
    return (
      <div className="w-full flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'خطوة أخيرة: تأكيد البريد الإلكتروني' : 'Almost Done: Verify Your Email'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {locale === 'ar'
                ? `أرسلنا رابط تفعيل الحساب إلى ${registeredEmail}. يرجى فحص صندوق الوارد (أو الرسائل غير المرغوبة) والنقر على رابط التفعيل.`
                : `We've sent an activation link to ${registeredEmail}. Please check your inbox and click the link to activate your account.`}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" />
            <span>{locale === 'ar' ? 'صلاحية الرابط 24 ساعة' : 'Link valid for 24 hours'}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {resendCooldown > 0
                ? `${locale === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in'} ${resendCooldown}s`
                : locale === 'ar'
                ? 'إعادة إرسال الرابط'
                : 'Resend Link'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
            >
              {locale === 'ar' ? 'الذهاب لتسجيل الدخول' : 'Proceed to Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[520px] space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 dark:from-amber-400 dark:to-amber-500 dark:text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'انضم إلى منظومة مكتب العدالة للمحاماة والاستشارات القانونية'
              : 'Join Al-Adalah legal management platform'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl space-y-4"
        >
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={locale === 'ar' ? 'مثال: محمد عبد الله السبيعي' : 'e.g. John Doe'}
                className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'رقم الهاتف (سعودي)' : 'Phone Number'} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 5x xxx xxxx"
                  className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'نوع الحساب والتسجيل' : 'Account Type'} *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all cursor-pointer"
            >
              <option value="client">
                {locale === 'ar' ? 'عميل / موكل (أبحث عن خدمات واستشارات قانونية)' : 'Client Portal'}
              </option>
              <option value="lawyer">
                {locale === 'ar' ? 'محامي مرخص (الإنضمام لفريق الترافع والتقاضي)' : 'Licensed Attorney'}
              </option>
              <option value="secretary">
                {locale === 'ar' ? 'سكرتير / استقبال (إدارة المواعيد والاتصالات)' : 'Office Secretary'}
              </option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              {locale === 'ar'
                ? '* حسابات (مدير المكتب / المحاسب / المساعد القانوني) يتم إنشاؤها عبر لوحة تحكم الإدارة حصراً'
                : '* Admin, Accountant, and Assistant accounts are provisioned directly by firm managers'}
            </p>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'كلمة المرور' : 'Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="8+ أحرف وأرقام"
                  className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="مطابقة كلمة المرور"
                  className="w-full ps-10 pe-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{locale === 'ar' ? 'قوة كلمة المرور:' : 'Password strength:'}</span>
                <span className="font-semibold">{strength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-colors ${
                      step <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {locale === 'ar'
                  ? 'أوافق على الشروط والأحكام وسياسة الخصوصية وسرية المعلومات المهنية المعمول بها في مكتب العدالة'
                  : 'I agree to the Terms of Service, Privacy Policy, and Legal Confidentiality standards.'}
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{locale === 'ar' ? 'جارٍ تسجيل الحساب...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{locale === 'ar' ? 'إنشاء الحساب ومتابعة التفعيل' : 'Create Account'}</span>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            <span>{locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'} </span>
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="font-bold text-slate-900 dark:text-slate-100 hover:underline"
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
