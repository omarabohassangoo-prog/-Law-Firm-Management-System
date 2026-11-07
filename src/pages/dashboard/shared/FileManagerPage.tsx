import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/auth.store';
import {
  Folder,
  FileText,
  Upload,
  Download,
  Trash2,
  Share2,
  HardDrive,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  Lock,
  Eye,
  Plus,
} from 'lucide-react';

export const FileManagerPage: React.FC = () => {
  const { locale, documents, showToast } = useAppStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState<any | null>(null);

  // Storage Quota calculation (mocked for user)
  const totalQuotaBytes = 2 * 1024 * 1024 * 1024; // 2 GB
  const usedBytes = 345 * 1024 * 1024; // 345 MB
  const usedPercent = Math.round((usedBytes / totalQuotaBytes) * 100);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUploadModal(false);
    showToast(locale === 'ar' ? '✅ تم رفع وفحص الملف بنجاح (ClamAV Clean + Quota Updated)' : '✅ File uploaded & scanned successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              {locale === 'ar' ? 'إدارة التخزين والملفات الآمنة' : 'Secure Storage & File Management'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {locale === 'ar' ? 'مستودع الملفات والتخزين السحابي' : 'Cloud Storage & File Repository'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ar'
              ? 'إدارة الملفات، الفحص الأمني ضد الفيروسات، وحصص التخزين مع روابط المشاركة الآمنة.'
              : 'File repository with virus scanning, storage quotas, and secure signed sharing links.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>{locale === 'ar' ? 'رفع ملف جديد' : 'Upload New File'}</span>
          </button>
        </div>
      </div>

      {/* Storage Quota Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {locale === 'ar' ? 'حصة التخزين السحابي' : 'Cloud Storage Quota'}
              </h3>
              <p className="text-xs text-slate-500">مستخدم 345 MB من إجمالي 2.0 GB (سعة الحساب)</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {usedPercent}% مستخدم
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${usedPercent}%` }} />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={locale === 'ar' ? 'البحث عن ملف...' : 'Search files...'}
            className="w-full ps-10 pe-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
          >
            <option value="all">جميع الأقسام</option>
            <option value="pleading">مذكرات ودعاوى</option>
            <option value="contract">عقود واتفاقيات</option>
            <option value="evidence">أدلة ومستندات</option>
            <option value="court_ruling">أحكام قضائية</option>
          </select>
        </div>
      </div>

      {/* Files List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 text-start">اسم الملف</th>
                <th className="py-3 px-4 text-start">النوع / القسم</th>
                <th className="py-3 px-4 text-start">الحجم</th>
                <th className="py-3 px-4 text-start">بواسطة</th>
                <th className="py-3 px-4 text-start">الفحص الأمني</th>
                <th className="py-3 px-4 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p>{doc.title}</p>
                      <span className="text-[10px] text-slate-400 font-normal">{doc.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{doc.fileSize}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{doc.uploadedByName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ClamAV Clean</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => showToast(locale === 'ar' ? '📥 ججارٍ تحميل الملف الآمن' : '📥 Downloading secure file', 'success')}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        title="تحميل"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedFileForShare(doc)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        title="مشاركة رابط آمن"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">رفع ملف جديد مع فحص الأمان</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSimulatedUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-2 hover:border-amber-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/30">
                <Upload className="w-8 h-8 mx-auto text-amber-500" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">اسحب الملفات هنا أو اضغط للاختيار</p>
                <p className="text-[10px] text-slate-400">PDF, DOCX, XLSX, JPG, PNG (حد أقصى 20 MB · ممنوع ملفات التنفيذ .exe)</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  تنبيه أمني: يتم فحص الملفات تلقائياً عبر ClamAV وتجريد البيانات الوصفية (EXIF) ومنع الملفات التنفيذية نهائياً.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs"
                >
                  بدء الرفع والفحص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {selectedFileForShare && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">رابط مشاركة آمن ومؤقت</h3>
            <p className="text-xs text-slate-500">تم توليد رابط موقع فريد مع توقيع مشفر (Signed URL) ينتهي خلال 24 ساعة.</p>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all">
              https://aladalah-law.com/s/shr_token_8a9f2bc47103e?expires=86400
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  showToast(locale === 'ar' ? '📋 تم نسخ الرابط إلى الحافظة' : '📋 Link copied to clipboard', 'success');
                  setSelectedFileForShare(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl"
              >
                نسخ الرابط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
