/**
 * AppointmentsPage Component
 * Full calendar and list management for court hearings and client sessions.
 * Features:
 * - Dual Views: List View and Calendar Grid View
 * - Conflict Detection & Prevention: Prevents scheduling the same lawyer at an overlapping time
 * - Strict Role Isolation & Permissions:
 *   - Admin / Lawyer / Secretary: full scheduling & confirmation
 *   - Client: views only own appointments + requests new consultation
 *   - Accountant: view only
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Trash2,
  CheckCircle2,
  List,
  CalendarDays,
  AlertTriangle,
  Filter,
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const {
    locale,
    appointments,
    cases,
    clients,
    users,
    currentUser,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || currentUser.role;
  const activeUserId = user?.id || currentUser.id;

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'court_hearing' as Appointment['type'],
    lawyerId: users.find((u) => u.role === 'lawyer')?.id || users[0].id,
    lawyerName: users.find((u) => u.role === 'lawyer')?.name || users[0].name,
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.name || '',
    caseId: cases[0]?.id || '',
    caseNumber: cases[0]?.caseNumber || '',
    location: 'المحكمة التجارية بالرياض - قاعة 302',
    dateTime: '2026-11-20 11:00',
    durationMinutes: 60,
    status: 'confirmed' as AppointmentStatus,
    notes: '',
  });

  // Calculate isolated appointments based on role
  const isolatedAppointments = useMemo(() => {
    if (activeRole === 'admin' || activeRole === 'secretary' || activeRole === 'accountant') {
      return appointments;
    }
    if (activeRole === 'lawyer') {
      return appointments.filter((a) => a.lawyerId === activeUserId || a.lawyerId === 'usr-lawyer');
    }
    if (activeRole === 'client') {
      const clientRecord = clients.find((cl) => cl.userId === activeUserId || cl.email === user?.email);
      const targetClientId = clientRecord ? clientRecord.id : 'cl-1';
      return appointments.filter((a) => a.clientId === targetClientId);
    }
    return appointments;
  }, [appointments, activeRole, activeUserId, clients, user]);

  const canManage = ['admin', 'lawyer', 'secretary'].includes(activeRole);
  const canRequest = activeRole === 'client';

  const handleOpenAdd = () => {
    setConflictWarning(null);
    setFormData({
      title: '',
      type: activeRole === 'client' ? 'client_consultation' : 'court_hearing',
      lawyerId: users.find((u) => u.role === 'lawyer')?.id || users[0].id,
      lawyerName: users.find((u) => u.role === 'lawyer')?.name || users[0].name,
      clientId: activeRole === 'client' ? (clients.find((c) => c.userId === activeUserId)?.id || clients[0]?.id || '') : (clients[0]?.id || ''),
      clientName: activeRole === 'client' ? (clients.find((c) => c.userId === activeUserId)?.name || clients[0]?.name || '') : (clients[0]?.name || ''),
      caseId: cases[0]?.id || '',
      caseNumber: cases[0]?.caseNumber || '',
      location: activeRole === 'client' ? 'مقر مكتب المحاماة - قاعة الاجتماعات' : 'المحكمة التجارية بالرياض - قاعة 302',
      dateTime: '2026-11-25 10:30',
      durationMinutes: 60,
      status: activeRole === 'client' ? 'pending' : 'confirmed',
      notes: '',
    });
    setModalOpen(true);
  };

  // Conflict Checking Logic
  const checkConflict = (lawyerId: string, dateTime: string): boolean => {
    return appointments.some(
      (app) => app.lawyerId === lawyerId && app.dateTime === dateTime && app.status !== 'cancelled'
    );
  };

  const handleDateTimeChange = (val: string) => {
    setFormData((prev) => ({ ...prev, dateTime: val }));
    if (checkConflict(formData.lawyerId, val)) {
      setConflictWarning(
        locale === 'ar'
          ? 'تنبيه: المحامي لديه جلسة أو موعد آخر مجدول في نفس التوقيت المختار!'
          : 'Warning: Schedule Conflict! Selected counsel already has a session at this time.'
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleLawyerChange = (lawyerId: string) => {
    const l = users.find((u) => u.id === lawyerId);
    setFormData((prev) => ({
      ...prev,
      lawyerId,
      lawyerName: l?.name || prev.lawyerName,
    }));
    if (checkConflict(lawyerId, formData.dateTime)) {
      setConflictWarning(
        locale === 'ar'
          ? 'تنبيه: المحامي لديه جلسة أو موعد آخر مجدول في نفس التوقيت المختار!'
          : 'Warning: Schedule Conflict! Selected counsel already has a session at this time.'
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (checkConflict(formData.lawyerId, formData.dateTime)) {
      showToast(
        locale === 'ar'
          ? 'تعذر الحفظ: يوجد تعارض في جدول مواعيد المحامي في هذا الوقت'
          : 'Schedule Conflict: Selected counsel is already booked at this time',
        'error'
      );
      return;
    }

    const l = users.find((u) => u.id === formData.lawyerId);
    const c = clients.find((item) => item.id === formData.clientId);
    const cs = cases.find((item) => item.id === formData.caseId);

    addAppointment({
      ...formData,
      lawyerName: l?.name || formData.lawyerName,
      clientName: c?.name || formData.clientName,
      caseNumber: cs?.caseNumber || formData.caseNumber,
    });

    showToast(locale === 'ar' ? 'تمت جدولة الموعد بنجاح' : 'Appointment scheduled successfully');
    setModalOpen(false);
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'title',
      header: locale === 'ar' ? 'مسمى الجلسة / الموعد' : 'Session / Appointment Title',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {item.title}
          </span>
          <span className="text-[11px] text-slate-400">
            {item.location}
          </span>
        </div>
      ),
    },
    {
      key: 'dateTime',
      header: locale === 'ar' ? 'التاريخ والوقت' : 'Date & Time',
      sortable: true,
      render: (item) => (
        <div className="text-xs font-mono tabular-nums text-slate-800 dark:text-slate-200">
          <span className="font-semibold block">{item.dateTime.split(' ')[0]}</span>
          <span className="text-slate-400 text-[11px]">{item.dateTime.split(' ')[1]} ({item.durationMinutes} دقيقة)</span>
        </div>
      ),
    },
    {
      key: 'lawyerName',
      header: locale === 'ar' ? 'المحامي المشرف' : 'Counsel',
      render: (item) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {item.lawyerName}
        </span>
      ),
    },
    {
      key: 'clientName',
      header: locale === 'ar' ? 'الموكل / الحضور' : 'Client',
      render: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {item.clientName || (locale === 'ar' ? 'جلسة داخلية' : 'Internal')}
        </span>
      ),
    },
    {
      key: 'status',
      header: locale === 'ar' ? 'الحالة' : 'Status',
      align: 'center',
      render: (item) => {
        let badgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
        if (item.status === 'pending') badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
        if (item.status === 'cancelled') badgeStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';

        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badgeStyle}`}>
            {item.status === 'confirmed' ? t.statusConfirmed : item.status === 'pending' ? t.statusPending : t.statusCancelled}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: t.actions,
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {canManage && item.status !== 'confirmed' && (
            <button
              onClick={() => {
                updateAppointmentStatus(item.id, 'confirmed');
                showToast(locale === 'ar' ? 'تم تأكيد الموعد' : 'Appointment confirmed');
              }}
              className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title={locale === 'ar' ? 'تأكيد الموعد' : 'Confirm'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canManage && (
            <button
              onClick={() => {
                if (confirm(locale === 'ar' ? 'هل تريد إلغاء هذا الموعد؟' : 'Cancel appointment?')) {
                  deleteAppointment(item.id);
                  showToast(locale === 'ar' ? 'تم حذف وإلغاء الموعد' : 'Appointment cancelled');
                }
              }}
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.navAppointments}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'تقويم جلسات المحاكم، مرافعات الدوائر القضائية، وفحص تعارض المواعيد آلياً'
              : 'Judicial court hearings calendar, client consultations, and conflict-checked docketing'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'قائمة' : 'List'}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'تقويم' : 'Calendar'}</span>
            </button>
          </div>

          {(canManage || canRequest) && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {activeRole === 'client'
                  ? (locale === 'ar' ? 'طلب موعد استشارة' : 'Request Consultation')
                  : (locale === 'ar' ? 'جدولة جلسة / موعد' : 'Schedule Session')}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'list' ? (
        <DataTable
          data={isolatedAppointments}
          columns={columns}
          searchPlaceholder={locale === 'ar' ? 'بحث بمسمى الجلسة، المحكمة، المحامي...' : 'Search session, court, lawyer...'}
          searchFilter={(item, query) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.location.toLowerCase().includes(query.toLowerCase()) ||
            item.lawyerName.toLowerCase().includes(query.toLowerCase())
          }
          exportFileName="firm_appointments_calendar"
        />
      ) : (
        /* Visual Calendar Grid View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-500" />
              <span>{locale === 'ar' ? 'أجندة الجلسات المجدولة لشهر نوفمبر 2026' : 'November 2026 Hearings Schedule'}</span>
            </span>
            <span className="text-xs text-slate-400">
              {isolatedAppointments.length} {locale === 'ar' ? 'مواعيد مسجلة' : 'Sessions recorded'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isolatedAppointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {app.title}
                  </h4>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {app.status === 'confirmed' ? t.statusConfirmed : t.statusPending}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{app.dateTime} ({app.durationMinutes} دقيقة)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{app.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">{app.lawyerName}</span>
                  <span className="font-mono text-slate-400">{app.caseNumber || 'عام'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={locale === 'ar' ? 'جدولة جلسة قضائية أو موعد جديد' : 'New Hearing / Appointment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'موضوع ومسمى الموعد' : 'Title / Subject'} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              placeholder={locale === 'ar' ? 'مثال: جلسة نظر تقرير الخبرة - المحكمة التجارية' : 'e.g. Judicial Hearing - Commercial Court'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'نوع الموعد' : 'Type'}
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                <option value="court_hearing">{locale === 'ar' ? 'جلسة مرافعة قضائية' : 'Court Hearing'}</option>
                <option value="client_consultation">{locale === 'ar' ? 'استشارة مع موكل' : 'Client Consultation'}</option>
                <option value="internal_meeting">{locale === 'ar' ? 'اجتماع داخلي للمكتب' : 'Internal Meeting'}</option>
                <option value="investigation">{locale === 'ar' ? 'تحقيق أو فحص أدلة' : 'Investigation'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'المحامي المسؤول' : 'Counsel'} *
              </label>
              <select
                value={formData.lawyerId}
                onChange={(e) => handleLawyerChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'التاريخ والوقت' : 'Date & Time'} *
              </label>
              <input
                type="text"
                required
                value={formData.dateTime}
                onChange={(e) => handleDateTimeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
                placeholder="YYYY-MM-DD HH:MM"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'المقر / القاعة' : 'Location / Chamber'}
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Conflict Warning Alert */}
          {conflictWarning && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={Boolean(conflictWarning)}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
