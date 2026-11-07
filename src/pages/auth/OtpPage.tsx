/**
 * OtpPage Component
 * 6-digit OTP verification with auto-advance, auto-backspace, paste handling,
 * auto-submit, and 60-second resend countdown.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore, ROLE_ROUTE_MAP } from '../../store/auth.store';
import { useAppStore } from '../../store/appStore';
import { api } from '../../core/api/client';
import { ShieldCheck, Loader2, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';

export const OtpPage: React.FC = () => {
  const { verifyOtp, loading, pendingOtpToken, user } = useAuthStore();
  const { locale, switchRole, setCurrentView, showToast } = useAppStore();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const submitOtp = async (code: string) => {
    if (code.length !== 6 || loading) return;

    setErrorMessage(null);

    // Call verifyOtp
    const res = await verifyOtp(code);
    if (res.success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role) {
        switchRole(currentUser.role);
      }
      showToast(locale === 'ar' ? 'تم تأكيد الرمز وتسجيل الدخول بنجاح' : 'Code verified! Signed in successfully');
      setCurrentView('dashboard');
    } else {
      setErrorMessage(res.error || (locale === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid verification code'));
      showToast(res.error || (locale === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid verification code'), 'error');
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numbers
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const char = cleanValue.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      submitOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, 5);
    inputsRef.current[nextIndex]?.focus();

    if (pasteData.length === 6) {
      submitOtp(pasteData);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await api.post('/api/auth/resend-otp', { pendingSessionToken: pendingOtpToken });
      setCountdown(60);
      showToast(locale === 'ar' ? 'تم إرسال رمز تحقق جديد إلى هاتفك' : 'New OTP dispatched to your mobile');
    } catch {
      showToast(locale === 'ar' ? 'فشل إعادة الإرسال' : 'Resend failed', 'error');
    }
  };

  const fullOtpCode = digits.join('');
  const isComplete = fullOtpCode.length === 6;

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[420px] space-y-6 text-center">
        {/* Icon & Heading */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'التحقق الثنائي (2FA)' : 'Two-Factor Authentication'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى هاتفك المسجل أو تطبيق المصادقة'
              : 'Enter the 6-digit verification code sent to your registered mobile'}
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <span>{locale === 'ar' ? '💡 رمز الاختبار السريع:' : '💡 Test Code:'}</span>
          <button
            type="button"
            onClick={() => {
              setDigits(['1', '2', '3', '4', '5', '6']);
              submitOtp('123456');
            }}
            className="font-mono font-bold px-2 py-0.5 bg-white dark:bg-slate-900 border border-amber-300 rounded hover:bg-amber-100"
          >
            123456
          </button>
        </div>

        {/* OTP Input Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* 6 Digit Inputs */}
          <div className="flex justify-center gap-2 sm:gap-2.5" dir="ltr">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition-all shadow-inner"
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => submitOtp(fullOtpCode)}
            disabled={loading || !isComplete}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{locale === 'ar' ? 'جارٍ التحقق...' : 'Verifying...'}</span>
              </>
            ) : (
              <span>{locale === 'ar' ? 'تأكيد الرمز والمتابعة' : 'Verify & Continue'}</span>
            )}
          </button>

          {/* Resend & Back to Login */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="text-slate-500">
              <span>{locale === 'ar' ? 'لم تستلم الرمز؟' : "Didn't receive the code?"} </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="font-bold text-slate-900 dark:text-slate-100 hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {countdown > 0
                  ? `${locale === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in'} ${countdown}s`
                  : locale === 'ar'
                  ? 'إعادة الإرسال الآن'
                  : 'Resend Now'}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {locale === 'ar' ? 'الرجوع إلى صفحة تسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
