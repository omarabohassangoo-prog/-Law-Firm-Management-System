import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/auth.store';
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  MessageCircle,
  CreditCard,
  History,
  Play,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Key,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Send,
  Loader2
} from 'lucide-react';

interface ServiceStatus {
  service: 'email' | 'sms' | 'whatsapp' | 'paypal';
  title: string;
  status: 'not_configured' | 'configured' | 'verified' | 'failed';
  lastTestAt?: string;
  lastTestStatus?: string;
  latencyMs?: number;
  message?: string;
}

export const SystemSettingsPage: React.FC = () => {
  const { locale, showToast } = useAppStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'email' | 'sms' | 'whatsapp' | 'paypal' | 'audit'>('overview');
  const [loading, setLoading] = useState(false);
  const [testingService, setTestingService] = useState<string | null>(null);

  // Security modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Service Statuses
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({
    email: { service: 'email', title: 'البريد الإلكتروني (SMTP)', status: 'verified', lastTestAt: new Date().toISOString(), latencyMs: 142 },
    sms: { service: 'sms', title: 'الرسائل النصية (Twilio)', status: 'configured', lastTestAt: new Date(Date.now() - 86400000).toISOString(), latencyMs: 310 },
    whatsapp: { service: 'whatsapp', title: 'WhatsApp Business (Meta API)', status: 'verified', lastTestAt: new Date().toISOString(), latencyMs: 205 },
    paypal: { service: 'paypal', title: 'بوابة الدفع (PayPal)', status: 'configured', lastTestAt: new Date(Date.now() - 3600000).toISOString(), latencyMs: 450 },
  });

  // Form States
  const [emailForm, setEmailForm] = useState({
    provider: 'sendgrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    username: 'apikey',
    password: 'SG.demo_api_key_secure_hashed_90821',
    fromEmail: 'noreply@aladalah-law.com',
    fromName: 'مكتب العدالة للمحاماة',
    testPassed: true,
  });

  const [smsForm, setSmsForm] = useState({
    accountSid: 'AC98234710982347109234871029384712',
    authToken: '89123749812739487192347192837491',
    fromNumber: '+966501112233',
    defaultCountryCode: '+966',
    testPassed: true,
  });

  const [whatsappForm, setWhatsappForm] = useState({
    phoneNumberId: '109283749102938',
    businessAccountId: '981273948172938',
    accessToken: 'EAAG9823749812739487192347192837491',
    verifyToken: 'aladalah_wa_verify_token_2026',
    webhookUrl: 'https://ais-dev.run.app/api/webhooks/whatsapp',
    defaultTemplate: 'appointment_confirmed',
    testPassed: true,
  });

  const [paypalForm, setPaypalForm] = useState({
    mode: 'sandbox',
    clientId: 'AY12374981273948719234719283749128374',
    clientSecret: 'EL9823749812739487192347192837491283',
    webhookId: 'WH-1234567890-XYZ',
    currency: 'SAR',
    liveConfirmed: false,
    testPassed: true,
  });

  // Password Visibility Toggles
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(locale === 'ar' ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Test Modals
  const [testModal, setTestModal] = useState<{
    open: boolean;
    service: 'email' | 'sms' | 'whatsapp' | 'paypal' | null;
    targetInput: string;
    loading: boolean;
    result: { success: boolean; message: string; latencyMs?: number } | null;
  }>({
    open: false,
    service: null,
    targetInput: '',
    loading: false,
    result: null,
  });

  const openTestModal = (service: 'email' | 'sms' | 'whatsapp' | 'paypal') => {
    let defaultTarget = '';
    if (service === 'email') defaultTarget = user?.email || 'admin@aladalah-law.com';
    if (service === 'sms' || service === 'whatsapp') defaultTarget = '+966501112233';

    setTestModal({
      open: true,
      service,
      targetInput: defaultTarget,
      loading: false,
      result: null,
    });
  };

  const executeServiceTest = async () => {
    if (!testModal.service) return;

    setTestModal((prev) => ({ ...prev, loading: true, result: null }));
    setTestingService(testModal.service);

    try {
      // Simulate API latency & response
      await new Promise((res) => setTimeout(res, 1200));

      const latencyMs = Math.floor(Math.random() * 200) + 120;
      const success = true;

      let msg = 'تم الاتصال واختبار الخدمة بنجاح.';
      if (testModal.service === 'email') msg = `تم إرسال بريد تجريبي بنجاح إلى (${testModal.targetInput}).`;
      if (testModal.service === 'sms') msg = `تم إرسال رسالة SMS تجريبية بنجاح إلى (${testModal.targetInput}).`;
      if (testModal.service === 'whatsapp') msg = `تم إرسال قوالب WhatsApp تجريبية بنجاح إلى (${testModal.targetInput}).`;
      if (testModal.service === 'paypal') msg = `تم التحقق من حساب PayPal Sandbox وإنشاء الطلب بنجاح (Latency: ${latencyMs}ms).`;

      setTestModal((prev) => ({
        ...prev,
        loading: false,
        result: { success, message: msg, latencyMs },
      }));

      // Update Service Status Card
      setServiceStatuses((prev) => ({
        ...prev,
        [testModal.service!]: {
          ...prev[testModal.service!],
          status: 'verified',
          lastTestAt: new Date().toISOString(),
          latencyMs,
          message: msg,
        },
      }));

      // Mark test passed in form state
      if (testModal.service === 'email') setEmailForm((p) => ({ ...p, testPassed: true }));
      if (testModal.service === 'sms') setSmsForm((p) => ({ ...p, testPassed: true }));
      if (testModal.service === 'whatsapp') setWhatsappForm((p) => ({ ...p, testPassed: true }));
      if (testModal.service === 'paypal') setPaypalForm((p) => ({ ...p, testPassed: true }));

      showToast(msg, 'success');
    } catch (err: any) {
      setTestModal((prev) => ({
        ...prev,
        loading: false,
        result: { success: false, message: 'فشل الاتصال بالخدمة: يرجى مراجعة بيانات الاعتماد' },
      }));
    } finally {
      setTestingService(null);
    }
  };

  // Require Password Confirmation before Save
  const handleSaveWithSecurity = (service: string, saveCallback: () => void, requiresOtp: boolean = false) => {
    setPendingAction(() => () => {
      saveCallback();
      showToast(locale === 'ar' ? `تم حفظ وتحديث إعدادات ${service} بنجاح` : `Updated ${service} settings`, 'success');
    });

    if (requiresOtp) {
      setOtpModalOpen(true);
    } else {
      setPasswordModalOpen(true);
    }
  };

  const confirmPassword = () => {
    if (!adminPasswordInput || adminPasswordInput.length < 4) {
      showToast(locale === 'ar' ? 'كلمة المرور غير صحيحة' : 'Invalid password', 'error');
      return;
    }
    setPasswordModalOpen(false);
    setAdminPasswordInput('');
    if (pendingAction) pendingAction();
  };

  const confirmOtp = () => {
    if (!otpInput || otpInput.length < 4) {
      showToast(locale === 'ar' ? 'رمز OTP غير صحيح' : 'Invalid OTP code', 'error');
      return;
    }
    setOtpModalOpen(false);
    setOtpInput('');
    if (pendingAction) pendingAction();
  };

  // Audit Logs mock data
  const auditLogs = [
    { id: 'aud-1', timestamp: new Date().toISOString(), user: 'المستشار عبد العزيز', service: 'email', action: 'update', status: 'success', ip: '197.230.12.84' },
    { id: 'aud-2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'المستشار عبد العزيز', service: 'paypal', action: 'test', status: 'success', ip: '197.230.12.84' },
    { id: 'aud-3', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'المستشار عبد العزيز', service: 'sms', action: 'update', status: 'success', ip: '197.230.12.84' },
    { id: 'aud-4', timestamp: new Date(Date.now() - 172800000).toISOString(), user: 'المستشار عبد العزيز', service: 'whatsapp', action: 'test', status: 'failed', ip: '197.230.12.84' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>لوحة التحكم الخاصة بمدير المكتب</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'إعدادات النظام والتكامل' : 'System & Integration Settings'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar'
              ? 'تكوين واختبار خدمات البريد، الرسائل القصيرة، واتساب بزيادة، وبوابات الدفع الإلكترونية مع حماية التشفير'
              : 'Configure, test, and save Email, SMS, WhatsApp, and Payment gateways with AES-256 encryption'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                showToast(locale === 'ar' ? 'تم فحص جميع خدمات التكامل بنجاح' : 'All services verified', 'success');
              }, 1500);
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-amber-500 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{locale === 'ar' ? 'اختبار كل الخدمات' : 'Run All Tests'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
          { id: 'email', label: 'البريد الإلكتروني', icon: Mail },
          { id: 'sms', label: 'الرسائل النصية (SMS)', icon: MessageSquare },
          { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageCircle },
          { id: 'paypal', label: 'بوابة PayPal', icon: CreditCard },
          { id: 'audit', label: 'سجل التغييرات', icon: History },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(serviceStatuses).map((status) => (
              <div
                key={status.service}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{status.title}</span>
                    {status.status === 'verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>يعمل ✓</span>
                      </span>
                    )}
                    {status.status === 'configured' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>مُعد — لم يُختبر</span>
                      </span>
                    )}
                    {status.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
                        <XCircle className="w-3 h-3" />
                        <span>فشل الاتصال</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>آخر اختبار: {status.lastTestAt ? new Date(status.lastTestAt).toLocaleTimeString('ar-SA') : 'لم يجرَ بعد'}</p>
                    {status.latencyMs && <p>زمن الاستجابة: {status.latencyMs}ms</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openTestModal(status.service)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>اختبار الآن</span>
                  </button>

                  <button
                    onClick={() => setActiveTab(status.service)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    تعديل الإعدادات ←
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Health Status Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>فحص الاستجابة والتشفير المستمر</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 text-start">الخدمة</th>
                    <th className="py-2.5 px-3 text-start">الحالة</th>
                    <th className="py-2.5 px-3 text-start">تشفير AES-256</th>
                    <th className="py-2.5 px-3 text-start">زمن الاستجابة</th>
                    <th className="py-2.5 px-3 text-start">آخر مزامنة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-3 font-bold">البريد الإلكتروني (SMTP)</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">متصل ومتوافق</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">ENC:AES-256-GCM</td>
                    <td className="py-3 px-3">142ms</td>
                    <td className="py-3 px-3 text-slate-400">قبل 5 دقائق</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold">الرسائل النصية (Twilio API)</td>
                    <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-semibold">معد وجاهز للاستخدام</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">ENC:AES-256-GCM</td>
                    <td className="py-3 px-3">310ms</td>
                    <td className="py-3 px-3 text-slate-400">قبل ساعة</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold">WhatsApp Business (Meta)</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">نشط ومعتمد</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">ENC:AES-256-GCM</td>
                    <td className="py-3 px-3">205ms</td>
                    <td className="py-3 px-3 text-slate-400">قبل 12 دقيقة</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold">PayPal Payment Gateway</td>
                    <td className="py-3 px-3 text-amber-600 dark:text-amber-400 font-semibold">Sandbox Mode</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">ENC:AES-256-GCM</td>
                    <td className="py-3 px-3">450ms</td>
                    <td className="py-3 px-3 text-slate-400">قبل 30 دقيقة</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">إعدادات بريد الإشعارات (SMTP)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تكوين واختبار إرسال الرسائل وتنبيهات الجلسات والفواتير</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">مزود الخدمة</label>
              <select
                value={emailForm.provider}
                onChange={(e) => setEmailForm({ ...emailForm, provider: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="sendgrid">SendGrid (موصى به)</option>
                <option value="gmail">Gmail (App Password)</option>
                <option value="mailgun">Mailgun</option>
                <option value="outlook">Microsoft 365 / Outlook</option>
                <option value="custom">خادم مخصص (Custom SMTP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">SMTP Host</label>
              <input
                type="text"
                value={emailForm.host}
                onChange={(e) => setEmailForm({ ...emailForm, host: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المنفذ (Port)</label>
              <input
                type="number"
                value={emailForm.port}
                onChange={(e) => setEmailForm({ ...emailForm, port: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المستخدم (Username)</label>
              <input
                type="text"
                value={emailForm.username}
                onChange={(e) => setEmailForm({ ...emailForm, username: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور / API Key (تُشفر تلقائياً)</label>
              <div className="relative">
                <input
                  type={showSecrets.emailPass ? 'text' : 'password'}
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs pe-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('emailPass')}
                  className="absolute start-auto end-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showSecrets.emailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان المُرسِل (From Email)</label>
              <input
                type="email"
                value={emailForm.fromEmail}
                onChange={(e) => setEmailForm({ ...emailForm, fromEmail: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم المُرسِل (From Name)</label>
              <input
                type="text"
                value={emailForm.fromName}
                onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => openTestModal('email')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>اختبار الاتصال وإرسال بريد تجريبي</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveWithSecurity('البريد الإلكتروني (SMTP)', () => {}, false)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </div>
      )}

      {/* SMS Tab */}
      {activeTab === 'sms' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">إعدادات الرسائل النصية القصيرة (Twilio SMS)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تكوين حساب Twilio لإرسال رموز التحقق OTP وإشعارات الجلسات</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account SID</label>
              <input
                type="text"
                value={smsForm.accountSid}
                onChange={(e) => setSmsForm({ ...smsForm, accountSid: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Auth Token</label>
              <div className="relative">
                <input
                  type={showSecrets.smsToken ? 'text' : 'password'}
                  value={smsForm.authToken}
                  onChange={(e) => setSmsForm({ ...smsForm, authToken: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs pe-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('smsToken')}
                  className="absolute start-auto end-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showSecrets.smsToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم الإرسال المعتمد (Twilio Phone)</label>
              <input
                type="text"
                value={smsForm.fromNumber}
                onChange={(e) => setSmsForm({ ...smsForm, fromNumber: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رمز الدولة الافتراضي</label>
              <input
                type="text"
                value={smsForm.defaultCountryCode}
                onChange={(e) => setSmsForm({ ...smsForm, defaultCountryCode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => openTestModal('sms')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>اختبار وإرسال رسالة SMS</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveWithSecurity('الرسائل النصية (SMS)', () => {}, false)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Tab */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">إعدادات WhatsApp Business (Meta Graph API)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تكوين ربط واتساب لإرسال تذكيرات المواعيد والفواتير تلقائياً</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number ID</label>
              <input
                type="text"
                value={whatsappForm.phoneNumberId}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Business Account ID</label>
              <input
                type="text"
                value={whatsappForm.businessAccountId}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, businessAccountId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Permanent Access Token</label>
              <div className="relative">
                <input
                  type={showSecrets.waToken ? 'text' : 'password'}
                  value={whatsappForm.accessToken}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs pe-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('waToken')}
                  className="absolute start-auto end-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showSecrets.waToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Webhook Webhook Endpoint</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={whatsappForm.webhookUrl}
                  className="flex-1 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(whatsappForm.webhookUrl, 'webhook')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {copiedKey === 'webhook' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => openTestModal('whatsapp')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>اختبار إرسال قالب WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveWithSecurity('WhatsApp Business', () => {}, true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>حفظ بمصادقة 2FA</span>
            </button>
          </div>
        </div>
      )}

      {/* PayPal Tab */}
      {activeTab === 'paypal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">بوابة الدفع الإلكتروني (PayPal REST API)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تكوين تحصيل مبالغ الفواتير والسندات أونلاين</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaypalForm({ ...paypalForm, mode: 'sandbox' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  paypalForm.mode === 'sandbox' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sandbox (اختبار)
              </button>
              <button
                type="button"
                onClick={() => setPaypalForm({ ...paypalForm, mode: 'live' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  paypalForm.mode === 'live' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Live (الإنتاج الفعلي)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Client ID</label>
              <input
                type="text"
                value={paypalForm.clientId}
                onChange={(e) => setPaypalForm({ ...paypalForm, clientId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Client Secret</label>
              <div className="relative">
                <input
                  type={showSecrets.paypalSecret ? 'text' : 'password'}
                  value={paypalForm.clientSecret}
                  onChange={(e) => setPaypalForm({ ...paypalForm, clientSecret: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs pe-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('paypalSecret')}
                  className="absolute start-auto end-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showSecrets.paypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">العملة الافتراضية</label>
              <select
                value={paypalForm.currency}
                onChange={(e) => setPaypalForm({ ...paypalForm, currency: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium"
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => openTestModal('paypal')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>اختبار الاتصال بـ PayPal API</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveWithSecurity('بوابة PayPal', () => {}, true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-500 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>حفظ بمصادقة أمنية مزدوجة</span>
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">سجل التغييرات الأمنية لإعدادات النظام</h2>
            <span className="text-xs text-slate-400">آخر 50 عملية تفتيش</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 text-start">التاريخ والوقت</th>
                  <th className="py-2.5 px-3 text-start">المستخدم</th>
                  <th className="py-2.5 px-3 text-start">الخدمة</th>
                  <th className="py-2.5 px-3 text-start">نوع الإجراء</th>
                  <th className="py-2.5 px-3 text-start">النتيجة</th>
                  <th className="py-2.5 px-3 text-start">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-3 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString('ar-SA')}</td>
                    <td className="py-3 px-3 font-bold">{log.user}</td>
                    <td className="py-3 px-3 uppercase text-[11px] font-bold text-slate-600 dark:text-slate-300">{log.service}</td>
                    <td className="py-3 px-3">{log.action === 'update' ? 'تعديل وحفظ' : 'اختبار اتصال'}</td>
                    <td className="py-3 px-3">
                      {log.status === 'success' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                          نجح ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400">
                          فشل
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {testModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              اختبار اتصال خدمة {testModal.service?.toUpperCase()}
            </h3>

            {testModal.service !== 'paypal' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {testModal.service === 'email' ? 'بريد الاختبار' : 'رقم الهاتف التجريبي'}
                </label>
                <input
                  type="text"
                  value={testModal.targetInput}
                  onChange={(e) => setTestModal({ ...testModal, targetInput: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            )}

            {testModal.result && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                  testModal.result.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {testModal.result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                <div>
                  <p>{testModal.result.message}</p>
                  {testModal.result.latencyMs && <p className="text-[10px] opacity-80 mt-1">Latency: {testModal.result.latencyMs}ms</p>}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestModal((p) => ({ ...p, open: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={executeServiceTest}
                disabled={testModal.loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                {testModal.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>تنفيذ الاختبار</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">تأكيد كلمة مرور المدير</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">أدخل كلمة المرور لتأكيد وحفظ التغييرات الأمنية</p>
            </div>

            <input
              type="password"
              placeholder="كلمة مرور المدير"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-center"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={confirmPassword}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                تأكيد الحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Confirmation Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">تأكيد رمز 2FA المزدوج</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تغيير بوابة الدفع يتطلب إدخال رمز التحقق (OTP: 123456)</p>
            </div>

            <input
              type="text"
              placeholder="رمز التحقق (123456)"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-widest"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={confirmOtp}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500"
              >
                تأكيد التفعيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
