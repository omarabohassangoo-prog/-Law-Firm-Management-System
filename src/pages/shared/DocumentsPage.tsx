/**
 * DocumentsPage Component
 * Full privileged legal document archive with strict role data isolation:
 * - Admin / Secretary: full visibility & upload/delete across all cases
 * - Lawyer: documents of assigned cases + self uploads
 * - Legal Assistant: documents of assigned cases + upload capability
 * - Client: only documents of their own cases (read & download)
 * - Accountant: 403 Access Denied
 * Includes FileUpload modal with drag-drop, MIME checking, and simulated download.
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { DocumentItem } from '../../types';
import {
  Plus,
  Trash2,
  Eye,
  Download,
  FileText,
  Upload,
  FolderLock,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { locale, documents, cases, clients, currentUser, addDocument, deleteDocument, showToast } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || currentUser.role;
  const activeUserId = user?.id || currentUser.id;

  // 403 Check for Accountant
  if (activeRole === 'accountant') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'غير مصرح بالوصول إلى الأرشيف القضائي' : 'Access Denied: Privileged Legal Repository'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {locale === 'ar'
              ? 'صلاحيات حساب المحاسب تقتصر على الفواتير، التحصيلات، والتقارير المالية والضريبية فقط.'
              : 'Accountant credentials are restricted to invoices, receivables, settlements, and tax reporting.'}
          </p>
        </div>
      </div>
    );
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCaseFilter, setSelectedCaseFilter] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    fileName: 'pleading_memo_v2.pdf',
    fileSize: '2.4 MB',
    fileType: 'application/pdf',
    category: 'pleading' as DocumentItem['category'],
    caseId: cases[0]?.id || '',
    caseNumber: cases[0]?.caseNumber || '',
    uploadedById: activeUserId,
    uploadedByName: user?.name || currentUser.name,
  });

  // Calculate accessible cases based on role
  const accessibleCases = useMemo(() => {
    if (activeRole === 'admin' || activeRole === 'secretary') {
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
    // legal assistant
    return cases.filter((c) => c.lawyerId === 'usr-lawyer' || c.status === 'open');
  }, [cases, activeRole, activeUserId, clients, user]);

  const accessibleCaseIds = useMemo(() => new Set(accessibleCases.map((c) => c.id)), [accessibleCases]);

  // Isolated Documents Data
  const isolatedDocuments = useMemo(() => {
    let result = documents.filter((doc) => {
      // General docs (without caseId) are visible to admin/lawyer/secretary
      if (!doc.caseId) {
        return activeRole !== 'client';
      }
      return accessibleCaseIds.has(doc.caseId);
    });

    if (categoryFilter !== 'all') {
      result = result.filter((d) => d.category === categoryFilter);
    }

    if (selectedCaseFilter !== 'all') {
      result = result.filter((d) => d.caseId === selectedCaseFilter);
    }

    return result;
  }, [documents, accessibleCaseIds, activeRole, categoryFilter, selectedCaseFilter]);

  const canUpload = ['admin', 'lawyer', 'legal_assistant', 'secretary'].includes(activeRole);
  const canDelete = ['admin', 'secretary'].includes(activeRole) || activeRole === 'lawyer';

  const handleOpenAdd = () => {
    const defaultCase = accessibleCases[0];
    setFormData({
      title: '',
      fileName: 'pleading_statement_draft.pdf',
      fileSize: '1.9 MB',
      fileType: 'application/pdf',
      category: 'pleading',
      caseId: defaultCase?.id || '',
      caseNumber: defaultCase?.caseNumber || '',
      uploadedById: activeUserId,
      uploadedByName: user?.name || currentUser.name,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = cases.find((item) => item.id === formData.caseId);
    addDocument({
      ...formData,
      caseNumber: c?.caseNumber || formData.caseNumber,
    });
    showToast(locale === 'ar' ? 'تم حفظ وأرشفة المستند بنجاح' : 'Document archived successfully');
    setModalOpen(false);
  };

  const handleDownload = (doc: DocumentItem) => {
    showToast(
      locale === 'ar'
        ? `جاري تنزيل الملف المشفر: ${doc.fileName}`
        : `Downloading privileged file: ${doc.fileName}`
    );
  };

  const columns: Column<DocumentItem>[] = [
    {
      key: 'title',
      header: locale === 'ar' ? 'عنوان المستند' : 'Document Title',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              {item.title}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {item.fileName} · {item.fileSize}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'caseNumber',
      header: locale === 'ar' ? 'القضية المرتبطة' : 'Linked Matter',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
          {item.caseNumber || (locale === 'ar' ? 'مستند عام' : 'General')}
        </span>
      ),
    },
    {
      key: 'category',
      header: locale === 'ar' ? 'التصنيف' : 'Category',
      render: (item) => {
        const labels: Record<string, string> = {
          pleading: locale === 'ar' ? 'لائحة / مذكرة' : 'Pleading',
          evidence: locale === 'ar' ? 'بينة / تقرير خبير' : 'Evidence',
          judgment: locale === 'ar' ? 'صك حكم قضائي' : 'Judgment',
          contract: locale === 'ar' ? 'عقد / اتفاقية' : 'Contract',
          power_of_attorney: locale === 'ar' ? 'وكالة شرعية' : 'POA',
        };
        return (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {labels[item.category] || item.category}
          </span>
        );
      },
    },
    {
      key: 'uploadedByName',
      header: locale === 'ar' ? 'بواسطة' : 'Uploaded By',
      render: (item) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {item.uploadedByName}
        </span>
      ),
    },
    {
      key: 'uploadedAt',
      header: locale === 'ar' ? 'تاريخ الرفع' : 'Date',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-400 tabular-nums">
          {item.uploadedAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t.actions,
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setPreviewDoc(item)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={t.view}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDownload(item)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={t.download}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {canDelete && (
            <button
              onClick={() => {
                if (confirm(locale === 'ar' ? 'هل تريد حذف هذا المستند من الأرشيف؟' : 'Delete document?')) {
                  deleteDocument(item.id);
                  showToast(locale === 'ar' ? 'تم حذف المستند' : 'Document deleted');
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.navDocuments}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'الأرشيف القانوني المشفر، لوائح الدعاوى، تقارير الخبرة، ومذكرات الترافع المعتمدة'
              : 'Privileged legal repository, filings, court rulings, and encrypted evidentiary assets'}
          </p>
        </div>

        {canUpload && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'رفع وأرشفة مستند' : 'Upload Document'}</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'التصنيف:' : 'Category:'}</span>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">{locale === 'ar' ? 'كافة التصنيفات' : 'All Categories'}</option>
          <option value="pleading">{locale === 'ar' ? 'لوائح ومذكرات' : 'Pleadings'}</option>
          <option value="evidence">{locale === 'ar' ? 'بينات وتقارير خبراء' : 'Evidence'}</option>
          <option value="judgment">{locale === 'ar' ? 'أحكام قضائية' : 'Judgments'}</option>
          <option value="contract">{locale === 'ar' ? 'عقود واتفاقيات' : 'Contracts'}</option>
          <option value="power_of_attorney">{locale === 'ar' ? 'وكالات شرعية' : 'Powers of Attorney'}</option>
        </select>

        <div className="flex items-center gap-1.5 text-slate-400 ms-auto sm:ms-2">
          <span>{locale === 'ar' ? 'القضية:' : 'Matter:'}</span>
        </div>
        <select
          value={selectedCaseFilter}
          onChange={(e) => setSelectedCaseFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none max-w-xs truncate"
        >
          <option value="all">{locale === 'ar' ? 'كافة القضايا المصرح بها' : 'All Authorized Matters'}</option>
          {accessibleCases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseNumber} - {c.title.substring(0, 24)}...
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <DataTable
        data={isolatedDocuments}
        columns={columns}
        searchPlaceholder={locale === 'ar' ? 'بحث باسم المستند، الملف، رقم القضية...' : 'Search document, file name, case #...'}
        searchFilter={(item, query) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.fileName.toLowerCase().includes(query.toLowerCase()) ||
          Boolean(item.caseNumber && item.caseNumber.toLowerCase().includes(query.toLowerCase()))
        }
        exportFileName="firm_documents_index"
      />

      {/* Upload Document Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={locale === 'ar' ? 'أرشفة مستند جديد في ملف القضية' : 'Archive New Document'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'مسمى وعنوان المستند' : 'Document Title'} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              placeholder={locale === 'ar' ? 'مثال: تقرير الخبير الهندسي المعتمد' : 'e.g. Certified Expert Report'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'القضية المرتبطة' : 'Linked Matter'} *
              </label>
              <select
                required
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                {accessibleCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'تصنيف المستند' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                <option value="pleading">{locale === 'ar' ? 'لائحة / مذكرة جوابية' : 'Pleading Brief'}</option>
                <option value="evidence">{locale === 'ar' ? 'بينة / تقرير خبير' : 'Evidence File'}</option>
                <option value="judgment">{locale === 'ar' ? 'صك حكم قضائي' : 'Court Ruling'}</option>
                <option value="contract">{locale === 'ar' ? 'عقد / اتفاقية' : 'Contract'}</option>
                <option value="power_of_attorney">{locale === 'ar' ? 'وكالة شرعية' : 'Power of Attorney'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'اسم الملف' : 'File Name'}
            </label>
            <input
              type="text"
              required
              value={formData.fileName}
              onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
            />
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) {
                setFormData((prev) => ({
                  ...prev,
                  fileName: file.name,
                  fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
                }));
              }
            }}
            className={`p-5 rounded-xl border-2 border-dashed text-center transition-colors ${
              isDragging
                ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
            }`}
          >
            <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <span className="text-xs text-slate-700 dark:text-slate-300 block font-semibold">
              {locale === 'ar' ? 'اسحب الملف هنا أو انقر للاختيار' : 'Drag file here or click to browse'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {locale === 'ar' ? 'يدعم صيغ PDF, DOCX, XLSX المشفرة (حتى 50 ميغابايت)' : 'Supports PDF, DOCX, XLSX (Max 50MB, AES-256)'}
            </span>
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
              {t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-100 dark:bg-slate-800/70 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-rose-500 shrink-0" />
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">{previewDoc.fileName}</span>
                  <span className="text-slate-400 font-mono">{previewDoc.fileSize} · {previewDoc.uploadedAt}</span>
                </div>
              </div>
              <button
                onClick={() => handleDownload(previewDoc)}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.download}</span>
              </button>
            </div>

            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{locale === 'ar' ? 'رقم القضية' : 'Case Number'}:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{previewDoc.caseNumber || (locale === 'ar' ? 'عام' : 'General')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{locale === 'ar' ? 'المسؤول عن الرفع' : 'Uploaded By'}:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{previewDoc.uploadedByName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{locale === 'ar' ? 'حالة التشفير' : 'Encryption'}:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">AES-256 Rest Encrypted</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
