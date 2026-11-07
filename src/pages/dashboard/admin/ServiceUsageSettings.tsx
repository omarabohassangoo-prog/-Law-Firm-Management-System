import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import {
  Sliders,
  Mail,
  MessageSquare,
  MessageCircle,
  Bell,
  Inbox,
  Zap,
  Lock,
  DollarSign,
  Filter,
  Save,
  RotateCcw,
  Moon,
  Clock,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
  Search,
  Loader2,
} from 'lucide-react';

interface EventCatalogItem {
  id: string;
  category: 'authentication' | 'cases' | 'appointments' | 'invoices' | 'tasks' | 'chat' | 'system';
  titleAr: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  mandatoryServices?: string[];
}

export const ServiceUsageSettings: React.FC = () => {
  const { locale, showToast } = useAppStore();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Security Password Modal for saving
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // Selected event for Detail Modal
  const [selectedEventModal, setSelectedEventModal] = useState<EventCatalogItem | null>(null);

  // Quiet Hours Configuration
  const [quietHours, setQuietHours] = useState({
    enabled: true,
    from: '22:00',
    to: '08:00',
    timezone: 'Asia/Riyadh',
    allowCritical: true,
  });

  // Monthly Budgets
  const [budgets] = useState({
    sms: { spent: 14.5, limit: 100 },
    whatsapp: { spent: 9.2, limit: 50 },
    email: { spent: 2.1, limit: 20 },
  });

  // Events Catalog
  const eventsCatalog: EventCatalogItem[] = [
    // Authentication
    { id: 'auth.register', category: 'authentication', titleAr: 'تسجيل حساب جديد', severity: 'info' },
    { id: 'auth.login_new_device', category: 'authentication', titleAr: 'تسجيل دخول من جهاز جديد', severity: 'warning' },
    { id: 'auth.password_changed', category: 'authentication', titleAr: 'تغيير كلمة المرور', severity: 'critical', mandatoryServices: ['email', 'in_app'] },
    { id: 'auth.password_reset', category: 'authentication', titleAr: 'استعادة كلمة المرور', severity: 'high', mandatoryServices: ['email'] },
    { id: 'auth.otp_requested', category: 'authentication', titleAr: 'طلب رمز التحقق OTP', severity: 'critical', mandatoryServices: ['sms'] },

    // Cases
    { id: 'case.created', category: 'cases', titleAr: 'إنشاء قضية جديدة', severity: 'info' },
    { id: 'case.status_changed', category: 'cases', titleAr: 'تغير حالة القضية', severity: 'high' },
    { id: 'case.closed', category: 'cases', titleAr: 'إغلاق ومناقلة قضية', severity: 'high' },
    { id: 'case.assigned', category: 'cases', titleAr: 'إسناد قضية لمحامي', severity: 'high' },

    // Appointments
    { id: 'appointment.created', category: 'appointments', titleAr: 'حجز موعد جلسة جديد', severity: 'high' },
    { id: 'appointment.confirmed', category: 'appointments', titleAr: 'تأكيد موعد الجلسة', severity: 'high' },
    { id: 'appointment.reminder_24h', category: 'appointments', titleAr: 'تذكير الجلسة قبل 24 ساعة', severity: 'high' },
    { id: 'appointment.reminder_1h', category: 'appointments', titleAr: 'تذكير الجلسة قبل ساعة واحدة', severity: 'critical' },

    // Invoices
    { id: 'invoice.created', category: 'invoices', titleAr: 'إصدار فاتورة ضريبية', severity: 'high' },
    { id: 'invoice.paid', category: 'invoices', titleAr: 'سداد فاتورة أونلاين', severity: 'high' },
    { id: 'invoice.due_soon', category: 'invoices', titleAr: 'قرب استحقاق الفاتورة', severity: 'warning' },
    { id: 'invoice.overdue', category: 'invoices', titleAr: 'تأخر سداد الفاتورة (حرج)', severity: 'critical' },

    // Tasks
    { id: 'task.assigned', category: 'tasks', titleAr: 'إسناد مهمة جديدة', severity: 'high' },
    { id: 'task.due_soon', category: 'tasks', titleAr: 'اقتراب موعد المهمة', severity: 'warning' },

    // Chat
    { id: 'chat.message', category: 'chat', titleAr: 'رسالة محادثة جديدة', severity: 'info' },
    { id: 'chat.mention', category: 'chat', titleAr: 'الإشارة للمستخدم (@mention)', severity: 'high' },

    // System
    { id: 'system.security_alert', category: 'system', titleAr: 'تنبيه أمني للنظام', severity: 'critical', mandatoryServices: ['email', 'sms'] },
    { id: 'system.service_failed', category: 'system', titleAr: 'فشل خدمة تكامل', severity: 'critical' },
  ];

  // Matrix State: Event ID -> Service ID -> Enabled boolean
  const [matrixState, setMatrixState] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    eventsCatalog.forEach((ev) => {
      initial[ev.id] = {
        in_app: true,
        socket: true,
        email: ['auth.register', 'auth.password_changed', 'auth.password_reset', 'case.created', 'appointment.confirmed', 'invoice.created', 'invoice.overdue', 'system.security_alert'].includes(ev.id),
        push: ['auth.login_new_device', 'case.created', 'appointment.reminder_1h', 'invoice.paid', 'task.assigned', 'chat.message'].includes(ev.id),
        sms: ['auth.otp_requested', 'appointment.reminder_1h', 'invoice.overdue', 'system.security_alert'].includes(ev.id),
        whatsapp: ['appointment.confirmed', 'appointment.reminder_24h', 'invoice.due_soon'].includes(ev.id),
      };
    });
    return initial;
  });

  const toggleCell = (eventId: string, serviceId: string) => {
    const ev = eventsCatalog.find((e) => e.id === eventId);
    if (ev?.mandatoryServices?.includes(serviceId)) {
      showToast(locale === 'ar' ? 'هذه الخدمة إجبارية لهذا الحدث لأسباب أمنية (🔒 Mandatory)' : 'Mandatory service cannot be disabled', 'warning');
      return;
    }

    setMatrixState((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [serviceId]: !prev[eventId]?.[serviceId],
      },
    }));
  };

  const handleSaveMatrix = () => {
    if (!adminPassword) {
      showToast(locale === 'ar' ? 'كلمة المرور مطلوبة للحفظ' : 'Password required', 'error');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPasswordModalOpen(false);
      setAdminPassword('');
      showToast(locale === 'ar' ? 'تم حفظ وتنسيق مصفوفة استخدام الخدمات بنجاح' : 'Service Usage Matrix Saved', 'success');
    }, 1200);
  };

  // Filtered Events
  const filteredEvents = eventsCatalog.filter((ev) => {
    const matchesCategory = categoryFilter === 'all' || ev.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || ev.severity === severityFilter;
    const matchesSearch = ev.titleAr.includes(searchQuery) || ev.id.includes(searchQuery);
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  // Service Headers
  const serviceHeaders = [
    { id: 'in_app', label: 'داخل التطبيق', icon: Inbox, costBadge: 'مجاني' },
    { id: 'socket', label: 'WebSocket (حي)', icon: Zap, costBadge: 'مجاني' },
    { id: 'email', label: 'البريد الإلكتروني', icon: Mail, costBadge: 'منخفض' },
    { id: 'push', label: 'Push Notification', icon: Bell, costBadge: 'مجاني' },
    { id: 'sms', label: 'SMS (Twilio)', icon: MessageSquare, costBadge: 'مكلف $' },
    { id: 'whatsapp', label: 'WhatsApp (Meta)', icon: MessageCircle, costBadge: 'متوسط $' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>التحكم الإداري المتقدم (Admin Matrix Control)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'مصفوفة التحكم في استخدام الخدمات الإشعارية' : 'Notification Services Usage Control Matrix'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar'
              ? 'تخصيص كامل لـ 25 حدثاً نظامياً عبر 6 قنوات إرسال مع حظر التكاليف وساعات الهدوء وقفل الأمان الإجباري'
              : 'Granular routing across 25 system events and 6 notification services'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>حفظ المصفوفة</span>
          </button>
        </div>
      </div>

      {/* Budget & Quiet Hours Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* SMS Budget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">ميزانية SMS الشهري</span>
            <span className="text-amber-600 dark:text-amber-400">${budgets.sms.spent} / ${budgets.sms.limit}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(budgets.sms.spent / budgets.sms.limit) * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 text-start">إعادة التعيين: 1 من الشهر القادم</p>
        </div>

        {/* WhatsApp Budget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">ميزانية WhatsApp الشهري</span>
            <span className="text-emerald-600 dark:text-emerald-400">${budgets.whatsapp.spent} / ${budgets.whatsapp.limit}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(budgets.whatsapp.spent / budgets.whatsapp.limit) * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 text-start">استهلاك منخفض (18%)</p>
        </div>

        {/* Quiet Hours Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2 col-span-1 md:col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">ساعات عدم الإزعاج (Quiet Hours)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">من {quietHours.from} إلى {quietHours.to} (مستثنى فقط الأحداث الحرجة 🔴)</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={quietHours.enabled}
              onChange={(e) => setQuietHours({ ...quietHours, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في الأحداث النظامية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ps-9 pe-3 py-1.5 text-xs"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
          >
            <option value="all">كل الأقسام (All Categories)</option>
            <option value="authentication">المصادقة والأمان</option>
            <option value="cases">القضايا</option>
            <option value="appointments">الجلسات والمواعيد</option>
            <option value="invoices">الفواتير والمالية</option>
            <option value="tasks">المهام القضائية</option>
            <option value="chat">المحادثات</option>
            <option value="system">النظام</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold"
          >
            <option value="all">كل مستويات الأهمية</option>
            <option value="critical">🔴 حرج (Critical)</option>
            <option value="high">🟠 مرتفع (High)</option>
            <option value="warning">🟡 متوسط (Warning)</option>
            <option value="info">🔵 عادي (Info)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
          عرض {filteredEvents.length} من {eventsCatalog.length} حدثاً
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <th className="py-3 px-4 text-start font-bold min-w-[220px]">الحدث النظامي (System Event)</th>
                <th className="py-3 px-3 text-center font-bold">الأهمية</th>
                {serviceHeaders.map((srv) => {
                  const Icon = srv.icon;
                  return (
                    <th key={srv.id} className="py-3 px-3 text-center font-bold min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>{srv.label}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {srv.costBadge}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvents.map((ev) => {
                const isMandatoryEvent = Boolean(ev.mandatoryServices && ev.mandatoryServices.length > 0);

                return (
                  <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Event title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <button
                            onClick={() => setSelectedEventModal(ev)}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 text-start text-xs block"
                          >
                            {ev.titleAr}
                          </button>
                          <span className="text-[10px] font-mono text-slate-400">{ev.id}</span>
                        </div>
                        {isMandatoryEvent && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>إجباري</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Severity Badge */}
                    <td className="py-3 px-3 text-center">
                      {ev.severity === 'critical' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400">
                          🔴 حرج
                        </span>
                      )}
                      {ev.severity === 'high' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400">
                          🟠 مرتفع
                        </span>
                      )}
                      {ev.severity === 'warning' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                          🟡 متوسط
                        </span>
                      )}
                      {ev.severity === 'info' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400">
                          🔵 عادي
                        </span>
                      )}
                    </td>

                    {/* Matrix Service Checkboxes */}
                    {serviceHeaders.map((srv) => {
                      const isEnabled = Boolean(matrixState[ev.id]?.[srv.id]);
                      const isMandatoryForService = ev.mandatoryServices?.includes(srv.id);

                      return (
                        <td key={srv.id} className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleCell(ev.id, srv.id)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              isMandatoryForService
                                ? 'bg-amber-500 text-slate-950 cursor-not-allowed shadow-xs'
                                : isEnabled
                                ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {isMandatoryForService ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : isEnabled ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4 opacity-40" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedEventModal.titleAr}</h3>
                <p className="text-xs font-mono text-slate-400">{selectedEventModal.id}</p>
              </div>

              <button
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                <span className="font-bold text-slate-700 dark:text-slate-300">مستوى الأهمية:</span>
                <span className="font-bold text-amber-500 uppercase">{selectedEventModal.severity}</span>
              </div>

              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300 mb-2">الأدوار المسموح لها باستقبال هذا الحدث:</span>
                <div className="grid grid-cols-2 gap-2">
                  {['admin', 'lawyer', 'legal_assistant', 'accountant', 'secretary', 'client'].map((role) => (
                    <label key={role} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-amber-500 focus:ring-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                حفظ الضوابط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Confirmation Modal for Saving Matrix */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">تأكيد كلمة مرور المدير</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">أدخل كلمة المرور لحفظ وتفعيل ضوابط الإشعارات والخدمات</p>
            </div>

            <input
              type="password"
              placeholder="كلمة مرور المدير"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
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
                onClick={handleSaveMatrix}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>تأكيد وحفظ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
