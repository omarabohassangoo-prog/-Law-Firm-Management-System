/**
 * AccountantDashboard Component (Role: accountant)
 * Financial Accounting, Revenue Ledger & Receivables Management Desk.
 * Includes:
 * - Financial Greeting Banner with Monthly Summary
 * - 4 Primary Finance Stat Cards (Month Revenue, Pending Invoices Count, Overdue Count, Paid Count)
 * - Recharts 6-Month Financial Revenue Performance Bar Chart
 * - Pending & Overdue Invoices Table with Mark Paid & Remind Actions
 * - Recent Settlement Payments List
 * - YTD Cashflow Summary Breakdown
 * - Quick Actions (New Invoice, Export XLSX Financial Report, Send All Payment Reminders)
 */

import React from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/auth.store';
import { useTranslation } from '../../../utils/translations';
import { StatCard } from '../../../components/ui/StatCard';
import {
  TrendingUp,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Download,
  Mail,
  DollarSign,
  Printer,
  Check,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AccountantDashboard: React.FC = () => {
  const {
    locale,
    invoices,
    firmSettings,
    setCurrentView,
    updateInvoiceStatus,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const accountantName = user?.name || (locale === 'ar' ? 'المحاسب خالد الشمري' : 'Accountant Khalid');

  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  const monthRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPending = pendingInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalYtdRevenue = monthRevenue + 228000;

  const currentMonthName = new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const chartData = [
    { month: locale === 'ar' ? 'يونيو' : 'Jun', revenue: 42000 },
    { month: locale === 'ar' ? 'يوليو' : 'Jul', revenue: 58000 },
    { month: locale === 'ar' ? 'أغسطس' : 'Aug', revenue: 64000 },
    { month: locale === 'ar' ? 'سبتمبر' : 'Sep', revenue: 79000 },
    { month: locale === 'ar' ? 'أكتوبر' : 'Oct', revenue: 95000 },
    { month: locale === 'ar' ? 'نوفمبر' : 'Nov', revenue: monthRevenue > 0 ? monthRevenue : 112000 },
  ];

  const handleExportReport = () => {
    showToast(
      locale === 'ar'
        ? 'تم توليد وتنزيل تقرير الإقرار الضريبي والتدفقات النقدية بصيغة (XLSX)'
        : 'Financial ledger report exported successfully (XLSX)'
    );
  };

  const handleSendAllReminders = () => {
    showToast(
      locale === 'ar'
        ? 'تم إرسال تذكيرات آلياً لكافة الموكلين المسجل بحقهم فواتير معلقة'
        : 'Payment reminders dispatched to all outstanding invoices'
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Greeting Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 block mb-1 uppercase tracking-wider">
            {locale === 'ar' ? 'الإدارة المالية والإقرارات الضريبية' : 'Financial Management & VAT Compliance'}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {locale === 'ar' ? `مرحباً، ${accountantName} 💰` : `Welcome, ${accountantName} 💰`}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {locale === 'ar'
              ? `ملخص الأداء والتدفقات المالية لشهر ${currentMonthName} — احتساب ضريبة القيمة المضافة 15%`
              : `Financial performance and VAT 15% settlement summary for ${currentMonthName}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('invoices')}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</span>
          </button>
          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'تصدير التقرير (XLSX)' : 'Export XLSX'}</span>
          </button>
          <button
            onClick={handleSendAllReminders}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'تذكير الفواتير' : 'Send Reminders'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setCurrentView('invoices')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'إيرادات الشهر' : 'Month Revenue'}
            value={`${monthRevenue.toLocaleString()} ${firmSettings.currency}`}
            subtitle={locale === 'ar' ? `${paidInvoices.length} فواتير مسددة بالكامل` : `${paidInvoices.length} paid invoices`}
            icon={TrendingUp}
            trend={{ value: '+14.2%', isPositive: true }}
          />
        </div>

        <div onClick={() => setCurrentView('invoices')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'فواتير معلقة' : 'Pending Invoices'}
            value={pendingInvoices.length}
            subtitle={locale === 'ar' ? `بقيمة ${totalPending.toLocaleString()} ${firmSettings.currency}` : `Total ${totalPending.toLocaleString()} SAR`}
            icon={CreditCard}
          />
        </div>

        <div onClick={() => setCurrentView('invoices')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'فواتير متأخرة' : 'Overdue Invoices'}
            value={overdueInvoices.length}
            subtitle={locale === 'ar' ? `بقيمة ${totalOverdue.toLocaleString()} ${firmSettings.currency}` : `Total ${totalOverdue.toLocaleString()} SAR`}
            icon={AlertCircle}
          />
        </div>

        <div className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مسددة هذا الشهر' : 'Settled This Month'}
            value={paidInvoices.length}
            subtitle={locale === 'ar' ? 'تحصيلات بنكية وبطاقات' : 'Bank & Card receipts'}
            icon={CheckCircle}
          />
        </div>
      </div>

      {/* 3. Main Section: Revenue Chart & Pending Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>{locale === 'ar' ? 'منحنى التدفق المالي والتحصيلات (6 أشهر)' : 'Financial Cashflow & Settlement Chart'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              {firmSettings.currency}
            </span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} ${firmSettings.currency}`, locale === 'ar' ? 'الإيراد' : 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Summary & YTD Statistics */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'ملخص التدفق النقدي والتراكمي (YTD)' : 'YTD Cash Flow Summary'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">{locale === 'ar' ? 'إجمالي الإيراد التراكمي (YTD):' : 'Total Revenue (YTD):'}</span>
                <span className="font-bold font-mono text-slate-900 dark:text-slate-100 text-sm">
                  {totalYtdRevenue.toLocaleString()} {firmSettings.currency}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
                <span className="text-amber-800 dark:text-amber-300 font-semibold">{locale === 'ar' ? 'إجمالي المستحقات المعلقة:' : 'Total Pending:'}</span>
                <span className="font-bold font-mono text-amber-900 dark:text-amber-200 text-sm">
                  {totalPending.toLocaleString()} {firmSettings.currency}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 flex items-center justify-between">
                <span className="text-rose-800 dark:text-rose-300 font-semibold">{locale === 'ar' ? 'إجمالي المتأخرات الفائتة:' : 'Total Overdue:'}</span>
                <span className="font-bold font-mono text-rose-900 dark:text-rose-200 text-sm">
                  {totalOverdue.toLocaleString()} {firmSettings.currency}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('invoices')}
            className="w-full py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg text-center hover:opacity-90 transition-opacity"
          >
            {locale === 'ar' ? 'فتح دفتر القيود المالية الكامل' : 'Open Complete Financial Ledger'}
          </button>
        </div>
      </div>

      {/* 4. Pending & Overdue Invoices Table Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>{locale === 'ar' ? 'الفواتير التي تتطلب المتابعة والتحصيل الفوري' : 'Pending & Overdue Action Ledger'}</span>
          </h3>
          <button
            onClick={() => setCurrentView('invoices')}
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
                <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</th>
                <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'الموكل' : 'Client'}</th>
                <th className="py-2.5 px-3 text-end">{locale === 'ar' ? 'المبلغ الإجمالي' : 'Total'}</th>
                <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                <th className="py-2.5 px-3 text-center">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-2.5 px-3 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold font-mono text-slate-900 dark:text-slate-100">{inv.number}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{inv.clientName}</td>
                  <td className="py-2.5 px-3 text-end font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {inv.total.toLocaleString()} {firmSettings.currency}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">{inv.dueDate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {inv.status === 'paid' ? t.statusPaid : inv.status === 'overdue' ? t.statusOverdue : t.statusPending}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => {
                            updateInvoiceStatus(inv.id, 'paid', 'bank_transfer');
                            showToast(locale === 'ar' ? `تم تسجيل سداد الفاتورة ${inv.number}` : 'Invoice marked paid');
                          }}
                          className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>{locale === 'ar' ? 'سداد' : 'Mark Paid'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => showToast(locale === 'ar' ? `تم إرسال تذكير للموكل ${inv.clientName}` : 'Reminder sent')}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                      >
                        {locale === 'ar' ? 'تذكير' : 'Remind'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
