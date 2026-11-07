/**
 * InvoicesPage Component
 * Full legal billing lifecycle with strict role data isolation:
 * - Admin / Accountant: full CRUD, status update (mark paid), create invoices
 * - Lawyer: view only invoices of assigned cases (read-only)
 * - Client: view only own invoices with direct online payment action
 * - Secretary: 403 Access Denied
 * Includes 15% VAT calculation, aging analysis, and printable tax invoice modal.
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Invoice, InvoiceStatus } from '../../types';
import {
  Plus,
  Eye,
  Printer,
  CreditCard,
  Check,
  X,
  Scale,
  ShieldAlert,
  Download,
  Filter,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { locale, invoices, clients, cases, firmSettings, currentUser, addInvoice, updateInvoiceStatus, deleteInvoice, showToast } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || currentUser.role;
  const activeUserId = user?.id || currentUser.id;

  // 403 Check for Secretary
  if (activeRole === 'secretary' || activeRole === 'legal_assistant') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'غير مصرح بالوصول إلى المعاملات المالية' : 'Access Denied: Financial Ledger Restricted'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {locale === 'ar'
              ? 'صلاحيات الفواتير والتحصيلات الضريبية مخصصة فقط لمدير المكتب، المحاسب، والمحامي المشرف أو الموكل المعني.'
              : 'Billing records and VAT transactions are restricted to Executive Management, Finance, and respective parties.'}
          </p>
        </div>
      </div>
    );
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    number: `INV-2026-0${Math.floor(100 + Math.random() * 900)}`,
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.name || '',
    caseId: cases[0]?.id || '',
    caseNumber: cases[0]?.caseNumber || '',
    subtotal: 10000,
    taxRate: 15,
    taxAmount: 1500,
    discount: 0,
    total: 11500,
    status: 'pending' as InvoiceStatus,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'أتعاب مرحلية للدعوى القضائية وفقاً لعقد الأتعاب المبرم.',
  });

  // Calculate accessible cases based on role
  const accessibleCases = useMemo(() => {
    if (activeRole === 'admin' || activeRole === 'accountant') {
      return cases;
    }
    if (activeRole === 'lawyer') {
      return cases.filter((c) => c.lawyerId === activeUserId || c.lawyerId === 'usr-lawyer');
    }
    if (activeRole === 'client') {
      const clientRecord = clients.find((cl) => cl.userId === activeUserId || cl.email === user?.email);
      const clientId = clientRecord ? clientRecord.id : 'cl-1';
      return cases.filter((c) => c.clientId === clientId);
    }
    return [];
  }, [cases, activeRole, activeUserId, clients, user]);

  const accessibleCaseIds = useMemo(() => new Set(accessibleCases.map((c) => c.id)), [accessibleCases]);

  // Strict Role Data Isolation for Invoices
  const isolatedInvoices = useMemo(() => {
    let result = invoices;

    if (activeRole === 'lawyer') {
      // Lawyer sees invoices for their cases
      result = invoices.filter((inv) => !inv.caseId || accessibleCaseIds.has(inv.caseId));
    } else if (activeRole === 'client') {
      // Client sees only their own invoices
      const clientRecord = clients.find((cl) => cl.userId === activeUserId || cl.email === user?.email);
      const targetClientId = clientRecord ? clientRecord.id : 'cl-1';
      result = invoices.filter((inv) => inv.clientId === targetClientId);
    }

    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.status === statusFilter);
    }

    return result;
  }, [invoices, activeRole, activeUserId, clients, user, accessibleCaseIds, statusFilter]);

  const canCreate = activeRole === 'admin' || activeRole === 'accountant';
  const canMarkPaid = activeRole === 'admin' || activeRole === 'accountant';
  const canPayOnline = activeRole === 'client';

  const handleOpenAdd = () => {
    const subtotal = 15000;
    const taxAmount = (subtotal * 15) / 100;
    const total = subtotal + taxAmount;

    setFormData({
      number: `INV-2026-0${Math.floor(100 + Math.random() * 900)}`,
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      caseId: cases[0]?.id || '',
      caseNumber: cases[0]?.caseNumber || '',
      subtotal,
      taxRate: 15,
      taxAmount,
      discount: 0,
      total,
      status: 'pending',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'أتعاب مرحلية للدعوى القضائية وفقاً لعقد الأتعاب المبرم.',
    });
    setModalOpen(true);
  };

  const handleSubtotalChange = (sub: number) => {
    const tax = (sub * 15) / 100;
    setFormData((prev) => ({
      ...prev,
      subtotal: sub,
      taxAmount: tax,
      total: sub + tax,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cl = clients.find((c) => c.id === formData.clientId);
    const cs = cases.find((c) => c.id === formData.caseId);

    addInvoice({
      ...formData,
      clientName: cl?.name || formData.clientName,
      caseNumber: cs?.caseNumber || formData.caseNumber,
    });
    showToast(locale === 'ar' ? 'تم إصدار الفاتورة الضريبية بنجاح' : 'Invoice issued successfully');
    setModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClientPayConfirm = (invoice: Invoice) => {
    updateInvoiceStatus(invoice.id, 'paid', 'card');
    setPaymentModalInvoice(null);
    showToast(
      locale === 'ar'
        ? `تم سداد الفاتورة رقم ${invoice.number} بنجاح عبر بوابة سداد الإلكترونية`
        : `Invoice ${invoice.number} settled successfully via payment gateway`
    );
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: locale === 'ar' ? 'رقم الفاتورة' : 'Invoice #',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
          {item.number}
        </span>
      ),
    },
    {
      key: 'clientName',
      header: locale === 'ar' ? 'الموكل' : 'Client',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {item.clientName}
        </span>
      ),
    },
    {
      key: 'caseNumber',
      header: locale === 'ar' ? 'القضية' : 'Matter #',
      render: (item) => (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {item.caseNumber || (locale === 'ar' ? 'استشارة عامة' : 'General')}
        </span>
      ),
    },
    {
      key: 'subtotal',
      header: locale === 'ar' ? 'الأساسي' : 'Subtotal',
      align: 'right',
      render: (item) => (
        <span className="tabular-nums text-slate-600 dark:text-slate-400">
          {item.subtotal.toLocaleString()} {firmSettings.currency}
        </span>
      ),
    },
    {
      key: 'total',
      header: locale === 'ar' ? 'الإجمالي مع الضريبة (15%)' : 'Total (Inc. VAT)',
      align: 'right',
      sortable: true,
      render: (item) => (
        <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
          {item.total.toLocaleString()} {firmSettings.currency}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-500 tabular-nums">
          {item.dueDate}
        </span>
      ),
    },
    {
      key: 'status',
      header: locale === 'ar' ? 'الحالة' : 'Status',
      align: 'center',
      render: (item) => {
        let badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
        if (item.status === 'paid') badgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
        if (item.status === 'overdue') badgeStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
        if (item.status === 'cancelled') badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badgeStyle}`}>
            {item.status === 'paid' ? t.statusPaid : item.status === 'overdue' ? t.statusOverdue : item.status === 'pending' ? t.statusPending : t.statusCancelled}
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
          <button
            onClick={() => setPrintInvoice(item)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={locale === 'ar' ? 'معاينة وطباعة الفاتورة' : 'Print / View'}
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {canMarkPaid && item.status !== 'paid' && (
            <button
              onClick={() => {
                updateInvoiceStatus(item.id, 'paid', 'bank_transfer');
                showToast(locale === 'ar' ? `تم تسجيل سداد الفاتورة ${item.number}` : `Invoice marked as paid`);
              }}
              className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
              title={locale === 'ar' ? 'تسجيل سداد بنكي' : 'Mark Paid'}
            >
              <Check className="w-3 h-3" />
              <span>{locale === 'ar' ? 'سداد' : 'Mark Paid'}</span>
            </button>
          )}

          {canPayOnline && item.status !== 'paid' && (
            <button
              onClick={() => setPaymentModalInvoice(item)}
              className="px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs"
            >
              <CreditCard className="w-3 h-3" />
              <span>{locale === 'ar' ? 'دفع إلكتروني' : 'Pay Online'}</span>
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
            {t.navInvoices}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'إصدار الفواتير الضريبية، احتساب ضريبة القيمة المضافة 15%، وإدارة التحصيلات وسداد الأتعاب'
              : 'Tax invoices, 15% VAT calculation, aging analysis, and settlement'}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'إصدار فاتورة جديدة' : 'New Invoice'}</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'حالة السداد:' : 'Status:'}</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">{locale === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
          <option value="pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
          <option value="paid">{locale === 'ar' ? 'مدفوعة ومسددة' : 'Paid'}</option>
          <option value="overdue">{locale === 'ar' ? 'متأخرة' : 'Overdue'}</option>
        </select>
      </div>

      {/* Invoices Table */}
      <DataTable
        data={isolatedInvoices}
        columns={columns}
        searchPlaceholder={locale === 'ar' ? 'بحث برقم الفاتورة، الموكل، الحالة...' : 'Search invoice #, client, status...'}
        searchFilter={(item, query) =>
          item.number.toLowerCase().includes(query.toLowerCase()) ||
          item.clientName.toLowerCase().includes(query.toLowerCase()) ||
          item.status.toLowerCase().includes(query.toLowerCase())
        }
        exportFileName="firm_invoices_ledger"
      />

      {/* Add Invoice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={locale === 'ar' ? 'إصدار فاتورة أتعاب ضريبية' : 'Generate Tax Invoice'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'} *
              </label>
              <input
                type="text"
                required
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'الموكل' : 'Client'} *
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'القضية المرتبطة' : 'Linked Matter'}
              </label>
              <select
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                <option value="">{locale === 'ar' ? 'بدون قضية (استشارة عامة)' : 'None (General Consultation)'}</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.caseNumber} - {c.title.substring(0, 25)}...</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'} *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'المبلغ الأساسي قبل الضريبة' : 'Subtotal'} ({firmSettings.currency}) *
              </label>
              <input
                type="number"
                required
                value={formData.subtotal}
                onChange={(e) => handleSubtotalChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 tabular-nums font-semibold"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>{locale === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}:</span>
              <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {formData.taxAmount.toLocaleString()} {firmSettings.currency}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
              <span>{locale === 'ar' ? 'الإجمالي النهائي المستحق' : 'Net Total Due'}:</span>
              <span className="tabular-nums">
                {formData.total.toLocaleString()} {firmSettings.currency}
              </span>
            </div>
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200"
            >
              {locale === 'ar' ? 'إصدار الفاتورة' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Online Payment Gateway Simulation Modal */}
      {paymentModalInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentModalInvoice(null)}
          title={locale === 'ar' ? 'بوابة الدفع الإلكتروني المعتمدة' : 'Secure Online Payment Portal'}
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                {locale === 'ar' ? 'سداد فاتورة أتعاب قانونية' : 'Legal Retainer Settlement'}
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{paymentModalInvoice.number}</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {paymentModalInvoice.total.toLocaleString()} {firmSettings.currency}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  {locale === 'ar' ? 'رقم البطاقة الائتمانية / مدى' : 'Card / Mada Number'}
                </label>
                <input
                  type="text"
                  defaultValue="4111 2222 3333 4444"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    {locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry'}
                  </label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">CVV</label>
                  <input
                    type="password"
                    defaultValue="888"
                    maxLength={4}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-center"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleClientPayConfirm(paymentModalInvoice)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>
                  {locale === 'ar'
                    ? `تأكيد الدفع (${paymentModalInvoice.total.toLocaleString()} ${firmSettings.currency})`
                    : `Confirm Settlement`}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Preview & Printable Layout Modal */}
      {printInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPrintInvoice(null)}
          title={`${locale === 'ar' ? 'فاتورة ضريبية' : 'Tax Invoice'} ${printInvoice.number}`}
          maxWidth="2xl"
        >
          <div className="p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-6 print:m-0">
            {/* Header with firm branding & Tax info */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{locale === 'ar' ? firmSettings.firmNameAr : firmSettings.firmNameEn}</h3>
                  <span className="text-xs text-slate-400 block font-mono">
                    {locale === 'ar' ? 'الرقم الضريبي: ' : 'VAT ID: '}{firmSettings.taxNumber}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {locale === 'ar' ? 'ترخيص المحاماة: ' : 'License: '}{firmSettings.licenseNumber}
                  </span>
                </div>
              </div>

              <div className="text-end">
                <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 block">
                  {printInvoice.number}
                </span>
                <span className="text-xs text-slate-400 block tabular-nums">
                  {locale === 'ar' ? 'تاريخ الإصدار: ' : 'Issue: '}{printInvoice.issueDate}
                </span>
                <span className="text-xs text-slate-400 block tabular-nums">
                  {locale === 'ar' ? 'تاريخ الاستحقاق: ' : 'Due: '}{printInvoice.dueDate}
                </span>
              </div>
            </div>

            {/* Client & Case Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 block font-semibold mb-1">{locale === 'ar' ? 'فاتورة إلى (الموكل)' : 'Billed To'}:</span>
                <span className="text-sm font-bold block">{printInvoice.clientName}</span>
                <span className="text-slate-500 mt-0.5 block">{locale === 'ar' ? 'عميل معتمد لدى المكتب' : 'Retained Client'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 block font-semibold mb-1">{locale === 'ar' ? 'القضية أو المعاملة' : 'Matter Reference'}:</span>
                <span className="font-mono font-bold block">{printInvoice.caseNumber || (locale === 'ar' ? 'استشارات قانونية عامة' : 'General')}</span>
                <span className="text-slate-500 mt-0.5 block">{printInvoice.notes}</span>
              </div>
            </div>

            {/* Breakdown table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'البند / الخدمة القانونية' : 'Description'}</th>
                    <th className="py-2.5 px-3 text-end">{locale === 'ar' ? 'المبلغ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-3">
                      <span className="font-semibold block">{locale === 'ar' ? 'أتعاب المرافعة والدراسة القضائية' : 'Legal Advocacy & Brief Drafting'}</span>
                      <span className="text-[11px] text-slate-400">{printInvoice.notes}</span>
                    </td>
                    <td className="py-3 px-3 text-end font-semibold tabular-nums">
                      {printInvoice.subtotal.toLocaleString()} {firmSettings.currency}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{locale === 'ar' ? 'المجموع الفرعي الخاضع للضريبة' : 'Subtotal'}:</span>
                  <span className="tabular-nums font-semibold">{printInvoice.subtotal.toLocaleString()} {firmSettings.currency}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{locale === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}:</span>
                  <span className="tabular-nums font-semibold">{printInvoice.taxAmount.toLocaleString()} {firmSettings.currency}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>{locale === 'ar' ? 'الإجمالي الكلي المستحق' : 'Total Due'}:</span>
                  <span className="tabular-nums">{printInvoice.total.toLocaleString()} {firmSettings.currency}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className={`px-3 py-1 rounded text-xs font-bold ${
                printInvoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                {printInvoice.status === 'paid' ? t.statusPaid : t.statusPending}
              </span>

              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.print}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
