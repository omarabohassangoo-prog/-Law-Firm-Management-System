/**
 * UsersPage Component
 * Firm staff account management and RBAC privilege configuration.
 * Strictly enforced for 'admin' (Firm Manager) only.
 * Prevents deleting own active session account.
 */

import React, { useState } from 'react';
import { useAppStore, ROLES_CONFIG } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { User, UserRole } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Shield,
  ShieldAlert,
  KeyRound,
  CheckCircle,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { locale, users, addUser, updateUser, deleteUser, currentUser, showToast } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || currentUser.role;
  const activeUserId = user?.id || currentUser.id;

  // Strict Admin Guard
  if (activeRole !== 'admin') {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'غير مصرح بإدارة المستخدمين' : 'Access Denied: Administrative Area'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {locale === 'ar'
              ? 'صلاحيات إدارة حسابات منسوبي المكتب وتعيين الأدوار تقتصر على مدير المكتب التنفيذي فقط.'
              : 'Managing firm staff accounts, roles, and administrative security is restricted to Executive Management.'}
          </p>
        </div>
      </div>
    );
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'lawyer' as UserRole,
    status: 'active' as User['status'],
    emailVerified: true,
    twoFactorEnabled: false,
    password: 'Password123!',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '+966 50 ',
      role: 'lawyer',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
      password: 'Password123!',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (targetUser: User) => {
    setEditingId(targetUser.id);
    setFormData({
      name: targetUser.name,
      email: targetUser.email,
      phone: targetUser.phone,
      role: targetUser.role,
      status: targetUser.status,
      emailVerified: targetUser.emailVerified,
      twoFactorEnabled: targetUser.twoFactorEnabled,
      password: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateUser(editingId, formData);
      showToast(locale === 'ar' ? 'تم تحديث بيانات المستخدم بنجاح' : 'User updated successfully');
    } else {
      addUser(formData);
      showToast(locale === 'ar' ? 'تم إنشاء الحساب وإرسال بيانات الاعتماد' : 'User created successfully');
    }
    setModalOpen(false);
  };

  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.id === activeUserId || targetUser.id === currentUser.id) {
      showToast(
        locale === 'ar' ? 'إجراء غير مسموح: لا يمكن حذف الحساب النشط الحالي' : 'Cannot delete self account',
        'error'
      );
      return;
    }
    if (confirm(locale === 'ar' ? `هل أنت متأكد من حذف حساب (${targetUser.name}) نهائياً؟` : `Delete user account?`)) {
      deleteUser(targetUser.id);
      showToast(locale === 'ar' ? 'تم حذف المستخدم من النظام' : 'User removed');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: locale === 'ar' ? 'الاسم الكامل' : 'Full Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
            {item.avatar ? (
              <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              item.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                {item.name}
              </span>
              {item.id === activeUserId && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  ({locale === 'ar' ? 'حسابك' : 'You'})
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              {item.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: locale === 'ar' ? 'الدور والصلاحيات' : 'Role & Privileges',
      sortable: true,
      render: (item) => {
        const conf = ROLES_CONFIG.find((r) => r.key === item.role);
        return (
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {locale === 'ar' ? conf?.labelAr : conf?.labelEn}
          </span>
        );
      },
    },
    {
      key: 'phone',
      header: locale === 'ar' ? 'الجوال' : 'Phone',
      render: (item) => (
        <span dir="ltr" className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {item.phone}
        </span>
      ),
    },
    {
      key: 'twoFactorEnabled',
      header: '2FA',
      align: 'center',
      render: (item) => (
        <span className={`text-[10px] font-bold ${item.twoFactorEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
          {item.twoFactorEnabled ? (locale === 'ar' ? 'مفعل' : 'Active') : (locale === 'ar' ? 'غير مفعل' : 'Off')}
        </span>
      ),
    },
    {
      key: 'status',
      header: locale === 'ar' ? 'الحالة' : 'Status',
      align: 'center',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
          item.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-700'
        }`}>
          {item.status === 'active' ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')}
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
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={t.edit}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {item.id !== activeUserId && item.id !== currentUser.id && (
            <button
              onClick={() => handleDeleteUser(item)}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.navUsers}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'إدارة حسابات فريق عمل المكتب وتعيين الأدوار والصلاحيات القضائية والإدارية'
              : 'Managing firm staff accounts, assigning roles, and administrative privileges'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'إضافة مستخدم جديد' : 'New User'}</span>
        </button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder={locale === 'ar' ? 'بحث بالاسم، البريد، الدور...' : 'Search name, email, role...'}
        searchFilter={(item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.email.toLowerCase().includes(query.toLowerCase()) ||
          item.role.toLowerCase().includes(query.toLowerCase())
        }
        exportFileName="firm_users_list"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? (locale === 'ar' ? 'تعديل بيانات المستخدم' : 'Edit User') : (locale === 'ar' ? 'إضافة مستخدم جديد' : 'New User')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.fullName} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.emailAddress} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.phoneNumber}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'الدور الوظيفي' : 'Role'} *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                {ROLES_CONFIG.map((role) => (
                  <option key={role.key} value={role.key}>
                    {locale === 'ar' ? role.labelAr : role.labelEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'حالة الحساب' : 'Status'}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                <option value="active">{locale === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="inactive">{locale === 'ar' ? 'معطل' : 'Inactive'}</option>
              </select>
            </div>
          </div>

          {!editingId && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'كلمة المرور المؤقتة' : 'Temporary Password'} *
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
              />
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
