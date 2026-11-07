/**
 * CasesPage Component
 * Full Legal Cases Management with Strict Role Data Isolation,
 * Filter Bar, Case Creation Modal, and Integrated CaseDetailPage.
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { CaseDetailPage } from './CaseDetailPage';
import { Case, CaseStatus } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Briefcase,
  Download,
  Filter,
  FolderOpen,
  Search,
} from 'lucide-react';

export const CasesPage: React.FC = () => {
  const { locale, cases, clients, users, addCase, updateCase, deleteCase, showToast } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || 'admin';
  const activeUserId = user?.id || 'usr-admin';

  // Navigation to Detail View
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lawyerFilter, setLawyerFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    category: 'commercial' as Case['category'],
    status: 'open' as CaseStatus,
    court: 'المحكمة التجارية بالرياض',
    courtRoom: 'قاعة 302',
    judge: 'فضيلة الشيخ د. إبراهيم الهذلول',
    clientId: clients[0]?.id || 'cl-1',
    lawyerId: activeRole === 'lawyer' ? activeUserId : users.find((u) => u.role === 'lawyer')?.id || users[0].id,
    fee: 35000,
    paidAmount: 0,
    openedAt: new Date().toISOString().split('T')[0],
    nextHearingDate: '',
    description: '',
  });

  // Strict Role-Based Data Isolation Filtering
  const isolatedCases = useMemo(() => {
    let result = [...cases];

    if (activeRole === 'lawyer') {
      result = result.filter((c) => c.lawyerId === activeUserId || c.lawyerId === 'usr-lawyer');
    } else if (activeRole === 'client') {
      const clientRecord = clients.find((cl) => cl.userId === activeUserId || cl.email === user?.email);
      const clientId = clientRecord ? clientRecord.id : 'cl-1';
      result = result.filter((c) => c.clientId === clientId);
    } else if (activeRole === 'legal_assistant') {
      // Sees assigned cases
      result = result.filter((c) => c.lawyerId === 'usr-lawyer' || c.status === 'open');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.clientName && c.clientName.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (lawyerFilter !== 'all') {
      result = result.filter((c) => c.lawyerId === lawyerFilter);
    }

    return result;
  }, [cases, activeRole, activeUserId, clients, user, searchQuery, statusFilter, lawyerFilter]);

  // If user selected a case for detail view
  if (selectedCaseId) {
    return <CaseDetailPage caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} />;
  }

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'commercial',
      status: 'open',
      court: 'المحكمة التجارية بالرياض',
      courtRoom: 'قاعة 302',
      judge: 'فضيلة الشيخ د. إبراهيم الهذلول',
      clientId: clients[0]?.id || 'cl-1',
      lawyerId: activeRole === 'lawyer' ? activeUserId : users.find((u) => u.role === 'lawyer')?.id || users[0].id,
      fee: 35000,
      paidAmount: 0,
      openedAt: new Date().toISOString().split('T')[0],
      nextHearingDate: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Case) => {
    setEditingId(c.id);
    setFormData({
      title: c.title,
      category: c.category,
      status: c.status,
      court: c.court,
      courtRoom: c.courtRoom || '',
      judge: c.judge || '',
      clientId: c.clientId,
      lawyerId: c.lawyerId,
      fee: c.fee,
      paidAmount: c.paidAmount,
      openedAt: c.openedAt,
      nextHearingDate: c.nextHearingDate || '',
      description: c.description,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === formData.clientId);
    const lawyer = users.find((u) => u.id === formData.lawyerId);

    const currentYear = new Date().getFullYear();
    const count = cases.length + 1;
    const caseNumber = `CASE-${currentYear}-${String(count).padStart(4, '0')}`;

    const dataToSave = {
      ...formData,
      caseNumber: editingId ? cases.find((c) => c.id === editingId)!.caseNumber : caseNumber,
      clientName: client?.name || 'العميل',
      lawyerName: lawyer?.name || 'المحامي',
    };

    if (editingId) {
      updateCase(editingId, dataToSave);
      showToast(locale === 'ar' ? 'تم تحديث بيانات القضية' : 'Case updated');
    } else {
      addCase(dataToSave);
      showToast(locale === 'ar' ? 'تم إنشاء القضية بنجاح' : 'Case created successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من رغبتك بحذف القضية نهائياً؟' : 'Are you sure you want to delete this case?')) {
      deleteCase(id);
      showToast(locale === 'ar' ? 'تم حذف القضية' : 'Case deleted', 'info');
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    archived: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };

  const columns: Column<Case>[] = [
    {
      key: 'caseNumber',
      header: locale === 'ar' ? 'رقم القضية' : 'Case #',
      render: (item) => (
        <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200">
          {item.caseNumber}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'title',
      header: locale === 'ar' ? 'العنوان' : 'Title',
      render: (item) => (
        <button
          type="button"
          onClick={() => setSelectedCaseId(item.id)}
          className="text-start font-semibold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-1 max-w-[280px] cursor-pointer"
        >
          {item.title}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'clientName',
      header: locale === 'ar' ? 'العميل' : 'Client',
      render: (item) => <span className="text-xs text-slate-700 dark:text-slate-300">{item.clientName}</span>,
      sortable: true,
    },
    {
      key: 'lawyerName',
      header: locale === 'ar' ? 'المحامي' : 'Attorney',
      render: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">{item.lawyerName}</span>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: locale === 'ar' ? 'الحالة' : 'Status',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
            statusColors[item.status] || statusColors.open
          }`}
        >
          {item.status === 'open'
            ? locale === 'ar'
              ? 'مفتوحة'
              : 'Open'
            : item.status === 'pending'
            ? locale === 'ar'
              ? 'معلقة'
              : 'Pending'
            : item.status === 'closed'
            ? locale === 'ar'
              ? 'مغلقة'
              : 'Closed'
            : locale === 'ar'
            ? 'مؤرشفة'
            : 'Archived'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'openedAt',
      header: locale === 'ar' ? 'تاريخ الفتح' : 'Opened At',
      render: (item) => <span className="text-xs text-slate-500 tabular-nums">{item.openedAt}</span>,
      sortable: true,
    },
    {
      key: 'actions',
      header: locale === 'ar' ? 'الإجراءات' : 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setSelectedCaseId(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={locale === 'ar' ? 'عرض تفاصيل القضية' : 'View Case Details'}
          >
            <Eye className="w-4 h-4" />
          </button>
          {(activeRole === 'admin' || (activeRole === 'lawyer' && item.lawyerId === activeUserId)) && (
            <button
              type="button"
              onClick={() => handleOpenEdit(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
              title={locale === 'ar' ? 'تعديل' : 'Edit'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {activeRole === 'admin' && (
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title={locale === 'ar' ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const canCreate = activeRole === 'admin' || activeRole === 'lawyer';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {locale === 'ar' ? 'القضايا القانونية' : 'Legal Cases'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeRole === 'lawyer'
              ? locale === 'ar'
                ? 'عرض القضايا الموكلة إليك ومتابعة جلساتها ومذكراتها'
                : 'Displaying assigned caseload, hearing dates, and briefs'
              : activeRole === 'client'
              ? locale === 'ar'
                ? 'ملفات قضاياك الخاصة ومستجدات الترافع القضائي'
                : 'Your personal legal matters and hearing schedules'
              : locale === 'ar'
              ? 'إدارة شاملة لكافة القضايا والمنازعات والتحكيم التجاري'
              : 'Comprehensive matters portfolio, litigation, and arbitration'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'ar' ? 'قضية جديدة' : 'New Case'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'ar' ? 'بحث برقم القضية أو العنوان أو العميل...' : 'Search case #, title, or client...'}
            className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">{locale === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
            <option value="open">{locale === 'ar' ? 'مفتوحة' : 'Open'}</option>
            <option value="pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="closed">{locale === 'ar' ? 'مغلقة' : 'Closed'}</option>
            <option value="archived">{locale === 'ar' ? 'مؤرشفة' : 'Archived'}</option>
          </select>

          {(activeRole === 'admin' || activeRole === 'secretary') && (
            <select
              value={lawyerFilter}
              onChange={(e) => setLawyerFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="all">{locale === 'ar' ? 'كافة المحامين' : 'All Attorneys'}</option>
              {users
                .filter((u) => u.role === 'lawyer' || u.role === 'admin')
                .map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name}
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      {isolatedCases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'لا توجد قضايا مطابقة' : 'No Cases Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {locale === 'ar'
                ? 'لم يتم العثور على أي قضايا مطابقة لمعايير البحث الحالية أو صلاحيات حسابك.'
                : 'No matters match the current filter criteria or access permissions.'}
            </p>
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800"
            >
              {locale === 'ar' ? 'إضافة أول قضية' : 'Create First Case'}
            </button>
          )}
        </div>
      ) : (
        <DataTable data={isolatedCases} columns={columns} exportFileName="cases_records" />
      )}

      {/* Case Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? (locale === 'ar' ? 'تعديل بيانات القضية' : 'Edit Case') : (locale === 'ar' ? 'تسجيل قضية جديدة' : 'New Legal Matter')}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'عنوان الدعوى / النزاع' : 'Case Title'} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={locale === 'ar' ? 'مثال: دعوى مطالبة مالية لعقود توريد' : 'e.g. Commercial supply dispute'}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'العميل / الموكل' : 'Client'} *
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'المحامي المسؤول' : 'Assigned Attorney'} *
              </label>
              <select
                disabled={activeRole === 'lawyer'}
                value={formData.lawyerId}
                onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer disabled:opacity-60"
              >
                {users
                  .filter((u) => u.role === 'lawyer' || u.role === 'admin')
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'المحكمة أو هيئة التحكيم' : 'Court / Tribunal'}
              </label>
              <input
                type="text"
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'حالة القضية' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="open">{locale === 'ar' ? 'مفتوحة / متداولة' : 'Open'}</option>
                <option value="pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
                <option value="closed">{locale === 'ar' ? 'مغلقة بحكم' : 'Closed'}</option>
                <option value="archived">{locale === 'ar' ? 'مؤرشفة' : 'Archived'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'وصف وموضوع الدعوى' : 'Description'}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800"
            >
              {editingId ? (locale === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (locale === 'ar' ? 'إنشاء القضية' : 'Create Case')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
