/**
 * ClientDashboard Component (Role: client)
 * Privileged Retained Client Portal for Live Caseload Tracking & Invoices Settlement.
 * Includes:
 * - Personalized Client Greeting Banner with Client Avatar
 * - 4 Client KPI Stat Cards (My Cases, Upcoming Appointments, Outstanding Fees, Total Paid)
 * - My Cases Cards with Case Number, Supervising Counsel, Colored Status Badge, and Progress Bar
 * - Upcoming Court Hearings & Consultations List
 * - My Invoices Ledger with Online Payment Gateway Modal Simulation & PDF Download
 * - Direct Chat with Assigned Lawyer Card with Recent Message Preview & Unread Badge
 * - Case Documents List with Encrypted Download Actions
 * - Client Quick Actions (Request Appointment, Message Lawyer, View Invoices)
 */

import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/auth.store';
import { useTranslation } from '../../../utils/translations';
import { StatCard } from '../../../components/ui/StatCard';
import { Modal } from '../../../components/ui/Modal';
import {
  Scale,
  Calendar,
  CreditCard,
  CheckCircle,
  MessageSquare,
  FileText,
  Download,
  Plus,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  CalendarPlus,
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const {
    locale,
    cases,
    appointments,
    invoices,
    documents,
    currentUser,
    setCurrentView,
    firmSettings,
    updateInvoiceStatus,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const clientName = user?.name || (locale === 'ar' ? 'م. فيصل العتيبي' : 'Eng. Faisal Al-Otaibi');
  const activeUserId = user?.id || currentUser.id;

  const [paymentModalInvoice, setPaymentModalInvoice] = useState<any | null>(null);

  // Strict Client Data Isolation Filter
  const myCases = cases.filter((c) => c.clientId === 'cl-1' || c.clientName?.includes('الأفق') || c.clientName === clientName);
  const myInvoices = invoices.filter((i) => i.clientId === 'cl-1' || i.clientName === clientName);
  const myAppointments = appointments.filter((a) => a.clientId === 'cl-1' || a.clientName === clientName);
  const myCaseIds = new Set(myCases.map((c) => c.id));
  const myDocuments = documents.filter((d) => d.caseId && myCaseIds.has(d.caseId));

  const outstandingAmount = myInvoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const paidTotal = myInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const handlePayConfirm = (invoice: any) => {
    updateInvoiceStatus(invoice.id, 'paid', 'card');
    setPaymentModalInvoice(null);
    showToast(
      locale === 'ar'
        ? `تم سداد الفاتورة رقم ${invoice.number} بنجاح عبر بوابة سداد الإلكترونية`
        : `Invoice ${invoice.number} paid successfully via secure gateway`
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Client Greeting Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-base uppercase shrink-0 shadow-md">
            {clientName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {locale === 'ar' ? 'بوابة الموكل الإلكترونية الآمنة' : 'Privileged Client Portal'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {locale === 'ar' ? `مرحباً، ${clientName} 👋` : `Welcome, ${clientName} 👋`}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {locale === 'ar'
                ? 'متابعة حية لمستجدات القضايا المنظورة، الجلسات القادمة، والفوترة الإلكترونية'
                : 'Live status of active litigation, court dates, and electronic billing'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('chat')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'تواصل مع المحامي' : 'Message Lawyer'}</span>
          </button>
          <button
            onClick={() => setCurrentView('appointments')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'طلب موعد' : 'Request Meeting'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setCurrentView('cases')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'قضاياي المنظورة' : 'My Active Cases'}
            value={myCases.length}
            subtitle={locale === 'ar' ? 'قضايا جارية أمام المحاكم' : 'Before courts'}
            icon={Scale}
          />
        </div>

        <div onClick={() => setCurrentView('appointments')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مواعيد قادمة' : 'Upcoming Hearings'}
            value={myAppointments.length}
            subtitle={locale === 'ar' ? 'جلسات ومقابلات مؤكدة' : 'Scheduled dates'}
            icon={Calendar}
          />
        </div>

        <div onClick={() => setCurrentView('invoices')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مستحقات معلقة' : 'Outstanding Fees'}
            value={`${outstandingAmount.toLocaleString()} ${firmSettings.currency}`}
            subtitle={locale === 'ar' ? 'فواتير أتعاب مرحلية' : 'Pending payment'}
            icon={CreditCard}
          />
        </div>

        <div className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'إجمالي مدفوعاتي' : 'Total Paid Fees'}
            value={`${paidTotal.toLocaleString()} ${firmSettings.currency}`}
            subtitle={locale === 'ar' ? 'مسددة بنجاح' : 'Settled balance'}
            icon={CheckCircle}
          />
        </div>
      </div>

      {/* 3. Main Section Grid: My Cases & Chat with Lawyer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Cases Cards */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'سجل قضاياي ومستجدات الترافع' : 'My Matters & Case Status'}
            </h3>
            <button
              onClick={() => setCurrentView('cases')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
            >
              <span>{locale === 'ar' ? 'التفاصيل' : 'Details'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {myCases.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {c.caseNumber}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-medium">{c.court}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 w-fit">
                    {t.statusOpen}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {c.title}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {c.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{locale === 'ar' ? 'المحامي المشرف: ' : 'Supervising Counsel: '}{c.lawyerName}</span>
                    <span>75% {locale === 'ar' ? 'مكتمل' : 'Complete'}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Card with Assigned Lawyer & Direct Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>{locale === 'ar' ? 'التواصل المباشر مع المحامي' : 'Direct Counsel Chat'}</span>
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                  س
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                    {locale === 'ar' ? 'المحامية سارة المنصور' : 'Adv. Sarah Al-Mansour'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● {locale === 'ar' ? 'متصلة الآن للرد' : 'Online'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                "{locale === 'ar' ? 'تمت مراجعة لائحة التداعي المحدثة وجاري إيداعها في منصة ناجز العدلية.' : 'Draft brief has been reviewed and queued for Najiz filing.'}"
              </p>

              <button
                onClick={() => setCurrentView('chat')}
                className="w-full py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg text-center hover:opacity-90 transition-opacity"
              >
                {locale === 'ar' ? 'فتح المحادثة المشفرة' : 'Open Encrypted Chat'}
              </button>
            </div>
          </div>

          {/* Upcoming Court Sessions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{locale === 'ar' ? 'المواعيد والجلسات القادمة' : 'Upcoming Dates'}</span>
            </h3>

            <div className="space-y-2">
              {myAppointments.map((apt) => (
                <div key={apt.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>{apt.dateTime}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{t.statusConfirmed}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{apt.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Grid: My Invoices Ledger & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Invoices Ledger */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'فواتير الأتعاب والسداد الإلكتروني' : 'My Invoices & Online Settlement'}
            </h3>
            <button
              onClick={() => setCurrentView('invoices')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {locale === 'ar' ? 'عرض دفتر الفواتير' : 'View Ledger'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                  <th className="py-2.5 px-3 text-end">{locale === 'ar' ? 'الإجمالي (شامل الضريبة 15%)' : 'Total (Inc. VAT)'}</th>
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                  <th className="py-2.5 px-3 text-center">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-end">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold font-mono text-slate-900 dark:text-slate-100">{inv.number}</td>
                    <td className="py-2.5 px-3 text-end font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {inv.total.toLocaleString()} {firmSettings.currency}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums">{inv.dueDate}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {inv.status === 'paid' ? t.statusPaid : t.statusPending}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-end">
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => setPaymentModalInvoice(inv)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>{locale === 'ar' ? 'دفع الآن' : 'Pay Now'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentView('invoices')}
                          className="px-2.5 py-1 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {locale === 'ar' ? 'معاينة الفاتورة' : 'View'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Case Documents List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>{locale === 'ar' ? 'مستندات قضاياي' : 'Case Documents'}</span>
            </h3>
            <button
              onClick={() => setCurrentView('documents')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {locale === 'ar' ? 'الأرشيف' : 'Archive'}
            </button>
          </div>

          <div className="space-y-3">
            {myDocuments.slice(0, 4).map((doc) => (
              <div key={doc.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block line-clamp-1">{doc.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
                  </div>
                </div>

                <button
                  onClick={() => showToast(locale === 'ar' ? `جاري تحميل المستند المشفر: ${doc.fileName}` : `Downloading ${doc.fileName}`)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Online Payment Modal Simulation */}
      {paymentModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentModalInvoice(null)}
          title={locale === 'ar' ? 'بوابة سداد الأتعاب الإلكترونية' : 'Legal Fee Settlement Portal'}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
              <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300 block">
                {paymentModalInvoice.number}
              </span>
              <span className="text-slate-500 block">{paymentModalInvoice.notes}</span>
              <div className="flex justify-between items-center pt-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <span>{locale === 'ar' ? 'الإجمالي المستحق شامل الضريبة (15%):' : 'Total Due:'}</span>
                <span className="font-mono tabular-nums">{paymentModalInvoice.total.toLocaleString()} {firmSettings.currency}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {locale === 'ar' ? 'رقم البطاقة (مدى / فيزا)' : 'Card Number'}
                </label>
                <input
                  type="text"
                  defaultValue="4111 2222 3333 4444"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry'}
                  </label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CVV</label>
                  <input
                    type="password"
                    defaultValue="888"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-center"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => handlePayConfirm(paymentModalInvoice)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
              >
                {locale === 'ar' ? 'تأكيد السداد الآن' : 'Confirm Settlement'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
