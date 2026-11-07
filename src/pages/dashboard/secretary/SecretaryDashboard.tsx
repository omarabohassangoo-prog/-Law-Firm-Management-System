/**
 * SecretaryDashboard Component (Role: secretary)
 * Secretary & Front Desk Operations, Calendar Intake & Public Inquiries Desk.
 * Includes:
 * - Reception Greeting Banner with Today Appointments & Messages Counters
 * - 4 Primary Secretary KPI Stat Cards (Today Appointments, Unread Web Messages, New Clients Today, Reception Tasks)
 * - Today's Appointments Table with Quick Confirm / Cancel Actions
 * - Inbound Contact Messages List with Read/Unread Filters & Preview Modal
 * - Reception Quick Actions (New Booking, New Client Intake, Call Log Simulation)
 * - Daily Reception Tasks Checklist
 */

import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/auth.store';
import { useTranslation } from '../../../utils/translations';
import { StatCard } from '../../../components/ui/StatCard';
import { Modal } from '../../../components/ui/Modal';
import {
  Calendar,
  Mail,
  UserPlus,
  CheckSquare,
  Plus,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const SecretaryDashboard: React.FC = () => {
  const {
    locale,
    appointments,
    contactMessages,
    clients,
    tasks,
    currentUser,
    setCurrentView,
    updateAppointmentStatus,
    markContactMessageRead,
    updateTaskStatus,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const secretaryName = user?.name || currentUser.name;
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callForm, setCallForm] = useState({ callerName: '', phone: '', subject: '' });

  const unreadMessages = contactMessages.filter((m) => !m.read);
  const todayAppointments = appointments.filter((a) => a.status !== 'cancelled');
  const myTasks = tasks.filter((t) => t.status !== 'done');

  const filteredMessages = contactMessages.filter((m) => {
    if (messageFilter === 'unread') return !m.read;
    if (messageFilter === 'read') return m.read;
    return true;
  });

  const handleCallLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      locale === 'ar'
        ? `تم توثيق مكالمة العميل (${callForm.callerName}) وإبلاغ المحامي المعني`
        : `Call log recorded for ${callForm.callerName}`
    );
    setCallModalOpen(false);
    setCallForm({ callerName: '', phone: '', subject: '' });
  };

  return (
    <div className="space-y-6">
      {/* 1. Reception Greeting Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 block mb-1 uppercase tracking-wider">
            {locale === 'ar' ? 'مكتب السكرتارية وتنسيق المواعيد والاستقبال' : 'Secretary & Reception Operations'}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {locale === 'ar' ? `مرحباً، ${secretaryName} 📅` : `Welcome, ${secretaryName} 📅`}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {locale === 'ar'
              ? `لديك ${todayAppointments.length} مواعيد وستقبلات اليوم و${unreadMessages.length} رسائل واستفسارات جديدة.`
              : `You have ${todayAppointments.length} appointments today and ${unreadMessages.length} new web inquiries.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('appointments')}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'حجز موعد' : 'New Appointment'}</span>
          </button>
          <button
            onClick={() => setCurrentView('clients')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'تسجيل عميل' : 'New Client'}</span>
          </button>
          <button
            onClick={() => setCallModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'توثيق مكالمة' : 'Log Call'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setCurrentView('appointments')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مواعيد اليوم' : 'Today Appointments'}
            value={todayAppointments.length}
            subtitle={locale === 'ar' ? 'جلسات واستشارات موثقة' : 'Scheduled meetings & hearings'}
            icon={Calendar}
          />
        </div>

        <div onClick={() => setCurrentView('contact_messages')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'رسائل جديدة' : 'New Web Messages'}
            value={unreadMessages.length}
            subtitle={locale === 'ar' ? 'استفسارات الموقع الإلكتروني' : 'Pending web form leads'}
            icon={Mail}
          />
        </div>

        <div onClick={() => setCurrentView('clients')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'إجمالي سجل العملاء' : 'Client Intake Total'}
            value={clients.length}
            subtitle={locale === 'ar' ? 'شركات وأفراد مسجلون' : 'Retained client profiles'}
            icon={UserPlus}
          />
        </div>

        <div onClick={() => setCurrentView('tasks')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مهام الاستقبال اليوم' : 'Reception Tasks'}
            value={myTasks.length}
            subtitle={locale === 'ar' ? 'تنسيق واستقبال ومتابعة' : 'Daily desk action items'}
            icon={CheckSquare}
          />
        </div>
      </div>

      {/* 3. Main Section: Today's Appointments & Inbound Contact Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Appointments Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{locale === 'ar' ? 'جدول مواعيد وجلسات الاستقبال اليوم' : 'Today Appointments & Reception Intake'}</span>
            </h3>
            <button
              onClick={() => setCurrentView('appointments')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
            >
              <span>{locale === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'الوقت' : 'Time'}</th>
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'الموكل / الزائر' : 'Client'}</th>
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'المحامي' : 'Lawyer'}</th>
                  <th className="py-2.5 px-3 text-center">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold font-mono text-slate-900 dark:text-slate-100">{apt.dateTime.split(' ')[1] || apt.dateTime}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{apt.clientName || 'استشارة جديدة'}</td>
                    <td className="py-2.5 px-3 text-slate-500">{apt.lawyerName}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {apt.status === 'confirmed' ? t.statusConfirmed : t.statusPending}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status !== 'confirmed' && (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(apt.id, 'confirmed');
                              showToast(locale === 'ar' ? 'تم تأكيد الحجز' : 'Appointment confirmed');
                            }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title={locale === 'ar' ? 'تأكيد الحجز' : 'Confirm'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'cancelled');
                            showToast(locale === 'ar' ? 'تم إلغاء الموعد' : 'Appointment cancelled');
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title={locale === 'ar' ? 'إلغاء الموعد' : 'Cancel'}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inbound Contact Messages */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-500" />
              <span>{locale === 'ar' ? 'استفسارات الموقع الواردة' : 'Inbound Contact Messages'}</span>
            </h3>
            <button
              onClick={() => setCurrentView('contact_messages')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {locale === 'ar' ? 'الكل' : 'All'}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <button
              onClick={() => setMessageFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                messageFilter === 'all' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {locale === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setMessageFilter('unread')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                messageFilter === 'unread' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {locale === 'ar' ? 'غير مقروءة' : 'Unread'} ({unreadMessages.length})
            </button>
          </div>

          <div className="space-y-3">
            {filteredMessages.slice(0, 4).map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  msg.read
                    ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-slate-900 dark:text-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">{msg.name}</span>
                  {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{msg.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Reception Tasks Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-purple-500" />
          <span>{locale === 'ar' ? 'قائمة مهام الاستقبال والتنظيم اليومية' : 'Daily Desk Action Checklist'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {myTasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5 text-xs"
            >
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => {
                  updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done');
                  showToast(locale === 'ar' ? 'تم إكمال المهمة' : 'Task updated');
                }}
                className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <span className={`font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Call Log Modal */}
      {callModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setCallModalOpen(false)}
          title={locale === 'ar' ? 'توثيق مكالمة أو زيارة جديدة' : 'Log Phone Call / Visitor'}
        >
          <form onSubmit={handleCallLogSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {locale === 'ar' ? 'اسم المتصل / الزائر' : 'Caller / Visitor Name'} *
              </label>
              <input
                type="text"
                required
                value={callForm.callerName}
                onChange={(e) => setCallForm({ ...callForm, callerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {locale === 'ar' ? 'رقم الهاتف' : 'Phone'} *
              </label>
              <input
                type="tel"
                required
                value={callForm.phone}
                onChange={(e) => setCallForm({ ...callForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {locale === 'ar' ? 'موضوع المكالمة أو الطلب' : 'Subject'}
              </label>
              <textarea
                rows={3}
                value={callForm.subject}
                onChange={(e) => setCallForm({ ...callForm, subject: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCallModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg"
              >
                {t.save}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Message Preview Modal */}
      {selectedMessage && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-1">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">{selectedMessage.name}</span>
              <span className="text-slate-500 font-mono block">{selectedMessage.email} · {selectedMessage.phone}</span>
            </div>
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed">
              {selectedMessage.message}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  markContactMessageRead(selectedMessage.id);
                  setSelectedMessage(null);
                  showToast(locale === 'ar' ? 'تم تعيين الرسالة كمقروءة' : 'Message marked read');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg"
              >
                {locale === 'ar' ? 'تعيين كمقروء وإغلاق' : 'Mark Read'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
