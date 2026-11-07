/**
 * CaseDetailPage Component
 * Detailed view of a legal matter with 5 comprehensive tabs:
 * Documents, Invoices, Appointments, Timeline (Audit Log), and Case Chat.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../core/api/client';
import { Case, DocumentItem, Invoice, Appointment } from '../../types';
import {
  Briefcase,
  FileText,
  DollarSign,
  Calendar,
  Activity,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  User,
  Building,
  Scale,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface CaseDetailPageProps {
  caseId: string;
  onBack: () => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseId, onBack }) => {
  const { locale, cases, currentUser, showToast, setCurrentView } = useAppStore();
  const { user } = useAuthStore();
  const activeRole = user?.role || currentUser.role;

  const [activeTab, setActiveTab] = useState<'documents' | 'invoices' | 'appointments' | 'timeline' | 'chat'>('documents');
  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timelineLogs, setTimelineLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Case details from API
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get<any>(`/api/cases/${caseId}`)
      .then((data) => {
        if (!mounted) return;
        if (data) {
          setCaseItem(data);
          setDocuments(data.documents || []);
          setInvoices(data.invoices || []);
          setAppointments(data.appointments || []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        // Fallback to local store case
        const found = cases.find((c) => c.id === caseId);
        if (found) {
          setCaseItem(found);
        }
        setLoading(false);
      });

    // Load Audit Timeline for this case
    api
      .get<any>(`/api/audit?entity=Case&entityId=${caseId}`)
      .then((logs) => {
        if (mounted && Array.isArray(logs)) {
          setTimelineLogs(logs);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [caseId, cases]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">{locale === 'ar' ? 'جارٍ تحميل ملف القضية...' : 'Loading case details...'}</p>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {locale === 'ar' ? 'لم يتم العثور على القضية أو لا تملك صلاحية الوصول إليها.' : 'Case not found or access restricted.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
        >
          {locale === 'ar' ? 'العودة للقضايا' : 'Back to Cases'}
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    archived: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };

  const statusLabels: Record<string, string> = {
    open: locale === 'ar' ? 'مفتوحة / قيد الترافع' : 'Open',
    pending: locale === 'ar' ? 'قيد الانتظار' : 'Pending',
    closed: locale === 'ar' ? 'مغلقة بحكم' : 'Closed',
    archived: locale === 'ar' ? 'مؤرشفة' : 'Archived',
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={locale === 'ar' ? 'رجوع' : 'Back'}
          >
            {locale === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{locale === 'ar' ? 'القضايا' : 'Cases'}</span>
              <span>/</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{caseItem.caseNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {caseItem.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[caseItem.status] || statusColors.open
            }`}
          >
            {statusLabels[caseItem.status] || caseItem.status}
          </span>
          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">
            {caseItem.caseNumber}
          </span>
        </div>
      </div>

      {/* Info Grid (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">{locale === 'ar' ? 'العميل / الموكل' : 'Client'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{caseItem.clientName}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Scale className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">{locale === 'ar' ? 'المحامي المسؤول' : 'Assigned Attorney'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{caseItem.lawyerName}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">{locale === 'ar' ? 'المحكمة والدائرة' : 'Court & Chamber'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{caseItem.court}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">{locale === 'ar' ? 'تاريخ الفتح' : 'Opened At'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{caseItem.openedAt}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">{locale === 'ar' ? 'الجلسة القادمة' : 'Next Hearing'}</span>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {caseItem.nextHearingDate || (locale === 'ar' ? 'لم تحدد بعد' : 'Not scheduled')}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs text-slate-500 block">{locale === 'ar' ? 'الأتعاب والتحصيل' : 'Fees & Collected'}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {caseItem.paidAmount.toLocaleString()} / {caseItem.fee.toLocaleString()} ر.س
              </span>
            </div>
          </div>
        </div>

        {caseItem.description && (
          <div className="md:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 block mb-1">{locale === 'ar' ? 'موضوع ووصف الدعوى' : 'Case Subject & Description'}</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{caseItem.description}</p>
          </div>
        )}
      </div>

      {/* Tabs Navigation (5 Tabs) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'documents'
              ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{locale === 'ar' ? 'المستندات والأدلة' : 'Documents'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-mono">
            {documents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{locale === 'ar' ? 'الفواتير والأتعاب' : 'Invoices'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-mono">
            {invoices.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'appointments'
              ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{locale === 'ar' ? 'الجلسات والمواعيد' : 'Hearings & Appointments'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-mono">
            {appointments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'timeline'
              ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{locale === 'ar' ? 'السجل الزمني والتدقيق' : 'Audit Timeline'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'chat'
              ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{locale === 'ar' ? 'المحادثة الآمنة' : 'Case Chat'}</span>
        </button>
      </div>

      {/* Tabs Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        {/* Tab 1: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'مستندات القضية والمذكرات المودعة' : 'Case Filings & Evidence'}
              </h3>
              {(activeRole === 'admin' || activeRole === 'lawyer' || activeRole === 'legal_assistant') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('documents');
                    showToast(locale === 'ar' ? 'الانتقال لمركز المستندات لرفع ملف' : 'Navigating to Documents manager');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'رفع مستند' : 'Upload Document'}</span>
                </button>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{locale === 'ar' ? 'لا توجد مستندات مرفوعة لهذه القضية بعد' : 'No documents uploaded for this case yet'}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                          {doc.title || doc.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {doc.fileSize} · {doc.uploadedByName} · {doc.uploadedAt}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(locale === 'ar' ? `بدأ تحميل: ${doc.title || doc.fileName}` : `Downloading: ${doc.title || doc.fileName}`)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title={locale === 'ar' ? 'تحميل' : 'Download'}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'الفواتير الصادرة للموكل' : 'Associated Invoices'}
              </h3>
              {(activeRole === 'admin' || activeRole === 'accountant') && (
                <button
                  type="button"
                  onClick={() => setCurrentView('invoices')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</span>
                </button>
              )}
            </div>

            {invoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{locale === 'ar' ? 'لا توجد فواتير لهذه القضية' : 'No invoices issued for this case'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="py-2 text-start font-semibold">{locale === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                      <th className="py-2 text-start font-semibold">{locale === 'ar' ? 'المبلغ' : 'Amount'}</th>
                      <th className="py-2 text-start font-semibold">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="py-2 text-start font-semibold">{locale === 'ar' ? 'الاستحقاق' : 'Due Date'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2.5 font-mono font-semibold">{inv.number}</td>
                        <td className="py-2.5 font-semibold">{inv.total.toLocaleString()} ر.س</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            {inv.status === 'paid' ? (locale === 'ar' ? 'مدفوعة' : 'Paid') : (locale === 'ar' ? 'معلقة' : 'Pending')}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500">{inv.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
              {locale === 'ar' ? 'جدول الجلسات القضائية والاجتماعات' : 'Hearings & Schedule'}
            </h3>

            {appointments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{locale === 'ar' ? 'لا توجد جلسات مجدولة حالياً' : 'No upcoming hearings scheduled'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{apt.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{apt.dateTime ? apt.dateTime.replace('T', ' ').substring(0, 16) : ''}</span>
                        <span>·</span>
                        <span>{apt.notes}</span>
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {locale === 'ar' ? 'مؤكدة' : 'Confirmed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Timeline / Audit */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
              {locale === 'ar' ? 'السجل الزمني والتدقيق الأمني للقضية' : 'Matter Timeline & Audit History'}
            </h3>

            <div className="relative ps-6 border-s-2 border-slate-200 dark:border-slate-800 space-y-6 my-4">
              <div className="relative">
                <span className="absolute -start-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {locale === 'ar' ? 'فتح ملف القضية وتسجيلها رسمياً' : 'Matter Opened & Docketed'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{caseItem.openedAt}</span>
              </div>

              {timelineLogs.map((log) => (
                <div key={log.id} className="relative">
                  <span className="absolute -start-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{log.action}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {log.createdAt ? log.createdAt.replace('T', ' ').substring(0, 19) : ''}
                  </span>
                </div>
              ))}

              <div className="relative">
                <span className="absolute -start-[31px] top-0 w-4 h-4 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-900" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {locale === 'ar' ? 'إيداع لائحة الدعوى لدى الدائرة القضائية' : 'Pleading Dispatched'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{caseItem.openedAt}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Chat */}
        {activeTab === 'chat' && (
          <div className="space-y-4 text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'غرفة المحادثة الخاصة بالقضية' : 'Case Dedicated Discussion Room'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {locale === 'ar'
                  ? 'محادثة مشفرة فورية تجمع الموكل، والمحامي المسؤول، وإدارة المكتب لمتابعة مستجدات الجلسات.'
                  : 'Encrypted group chat connecting the client, attorney, and practice manager.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('chat')}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <span>{locale === 'ar' ? 'فتح المحادثة في قسم الدردشة' : 'Open in Chat Center'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
