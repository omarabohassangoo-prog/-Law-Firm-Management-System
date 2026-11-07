import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import {
  Bell,
  Mail,
  MessageSquare,
  MessageCircle,
  Moon,
  Clock,
  VolumeX,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const NotificationPreferences: React.FC = () => {
  const { locale, showToast } = useAppStore();

  const [prefs, setPrefs] = useState({
    emailEnabled: true,
    smsEnabled: true,
    whatsappEnabled: true,
    pushEnabled: true,
    emailFrequency: 'instant',
    quietHoursEnabled: false,
    quietHoursFrom: '22:00',
    quietHoursTo: '08:00',
    mutedEvents: [] as string[],
  });

  const handleSave = () => {
    showToast(
      locale === 'ar' ? 'تم حفظ تفضيلات الإشعارات الشخصية بنجاح' : 'Notification preferences saved successfully',
      'success'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'تفضيلات الإشعارات الشخصية' : 'Personal Notification Preferences'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar'
              ? 'تحديد الوسائل المفضلة لاستقبال تنبيهات القضايا والجلسات والفواتير'
              : 'Customize channels and quiet hours for case alerts and invoices'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التفضيلات</span>
        </button>
      </div>

      {/* Services Channels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <span>قنوات الإرسال المتاحة لحسابك</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'emailEnabled', label: 'البريد الإلكتروني', desc: 'استقبال الإشعارات والفواتير الموثقة', icon: Mail },
            { id: 'pushEnabled', label: 'Push Notifications', desc: 'تنبيهات فورية على المتصفح والجوال', icon: Bell },
            { id: 'whatsappEnabled', label: 'WhatsApp', desc: 'تذكير الجلسات والمواعيد عبر واتساب', icon: MessageCircle },
            { id: 'smsEnabled', label: 'SMS (رسائل نصية)', desc: 'تنبيهات الطوارئ والجلسات الحثيثة', icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const checked = (prefs as any)[item.id];
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setPrefs({ ...prefs, [item.id]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>ساعات عدم الإزعاج الشخصية (Quiet Hours)</span>
          </h2>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.quietHoursEnabled}
              onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {prefs.quietHoursEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">بدء وقت الهدوء</label>
              <input
                type="time"
                value={prefs.quietHoursFrom}
                onChange={(e) => setPrefs({ ...prefs, quietHoursFrom: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">انتهاء وقت الهدوء</label>
              <input
                type="time"
                value={prefs.quietHoursTo}
                onChange={(e) => setPrefs({ ...prefs, quietHoursTo: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Email Frequency */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>تكرار إرسال البريد الإلكتروني</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'instant', title: 'إرسال فوري', desc: 'تلقي كل إشعار بمجرد صدوره' },
            { id: 'daily', title: 'ملخص يومي', desc: 'تجميع إشعارات اليوم في بريد واحد' },
            { id: 'weekly', title: 'ملخص أسبوعي', desc: 'رسالة أسبوعية شاملة بالأنشطة' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPrefs({ ...prefs, emailFrequency: item.id })}
              className={`p-4 rounded-xl border text-start transition-colors ${
                prefs.emailFrequency === item.id
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
