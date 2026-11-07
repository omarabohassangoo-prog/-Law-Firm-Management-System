import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { api } from '../../core/api/client';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const { locale, showToast, addContactMessage } = useAppStore();
  const t = useTranslation(locale);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    honeypot: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Validation checks
  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  const errors = {
    name:
      !formData.name.trim()
        ? locale === 'ar'
          ? 'الاسم مطلوب'
          : 'Name is required'
        : formData.name.trim().length < 2
        ? locale === 'ar'
          ? 'الاسم قصير جداً (حرفان على الأقل)'
          : 'Name too short'
        : '',
    email:
      !formData.email.trim()
        ? locale === 'ar'
          ? 'البريد الإلكتروني مطلوب'
          : 'Email is required'
        : !emailRegex.test(formData.email.trim())
        ? locale === 'ar'
          ? 'بريد إلكتروني غير صالح'
          : 'Invalid email format'
        : '',
    subject:
      !formData.subject.trim()
        ? locale === 'ar'
          ? 'موضوع الاستشارة مطلوب'
          : 'Subject is required'
        : formData.subject.trim().length < 3
        ? locale === 'ar'
          ? 'الموضوع قصير جداً'
          : 'Subject too short'
        : '',
    message:
      !formData.message.trim()
        ? locale === 'ar'
          ? 'نص الرسالة مطلوب'
          : 'Message is required'
        : formData.message.trim().length < 10
        ? locale === 'ar'
          ? 'الرسالة يجب ألا تقل عن 10 أحرف'
          : 'Message must be at least 10 characters'
        : '',
  };

  const isFormValid = !errors.name && !errors.email && !errors.subject && !errors.message;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });

    if (!isFormValid) {
      showToast(locale === 'ar' ? 'يرجى مراجعة وتصحيح الحقول المطلوبة' : 'Please fix form errors', 'error');
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const response = await api.post('/api/public/contact', formData);

      if (response.success) {
        setSuccess(true);
        // Also persist in client-side store for instant sync in admin dashboard
        addContactMessage({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        });

        showToast(
          locale === 'ar'
            ? 'تم إرسال رسالتك بنجاح، سيتواصل معك أحد محامينا خلال 24 ساعة'
            : 'Your message was sent successfully. Our counsel will contact you within 24 hours.'
        );

        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          honeypot: '',
        });
        setTouched({});

        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setServerError(response.error || 'حدث خطأ أثناء الإرسال');
        showToast(response.error || 'حدث خطأ أثناء الإرسال', 'error');
      }
    } catch (err: any) {
      setServerError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs">
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              {locale === 'ar' ? 'تم استلام استشارتك بنجاح' : 'Inquiry Submitted Successfully'}
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              {locale === 'ar'
                ? 'تم تسجيل طلبك وتمريره للمحامي المختص. سنقوم بالتواصل معك في أقرب وقت.'
                : 'Your legal inquiry has been dispatched to assigned counsel. We will contact you shortly.'}
            </p>
          </div>
        </div>
      )}

      {serverError && (
        <div className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (hidden for bots) */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.honeypot}
            onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.fullName} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => handleBlur('name')}
            placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
            className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none transition-colors ${
              touched.name && errors.name
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100'
            }`}
          />
          {touched.name && errors.name && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.name}</span>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.emailAddress} *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              placeholder="you@example.com"
              className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none transition-colors ${
                touched.email && errors.email
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100'
              }`}
            />
            {touched.email && errors.email && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.phoneNumber} <span className="text-slate-400 font-normal">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+966 5XX XXX XXXX"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.subject} *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            onBlur={() => handleBlur('subject')}
            placeholder={locale === 'ar' ? 'بماذا نساعدك؟ (مثال: نزاع عقدي، حوكمة شركة)' : 'How can we assist you?'}
            className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none transition-colors ${
              touched.subject && errors.subject
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100'
            }`}
          />
          {touched.subject && errors.subject && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.subject}</span>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.message} *
          </label>
          <textarea
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            onBlur={() => handleBlur('message')}
            placeholder={locale === 'ar' ? 'اكتب تفاصيل استفسارك القانوني ووقائع القضية...' : 'Provide details regarding your legal matter...'}
            className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border rounded-lg focus:outline-none transition-colors ${
              touched.message && errors.message
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-slate-200 dark:border-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100'
            }`}
          />
          {touched.message && errors.message && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{locale === 'ar' ? 'جارٍ الإرسال والتسجيل...' : 'Submitting...'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{locale === 'ar' ? 'إرسال الرسالة والاستشارة' : 'Submit Consultation Request'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
