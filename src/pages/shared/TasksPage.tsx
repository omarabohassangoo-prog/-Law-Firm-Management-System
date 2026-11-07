/**
 * TasksPage Component
 * Casework and litigation deliverable management.
 * Features:
 * - Dual Views: List View and Interactive Kanban Board
 * - 3 Workflow Columns: Todo (بانتظار البدء), In Progress (قيد التنفيذ), Done (مكتملة)
 * - Quick column transition buttons and state synchronization
 * - Strict Role Isolation:
 *   - Client: 403 Access Denied
 *   - Staff: view assigned or created tasks, update status
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { TaskItem, TaskPriority, TaskStatus } from '../../types';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertCircle,
  Trash2,
  CheckCircle2,
  List,
  Kanban,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const {
    locale,
    tasks,
    cases,
    users,
    currentUser,
    addTask,
    updateTaskStatus,
    deleteTask,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || currentUser.role;
  const activeUserId = user?.id || currentUser.id;

  // 403 Check for Client
  if (activeRole === 'client') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'غير مصرح بالوصول إلى إدارة المهام الداخلية' : 'Access Denied: Internal Casework'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {locale === 'ar'
              ? 'سجل التكليفات القضائية والمهام مخصص فقط لفريق العمل القانوني والمحامين.'
              : 'Casework tasks and draft assignments are restricted to internal legal staff and counsel.'}
          </p>
        </div>
      </div>
    );
  }

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseId: cases[0]?.id || '',
    caseNumber: cases[0]?.caseNumber || '',
    assigneeId: users[0]?.id || '',
    assigneeName: users[0]?.name || '',
    createdById: activeUserId,
    createdByName: user?.name || currentUser.name,
    priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Calculate isolated tasks based on role
  const isolatedTasks = useMemo(() => {
    if (activeRole === 'admin') {
      return tasks;
    }
    // Lawyer, Assistant, Accountant, Secretary see assigned tasks or created tasks
    return tasks.filter(
      (task) =>
        task.assigneeId === activeUserId ||
        task.createdById === activeUserId ||
        task.assigneeName === (user?.name || currentUser.name)
    );
  }, [tasks, activeRole, activeUserId, user, currentUser]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      caseId: cases[0]?.id || '',
      caseNumber: cases[0]?.caseNumber || '',
      assigneeId: users[0]?.id || '',
      assigneeName: users[0]?.name || '',
      createdById: activeUserId,
      createdByName: user?.name || currentUser.name,
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = users.find((u) => u.id === formData.assigneeId);
    const cs = cases.find((c) => c.id === formData.caseId);

    addTask({
      ...formData,
      assigneeName: assignee?.name || formData.assigneeName,
      caseNumber: cs?.caseNumber || formData.caseNumber,
    });
    showToast(locale === 'ar' ? 'تم إنشاء التكليف وإسناد المهمة بنجاح' : 'Task assigned successfully');
    setModalOpen(false);
  };

  // Status transitions
  const handleMoveStatus = (taskId: string, targetStatus: TaskStatus) => {
    updateTaskStatus(taskId, targetStatus);
    showToast(
      locale === 'ar'
        ? `تم تحديث حالة المهمة إلى: ${
            targetStatus === 'done' ? 'مكتملة' : targetStatus === 'in_progress' ? 'قيد التنفيذ' : 'بانتظار البدء'
          }`
        : `Task updated to ${targetStatus}`
    );
  };

  const columns: Column<TaskItem>[] = [
    {
      key: 'title',
      header: locale === 'ar' ? 'المهمة والتكليف' : 'Task & Description',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {item.title}
          </span>
          {item.description && (
            <span className="text-[11px] text-slate-400 line-clamp-1">
              {item.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'caseNumber',
      header: locale === 'ar' ? 'القضية' : 'Matter #',
      render: (item) => (
        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
          {item.caseNumber || (locale === 'ar' ? 'إداري عام' : 'General')}
        </span>
      ),
    },
    {
      key: 'assigneeName',
      header: locale === 'ar' ? 'المكلف بالتنفيذ' : 'Assignee',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {item.assigneeName}
        </span>
      ),
    },
    {
      key: 'priority',
      header: locale === 'ar' ? 'الأولوية' : 'Priority',
      align: 'center',
      render: (item) => {
        let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        if (item.priority === 'high') style = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
        if (item.priority === 'medium') style = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';

        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${style}`}>
            {item.priority === 'high' ? t.priorityHigh : item.priority === 'medium' ? t.priorityMedium : t.priorityLow}
          </span>
        );
      },
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
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
          item.status === 'done' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
          item.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }`}>
          {item.status === 'done' ? t.statusDone : item.status === 'in_progress' ? t.statusInProgress : t.statusTodo}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t.actions,
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.status !== 'done' ? (
            <button
              onClick={() => handleMoveStatus(item.id, 'done')}
              className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title={locale === 'ar' ? 'إكمال المهمة' : 'Mark Done'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleMoveStatus(item.id, 'todo')}
              className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              title={locale === 'ar' ? 'إعادة فتح' : 'Reopen'}
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(locale === 'ar' ? 'هل تريد حذف هذه المهمة؟' : 'Delete task?')) {
                deleteTask(item.id);
                showToast(locale === 'ar' ? 'تم حذف المهمة' : 'Task deleted');
              }
            }}
            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title={t.delete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
            {t.navTasks}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'متابعة المهام القانونية، إعداد اللوائح والمذكرات، ولوحة كانبان لمراحل الإنجاز'
              : 'Managing casework deliverables, draft deadlines, and Kanban work queues'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'كانبان' : 'Kanban'}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'جدول' : 'List'}</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'إسناد مهمة جديدة' : 'Assign New Task'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'list' ? (
        <DataTable
          data={isolatedTasks}
          columns={columns}
          searchPlaceholder={locale === 'ar' ? 'بحث بالمهمة، المكلف، القضية...' : 'Search task, assignee, case...'}
          searchFilter={(item, query) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.assigneeName.toLowerCase().includes(query.toLowerCase()) ||
            Boolean(item.caseNumber && item.caseNumber.toLowerCase().includes(query.toLowerCase()))
          }
          exportFileName="firm_tasks_log"
        />
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Todo */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t.statusTodo}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                {isolatedTasks.filter((t) => t.status === 'todo').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
              {isolatedTasks
                .filter((t) => t.status === 'todo')
                .map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl space-y-2.5 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {task.title}
                      </h4>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {task.priority === 'high' ? t.priorityHigh : t.priorityMedium}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <UserIcon className="w-3 h-3" />
                        <span>{task.assigneeName}</span>
                      </span>
                      <span className="font-mono tabular-nums">{task.dueDate}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
                      <button
                        onClick={() => handleMoveStatus(task.id, 'in_progress')}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>{locale === 'ar' ? 'بدء التنفيذ' : 'Start'}</span>
                        <ArrowLeft className="w-3 h-3 rtl:rotate-0 ltr:rotate-180" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t.statusInProgress}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 rounded-full text-blue-600 dark:text-blue-400">
                {isolatedTasks.filter((t) => t.status === 'in_progress').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
              {isolatedTasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl space-y-2.5 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {task.title}
                      </h4>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          task.priority === 'high'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {task.priority === 'high' ? t.priorityHigh : t.priorityMedium}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <UserIcon className="w-3 h-3" />
                        <span>{task.assigneeName}</span>
                      </span>
                      <span className="font-mono tabular-nums">{task.dueDate}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                      <button
                        onClick={() => handleMoveStatus(task.id, 'todo')}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        {locale === 'ar' ? 'إعادة' : 'Back'}
                      </button>
                      <button
                        onClick={() => handleMoveStatus(task.id, 'done')}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{locale === 'ar' ? 'إكمال' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: Done */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t.statusDone}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-full text-emerald-600 dark:text-emerald-400">
                {isolatedTasks.filter((t) => t.status === 'done').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
              {isolatedTasks
                .filter((t) => t.status === 'done')
                .map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/40 rounded-xl space-y-2 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 line-through">
                        {task.title}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{task.assigneeName}</span>
                      <button
                        onClick={() => handleMoveStatus(task.id, 'in_progress')}
                        className="text-[11px] text-slate-400 hover:text-amber-600 underline"
                      >
                        {locale === 'ar' ? 'إعادة فتح' : 'Reopen'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={locale === 'ar' ? 'إسناد وتكليف مهمة جديدة' : 'Assign New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'عنوان المهمة' : 'Task Title'} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              placeholder={locale === 'ar' ? 'مثال: صياغة المذكرة الجوابية وإيداعها في ناجز' : 'e.g. Draft responsive brief and file on Najiz'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'المكلف بالتنفيذ' : 'Assignee'} *
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'الأولوية' : 'Priority'}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                <option value="low">{t.priorityLow}</option>
                <option value="medium">{t.priorityMedium}</option>
                <option value="high">{t.priorityHigh}</option>
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
                <option value="">{locale === 'ar' ? 'بدون قضية (إداري عام)' : 'General'}</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.caseNumber} - {c.title.substring(0, 25)}...</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'تاريخ التسليم الأقصى' : 'Due Date'} *
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'تعليمات وتفاصيل التكليف' : 'Instructions & Details'}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
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
    </div>
  );
};
