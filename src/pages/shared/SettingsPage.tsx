import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { Settings, Shield, Clock, Building, Scale, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { locale, firmSettings, updateFirmSettings, showToast } = useAppStore();
  const t = useTranslation(locale);

  const [formData, setFormData] = useState({ ...firmSettings });
  const [securityPrefs, setSecurityPrefs] = useState({
    enforce2FA: true,
    sessionTimeoutMins: 15,
    auditRetentionDays: 365,
    autoBackupEnabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirmSettings(formData);
    showToast(locale === 'ar' ? 'تم حفظ وتحديث إعدادات المكتب بنجاح' : 'Firm profile & settings updated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t.navSettings}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {locale === 'ar'
            ? 'الهوية المؤسسية، بيانات الترخيص والضريبة، ومعايير الأمان والامتثال'
            : 'Institutional profile, license & tax credentials, security parameters, and compliance'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Practice Identity & Credentials */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'بيانات وهوية مكتب المحاماة' : 'Practice Credentials'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'اسم المكتب (بالعربية)' : 'Firm Name (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.firmNameAr}
                onChange={(e) => setFormData({ ...formData, firmNameAr: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'اسم المكتب (بالإنجليزية)' : 'Firm Name (English)'}
              </label>
              <input
                type="text"
                value={formData.firmNameEn}
                onChange={(e) => setFormData({ ...formData, firmNameEn: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'رقم ترخيص وزارة العدل' : 'MoJ License #'}
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'الرقم الضريبي (ZATCA)' : 'Tax VAT Number'}
              </label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'رسوم الاستشارة الافتراضية' : 'Default Consultation Fee'} ({formData.currency})
              </label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.officePhone}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.officeEmail}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'العنوان والمقر الرئيسي' : 'Office Headquarters Address'}
            </label>
            <input
              type="text"
              value={formData.addressAr}
              onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'إعدادات الأمان وسياسات الجلسات (ISO 27001)' : 'Security Policies & Session Governance'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                {locale === 'ar' ? 'إلزام التحقق الثنائي (2FA)' : 'Mandatory 2FA'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {locale === 'ar' ? 'إلزام المحامين والمحاسبين بالتحقق عبر OTP' : 'Enforce two-factor auth for all staff'}
              </p>
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={securityPrefs.enforce2FA}
                  onChange={(e) => setSecurityPrefs({ ...securityPrefs, enforce2FA: e.target.checked })}
                  className="rounded text-slate-900 focus:ring-slate-900"
                />
                <span className="ms-2 font-medium">{locale === 'ar' ? 'مفعل لكافة الطاقم' : 'Enforce Globally'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                {locale === 'ar' ? 'مهلة انتهاء الجلسة (Session Timeout)' : 'Session Timeout'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {locale === 'ar' ? 'إغلاق الجلسة عند عدم النشاط لحماية البيانات' : 'Inactivity timeout for security'}
              </p>
              <select
                value={securityPrefs.sessionTimeoutMins}
                onChange={(e) => setSecurityPrefs({ ...securityPrefs, sessionTimeoutMins: Number(e.target.value) })}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
              >
                <option value={15}>15 {locale === 'ar' ? 'دقيقة' : 'minutes'}</option>
                <option value={30}>30 {locale === 'ar' ? 'دقيقة' : 'minutes'}</option>
                <option value={60}>60 {locale === 'ar' ? 'دقيقة' : 'minutes'}</option>
              </select>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                {locale === 'ar' ? 'حفظ سجل التدقيق (Audit Logs)' : 'Audit Retention'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {locale === 'ar' ? 'الاحتفاظ بسجلات العمليات والولوج' : 'Append-only audit trail logs'}
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block pt-1">
                365 {locale === 'ar' ? 'يوماً (متوافق مع المعايير)' : 'Days Compliant'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
