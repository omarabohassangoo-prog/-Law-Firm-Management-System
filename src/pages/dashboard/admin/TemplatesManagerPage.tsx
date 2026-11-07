import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import {
  FileText,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  Plus,
  Search,
  Eye,
  Edit,
  Copy,
  Send,
  Trash2,
  Lock,
  CheckCircle2,
  Globe,
  Sliders,
  Code,
  Smartphone,
  Laptop,
  Save,
  Loader2,
  X
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  event: string;
  locale: 'ar' | 'en';
  status: 'active' | 'draft';
  subject?: string;
  body: string;
  updatedAt: string;
}

export const TemplatesManagerPage: React.FC = () => {
  const { locale, showToast } = useAppStore();

  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');

  // Templates State
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'tpl-1',
      name: 'appointment_confirmed_ar',
      channel: 'email',
      event: 'appointment.confirmed',
      locale: 'ar',
      status: 'active',
      subject: 'تأكيد موعد جلسة قضائية — {firmName}',
      body: 'مرحباً {clientName}،\n\nنحيطكم علماً بأنه تم تأكيد موعد جلسة "{appointmentTitle}" المقررة بتاريخ {appointmentDate} الساعة {appointmentTime} في {caseCourt}.\n\nمع تحيات فريق {firmName}',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl-2',
      name: 'invoice_created_ar',
      channel: 'email',
      event: 'invoice.created',
      locale: 'ar',
      status: 'active',
      subject: 'إصدار فاتورة ضريبية جديدة رقم {invoiceNumber}',
      body: 'عزيزنا الموكل {clientName}،\n\nتم إصدار فاتورة الأتعاب رقم {invoiceNumber} بقيمة إجمالية {invoiceTotal}. يرجى السداد في موعد أقصاه {invoiceDueDate}.\n\nشكراً لثقتكم بـ {firmName}',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl-3',
      name: 'otp_sms_ar',
      channel: 'sms',
      event: 'auth.otp_requested',
      locale: 'ar',
      status: 'active',
      body: 'رمز التحقق الخاص بك في {firmName} هو: {otpCode}. لا تشارك هذا الرمز مع أي شخص.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl-4',
      name: 'appointment_reminder_whatsapp_ar',
      channel: 'whatsapp',
      event: 'appointment.reminder_1h',
      locale: 'ar',
      status: 'active',
      body: 'تذكير: لديك جلسة قضائية قريبة "{appointmentTitle}" غداً الساعة {appointmentTime}. يرجى الحضور في الموعد.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl-5',
      name: 'new_case_push_ar',
      channel: 'push',
      event: 'case.created',
      locale: 'ar',
      status: 'active',
      body: 'تم تسجيل قضية جديدة برقم {caseNumber} وإسنادها لفريق المحاماة.',
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Editor State
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate>({
    id: '',
    name: '',
    channel: 'email',
    event: 'appointment.confirmed',
    locale: 'ar',
    status: 'active',
    subject: '',
    body: '',
    updatedAt: new Date().toISOString(),
  });

  // Test Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTarget, setTestTarget] = useState('admin@aladalah-law.com');
  const [testing, setTesting] = useState(false);

  // Filtered Templates
  const filteredTemplates = templates.filter((t) => {
    const matchesChannel = channelFilter === 'all' || t.channel === channelFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.event.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const handleOpenNew = () => {
    setEditingTemplate({
      id: `tpl-${Date.now()}`,
      name: 'new_template_ar',
      channel: 'email',
      event: 'case.created',
      locale: 'ar',
      status: 'draft',
      subject: 'إشعار جديد من {firmName}',
      body: 'مرحباً {clientName}،\n\nنص الإشعار هنا...',
      updatedAt: new Date().toISOString(),
    });
    setActiveTab('editor');
  };

  const handleEdit = (tpl: NotificationTemplate) => {
    setEditingTemplate({ ...tpl });
    setActiveTab('editor');
  };

  const handleSave = () => {
    if (!editingTemplate.name || !editingTemplate.body) {
      showToast('يرجى تعبئة اسم القالب ومحتواه', 'error');
      return;
    }

    setTemplates((prev) => {
      const exists = prev.find((t) => t.id === editingTemplate.id);
      if (exists) {
        return prev.map((t) => (t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: new Date().toISOString() } : t));
      } else {
        return [editingTemplate, ...prev];
      }
    });

    setActiveTab('list');
    showToast('تم حفظ قالب الإشعار بنجاح', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب نهائياً؟')) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      showToast('تم حذف القالب', 'info');
    }
  };

  const handleRunTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestModalOpen(false);
      showToast(`تم إرسال اختبار تجريبي بنجاح إلى (${testTarget})`, 'success');
    }, 1200);
  };

  const insertVariable = (variable: string) => {
    setEditingTemplate((prev) => ({
      ...prev,
      body: prev.body + ` {${variable}}`,
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>مخزن ومحرر القوالب الإشعارية (Templates Repository)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'إدارة قوالب البريد، SMS، واتساب، و Push' : 'Notification Templates Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar'
              ? 'تخصيص كامل للقوالب، المحرر المرئي الحي، المتغيرات الديناميكية، والاختبار المباشر'
              : 'Customize templates with visual editor, live preview, and dynamic variables'}
          </p>
        </div>

        {activeTab === 'list' && (
          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>قالب جديد</span>
          </button>
        )}
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم القالب أو الحدث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ps-9 pe-3 py-1.5 text-xs"
                />
              </div>

              {/* Channel Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {['all', 'email', 'sms', 'whatsapp', 'push'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                      channelFilter === ch ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold">
              إجمالي القوالب: {filteredTemplates.length}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {tpl.channel}
                    </span>
                    {tpl.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>نشط</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        مسودة
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mb-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mb-3">{tpl.event}</p>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-300 line-clamp-3 font-mono">
                    {tpl.subject && <strong className="block mb-1 text-slate-900 dark:text-slate-100">الموضوع: {tpl.subject}</strong>}
                    {tpl.body}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(tpl)}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setTestModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60"
                      title="إرسال تجريبي"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(tpl.updatedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Visual Editor */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingTemplate.id ? 'تعديل قالب إشعار' : 'إنشاء قالب جديد'}
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400"
              >
                <Save className="w-4 h-4" />
                <span>حفظ القالب</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Form Settings */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم القالب (Slug)</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">قناة الإرسال</label>
                  <select
                    value={editingTemplate.channel}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, channel: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium uppercase"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الحدث المرتبط (System Event)</label>
                <input
                  type="text"
                  value={editingTemplate.event}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, event: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              {editingTemplate.channel === 'email' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان البريد (Subject)</label>
                  <input
                    type="text"
                    value={editingTemplate.subject || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">محتوى القالب (Body)</label>
                  <span className="text-[10px] text-slate-400">يدعم المتغيرات الديناميكية</span>
                </div>
                <textarea
                  rows={8}
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono"
                />
              </div>

              {/* Variable Quick Inserter */}
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">إدراج متغير سريع:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['firmName', 'clientName', 'caseNumber', 'appointmentTitle', 'appointmentDate', 'appointmentTime', 'invoiceNumber', 'invoiceTotal', 'otpCode'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-mono hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors"
                    >
                      +{v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Preview */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span>معاينة حية (Live Preview)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase">
                    {editingTemplate.channel}
                  </span>
                </div>

                {/* Simulated Device Screen */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 font-sans">
                  {editingTemplate.channel === 'email' && (
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                      <span className="text-[10px] text-slate-400 block">الموضوع:</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {editingTemplate.subject || 'بدون موضوع'}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {editingTemplate.body
                      .replace(/{firmName}/g, 'مكتب العدالة للمحاماة')
                      .replace(/{clientName}/g, 'شركة الأفق للاستثمار')
                      .replace(/{caseNumber}/g, 'CAS-2026-0419')
                      .replace(/{appointmentTitle}/g, 'جلسة الترافع أمام المحكمة التجارية')
                      .replace(/{appointmentDate}/g, '2026-11-20')
                      .replace(/{appointmentTime}/g, '10:00 ص')
                      .replace(/{invoiceNumber}/g, 'INV-2024-089')
                      .replace(/{invoiceTotal}/g, '51,750 ر.س')
                      .replace(/{otpCode}/g, '491823')}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">يتم استبدال المتغيرات تلقائياً عند الإرسال</span>
                <button
                  type="button"
                  onClick={() => setTestModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال تجريبي</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Send Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">إرسال اختبار تجريبي</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">إرسال رسالة تجريبية مطابقة للقالب بالبيانات الوهمية</p>
            </div>

            <input
              type="text"
              placeholder="بريد المستلم أو الهاتف"
              value={testTarget}
              onChange={(e) => setTestTarget(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-center font-mono"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={testing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400"
              >
                {testing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>إرسال الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
