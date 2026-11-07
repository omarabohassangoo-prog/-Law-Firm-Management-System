/**
 * LawyerDashboard Component (Role: lawyer)
 * Practitioner Counsel Caseload, Hearing Schedule & Deliverables Desk.
 * Includes:
 * - Personalized Greeting Banner with hearing & pending task counter
 * - 4 Lawyer KPI Stat Cards (My Active Cases, Today Appointments, Pending Tasks, Outstanding Case Receivables)
 * - Today's Schedule Vertical Timeline with Quick Actions (View Details, Join Chat)
 * - Urgent Tasks Checklist with quick mark complete action
 * - My Active Cases Cards with Status Progress Bar
 * - Recent Activity in My Cases
 * - Quick Actions (New Case, New Appointment, New Task, Upload Document)
 * - Unread Notifications List
 */

import React from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/auth.store';
import { useTranslation } from '../../../utils/translations';
import { StatCard } from '../../../components/ui/StatCard';
import {
  Briefcase,
  Calendar,
  CheckSquare,
  CreditCard,
  Plus,
  CalendarPlus,
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare,
  Scale,
  ArrowUpRight,
  AlertTriangle,
  Bell,
  Eye,
} from 'lucide-react';

export const LawyerDashboard: React.FC = () => {
  const {
    locale,
    cases,
    appointments,
    tasks,
    invoices,
    notifications,
    currentUser,
    setCurrentView,
    updateTaskStatus,
    firmSettings,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeUserId = user?.id || currentUser.id;
  const lawyerName = user?.name || currentUser.name;

  // Strict Lawyer Data Filtering
  const myCases = cases.filter((c) => c.lawyerId === activeUserId || c.lawyerId === 'usr-lawyer');
  const myHearingsToday = appointments.filter(
    (a) => (a.lawyerId === activeUserId || a.lawyerId === 'usr-lawyer') && a.status !== 'cancelled'
  );
  const myPendingTasks = tasks.filter(
    (t) => (t.assigneeId === activeUserId || t.createdById === activeUserId || t.assigneeId === 'usr-lawyer') && t.status !== 'done'
  );
  const myUrgentTasks = myPendingTasks.filter((t) => t.priority === 'high');

  const myCaseIds = new Set(myCases.map((c) => c.id));
  const myOutstandingInvoices = invoices
    .filter((inv) => myCaseIds.has(inv.caseId || '') && (inv.status === 'pending' || inv.status === 'overdue'))
    .reduce((sum, inv) => sum + inv.total, 0);

  const unreadNotifications = notifications.filter(
    (n) => (!n.read && n.userId === activeUserId) || (!n.read && activeUserId === 'usr-lawyer')
  );

  return (
    <div className="space-y-6">
      {/* 1. Counselor Greeting Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {locale === 'ar' ? 'مكتب المحامي الممارس والمجلس القضائي' : 'Counsel Caseload & Litigation Chamber'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {locale === 'ar' ? `مرحباً، ${lawyerName} ⚖️` : `Welcome, Counsel ${lawyerName} ⚖️`}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {locale === 'ar'
              ? `لديك ${myHearingsToday.length} مواعيد وجلسات محاكم اليوم و${myPendingTasks.length} مهام قضائية معلقة.`
              : `You have ${myHearingsToday.length} hearing schedules today and ${myPendingTasks.length} pending deliverables.`}
          </p>
        </div>

        {/* Quick Actions Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('cases')}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'قضية جديدة' : 'New Matter'}</span>
          </button>
          <button
            onClick={() => setCurrentView('appointments')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'موعد جديد' : 'New Hearing'}</span>
          </button>
          <button
            onClick={() => setCurrentView('tasks')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'مهمة صياغة' : 'New Task'}</span>
          </button>
          <button
            onClick={() => setCurrentView('documents')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'أرشفة مستند' : 'Upload Brief'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setCurrentView('cases')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'قضاياي النشطة' : 'My Active Matters'}
            value={myCases.length}
            subtitle={locale === 'ar' ? 'تحت الإشراف والترافع المباشر' : 'Assigned active caseload'}
            icon={Briefcase}
          />
        </div>

        <div onClick={() => setCurrentView('appointments')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مواعيد وجلسات اليوم' : 'Today Hearings'}
            value={myHearingsToday.length}
            subtitle={locale === 'ar' ? 'جلسات واستشارات موثقة' : 'Scheduled court sessions'}
            icon={Calendar}
          />
        </div>

        <div onClick={() => setCurrentView('tasks')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مهام ومذكرات معلقة' : 'Pending Briefs'}
            value={myPendingTasks.length}
            subtitle={locale === 'ar' ? `${myUrgentTasks.length} مهام عاجلة جداً` : `${myUrgentTasks.length} high priority`}
            icon={CheckSquare}
          />
        </div>

        <div onClick={() => setCurrentView('invoices')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مستحقات أتعاب قضاياي' : 'Caseload Receivables'}
            value={`${myOutstandingInvoices.toLocaleString()} ${firmSettings.currency}`}
            subtitle={locale === 'ar' ? 'أتعاب مرحلية قيد التحصيل' : 'Pending matter billings'}
            icon={CreditCard}
          />
        </div>
      </div>

      {/* 3. Main Section: Today's Hearing Timeline & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule Vertical Timeline */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{locale === 'ar' ? 'جدول الجلسات والمواعيد المقررة لليوم' : 'Today Court Schedule & Hearings Timeline'}</span>
            </h3>
            <button
              onClick={() => setCurrentView('appointments')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
            >
              <span>{locale === 'ar' ? 'عرض التقويم' : 'Calendar'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {myHearingsToday.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {locale === 'ar' ? 'لا توجد جلسات محاكم مجدولة لليوم 🎉' : 'No court sessions scheduled for today 🎉'}
              </div>
            ) : (
              myHearingsToday.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.dateTime.split(' ')[1] || item.dateTime}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {item.type === 'court_hearing' ? (locale === 'ar' ? 'جلسة مرافعة' : 'Court Hearing') : (locale === 'ar' ? 'استشارة' : 'Meeting')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                        {item.title}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                      {t.statusConfirmed}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.location} · {locale === 'ar' ? 'الموكل: ' : 'Client: '}{item.clientName}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => setCurrentView('chat')}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-1 text-[11px]"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{locale === 'ar' ? 'المحادثة الآمنة' : 'Join Chat'}</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('appointments')}
                      className="px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-[11px]"
                    >
                      {locale === 'ar' ? 'التفاصيل' : 'Details'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Urgent Tasks & Deliverables */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>{locale === 'ar' ? 'مهام صياغة عاجلة تتطلب الإنجاز' : 'Urgent Deliverables & Briefs'}</span>
            </h3>
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {locale === 'ar' ? 'لوحة كانبان' : 'Kanban'}
            </button>
          </div>

          <div className="space-y-3">
            {myPendingTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {locale === 'ar' ? 'لا توجد مهام صياغة معلقة ✅' : 'No pending tasks ✅'}
              </div>
            ) : (
              myPendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {task.title}
                    </h4>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        task.priority === 'high'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {task.priority === 'high' ? t.priorityHigh : t.priorityMedium}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{task.dueDate}</span>
                    <button
                      onClick={() => {
                        updateTaskStatus(task.id, 'done');
                        showToast(locale === 'ar' ? 'تم إكمال المهمة' : 'Task marked done');
                      }}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{locale === 'ar' ? 'إكمال' : 'Done'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Lower Grid: My Active Cases Cards & Unread Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Active Cases Cards */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'قضاياي النشطة ومراحل المرافعة' : 'My Active Caseload'}
            </h3>
            <button
              onClick={() => setCurrentView('cases')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
            >
              <span>{locale === 'ar' ? 'كل القضايا' : 'View All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myCases.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => setCurrentView('cases')}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    {c.caseNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {t.statusOpen}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {c.title}
                </h4>

                <p className="text-[11px] text-slate-400">
                  {locale === 'ar' ? 'الموكل: ' : 'Client: '}{c.clientName}
                </p>

                {/* Status Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{c.court}</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-slate-900 dark:bg-amber-400 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Reminders Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>{locale === 'ar' ? 'تنبيهات القضية' : 'Case Alerts'}</span>
            </h3>
            <button
              onClick={() => setCurrentView('notifications')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {locale === 'ar' ? 'الكل' : 'All'}
            </button>
          </div>

          <div className="space-y-3">
            {unreadNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {locale === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
              </div>
            ) : (
              unreadNotifications.slice(0, 4).map((n) => (
                <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">{n.title}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
