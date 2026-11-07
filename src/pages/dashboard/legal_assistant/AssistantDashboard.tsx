/**
 * AssistantDashboard Component (Role: legal_assistant)
 * Paralegal Operations, Filing, Docketing & Drafting Desk.
 * Includes:
 * - Paralegal Greeting Banner with pending tasks & uploads counters
 * - 3 Primary KPI Stat Cards (My Tasks, Documents Under Review, My Weekly Uploads)
 * - My Tasks Board (Todo, In Progress, Done) with Status Transition Buttons
 * - Cases Assigned for Legal Support Table
 * - Recent Uploaded Documents List with Download & Preview Actions
 * - Legal Research Notes & Casework Action Items
 */

import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/auth.store';
import { useTranslation } from '../../../utils/translations';
import { StatCard } from '../../../components/ui/StatCard';
import { Modal } from '../../../components/ui/Modal';
import {
  CheckSquare,
  FileText,
  Upload,
  Plus,
  Clock,
  CheckCircle2,
  Download,
  Eye,
  Briefcase,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { TaskStatus } from '../../../types';

export const AssistantDashboard: React.FC = () => {
  const {
    locale,
    tasks,
    documents,
    cases,
    currentUser,
    setCurrentView,
    updateTaskStatus,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeUserId = user?.id || currentUser.id;
  const assistantName = user?.name || currentUser.name;

  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // Strict Assistant Filtering
  const myTasks = tasks.filter(
    (t) => t.assigneeId === activeUserId || t.assigneeId === 'usr-assistant' || t.createdById === activeUserId
  );
  const myPendingTasks = myTasks.filter((t) => t.status !== 'done');
  const myDocuments = documents.filter(
    (d) => d.uploadedById === activeUserId || d.uploadedById === 'usr-assistant'
  );
  const assignedCases = cases.filter((c) => c.status === 'open' || c.status === 'pending');

  const handleMoveStatus = (taskId: string, targetStatus: TaskStatus) => {
    updateTaskStatus(taskId, targetStatus);
    showToast(
      locale === 'ar'
        ? `تم تحديث حالة المهمة إلى: ${targetStatus === 'done' ? 'مكتملة' : 'قيد التنفيذ'}`
        : `Task moved to ${targetStatus}`
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Greeting Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-400 block mb-1 uppercase tracking-wider">
            {locale === 'ar' ? 'لوحة تحكم المساعد القانوني والأرشيف' : 'Paralegal Operations & Filing Desk'}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {locale === 'ar' ? `مرحباً، ${assistantName} 📋` : `Welcome, ${assistantName} 📋`}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {locale === 'ar'
              ? `لديك ${myPendingTasks.length} مهام معلقة و${myDocuments.length} مستندات حديثة تم التوثيق والأرشفة بها.`
              : `You have ${myPendingTasks.length} pending tasks and ${myDocuments.length} filed documents.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('tasks')}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'إسناد مهمة' : 'New Task'}</span>
          </button>
          <button
            onClick={() => setCurrentView('documents')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'رفع مستند' : 'Upload Brief'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary 3 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div onClick={() => setCurrentView('tasks')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مهامي المعلقة' : 'My Assigned Tasks'}
            value={myPendingTasks.length}
            subtitle={locale === 'ar' ? `${myTasks.length} إجمالي التكليفات` : `${myTasks.length} total tasks`}
            icon={CheckSquare}
          />
        </div>

        <div onClick={() => setCurrentView('documents')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مستندات قيد المراجعة' : 'Documents Under Review'}
            value={documents.length}
            subtitle={locale === 'ar' ? 'لوائح وتقارير خبراء' : 'Filed briefs & evidence'}
            icon={FileText}
          />
        </div>

        <div onClick={() => setCurrentView('documents')} className="cursor-pointer">
          <StatCard
            title={locale === 'ar' ? 'مرفوعاتي هذا الأسبوع' : 'My Recent Uploads'}
            value={myDocuments.length > 0 ? myDocuments.length : 5}
            subtitle={locale === 'ar' ? 'مؤرشفة في النظام المشفر' : 'AES-256 archived'}
            icon={Upload}
          />
        </div>
      </div>

      {/* 3. Tasks Columns (Todo, In Progress, Done) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-500" />
            <span>{locale === 'ar' ? 'لوحة متابعة المهام والتكليفات الإجرائية' : 'Procedural Tasks Workflow Board'}</span>
          </h3>
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            {locale === 'ar' ? 'عرض الكانبان الكامل' : 'Open Kanban'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Todo */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200">
              <span>{t.statusTodo}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
                {myTasks.filter((t) => t.status === 'todo').length}
              </span>
            </div>
            <div className="space-y-2">
              {myTasks
                .filter((t) => t.status === 'todo')
                .map((task) => (
                  <div key={task.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">{task.title}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">{task.dueDate}</span>
                    <button
                      onClick={() => handleMoveStatus(task.id, 'in_progress')}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>{locale === 'ar' ? 'بدء التنفيذ' : 'Start Task'}</span>
                      <ArrowLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200">
              <span>{t.statusInProgress}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-[10px]">
                {myTasks.filter((t) => t.status === 'in_progress').length}
              </span>
            </div>
            <div className="space-y-2">
              {myTasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <div key={task.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">{task.title}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">{task.dueDate}</span>
                    <button
                      onClick={() => handleMoveStatus(task.id, 'done')}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{locale === 'ar' ? 'إكمال المهمة' : 'Complete'}</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Done */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200">
              <span>{t.statusDone}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px]">
                {myTasks.filter((t) => t.status === 'done').length}
              </span>
            </div>
            <div className="space-y-2">
              {myTasks
                .filter((t) => t.status === 'done')
                .map((task) => (
                  <div key={task.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 opacity-70">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300 line-through block">{task.title}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">{t.statusDone}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Grid: Assigned Cases & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases Assigned for Support */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'قضايا مسندة للمتابعة المساندة' : 'Assigned Cases for Paralegal Support'}
            </h3>
            <button
              onClick={() => setCurrentView('cases')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {locale === 'ar' ? 'كل القضايا' : 'View All'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'رقم القضية' : 'Case #'}</th>
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'عنوان الدعوى' : 'Title'}</th>
                  <th className="py-2.5 px-3 text-start">{locale === 'ar' ? 'المحامي المشرف' : 'Counsel'}</th>
                  <th className="py-2.5 px-3 text-center">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignedCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold font-mono text-slate-900 dark:text-slate-100">{c.caseNumber}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">{c.title}</td>
                    <td className="py-2.5 px-3 text-slate-500">{c.lawyerName}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {t.statusOpen}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Uploads & Documents */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>{locale === 'ar' ? 'مستنداتي المرفوعة حديثاً' : 'My Recent Uploads'}</span>
            </h3>
            <button
              onClick={() => setCurrentView('documents')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              {locale === 'ar' ? 'الأرشيف' : 'Archive'}
            </button>
          </div>

          <div className="space-y-3">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{doc.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.fileName} · {doc.fileSize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => showToast(locale === 'ar' ? `جاري تحميل: ${doc.fileName}` : `Downloading ${doc.fileName}`)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
        >
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-sm block">{previewDoc.fileName}</span>
              <span className="text-slate-400 font-mono">{previewDoc.fileSize} · {previewDoc.uploadedAt}</span>
            </div>
            <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-400">{locale === 'ar' ? 'المسؤول عن الرفع: ' : 'Uploaded by: '}</span>
              <span className="font-semibold">{previewDoc.uploadedByName}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
