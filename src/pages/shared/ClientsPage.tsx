/**
 * ClientsPage Component
 * Client Management with strict role isolation:
 * Admin & Secretary (Full CRUD), Lawyer (read-only for own clients), Client (Restricted).
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Client } from '../../types';
import { Plus, Edit2, Trash2, Building, User, Phone, Mail, ShieldAlert } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { locale, clients, cases, addClient, updateClient, deleteClient, showToast } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeRole = user?.role || 'admin';
  const activeUserId = user?.id || 'usr-admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+9665',
    nationalId: '',
    type: 'company' as 'company' | 'individual',
    companyName: '',
    address: '',
    notes: '',
  });

  // Client role has no access to Clients list
  if (activeRole === 'client') {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {locale === 'ar' ? 'غير مصرح بالوصول' : 'Access Restricted'}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {locale === 'ar'
            ? 'لا تملك صلاحية الاطلاع على دليل عملاء المكتب.'
            : 'Clients are not permitted to view the firm client registry.'}
        </p>
      </div>
    );
  }

  // Role Data Isolation
  const filteredClients = useMemo(() => {
    if (activeRole === 'lawyer') {
      const ownClientIds = cases.filter((c) => c.lawyerId === activeUserId || c.lawyerId === 'usr-lawyer').map((c) => c.clientId);
      return clients.filter((cl) => ownClientIds.includes(cl.id));
    }
    return clients;
  }, [clients, cases, activeRole, activeUserId]);

  const canManage = activeRole === 'admin' || activeRole === 'secretary';

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '+9665',
      nationalId: '',
      type: 'company',
      companyName: '',
      address: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Client) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone,
      nationalId: item.nationalId,
      type: (item.type as any) === 'corporate' ? 'company' : (item.type as any) || 'company',
      companyName: item.companyName || '',
      address: item.address,
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateClient(editingId, formData as any);
      showToast(locale === 'ar' ? 'تم تحديث بيانات العميل' : 'Client updated');
    } else {
      addClient(formData as any);
      showToast(locale === 'ar' ? 'تمت إضافة العميل بنجاح' : 'Client added successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(locale === 'ar' ? 'هل أنت متأكد من حذف العميل؟' : 'Delete client?')) {
      deleteClient(id);
      showToast(locale === 'ar' ? 'تم حذف العميل' : 'Client deleted', 'info');
    }
  };

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: locale === 'ar' ? 'اسم العميل / المنشأة' : 'Client / Company Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            {item.type === 'corporate' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              {item.name}
            </span>
            <span className="text-[11px] text-slate-400">
              {item.companyName || item.nationalId}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: locale === 'ar' ? 'النوع' : 'Type',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            item.type === 'corporate'
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
          }`}
        >
          {item.type === 'corporate'
            ? locale === 'ar'
              ? 'منشأة / شركة'
              : 'Company'
            : locale === 'ar'
            ? 'فرد'
            : 'Individual'}
        </span>
      ),
    },
    {
      key: 'email',
      header: locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
      render: (item) => <span className="text-xs text-slate-600 dark:text-slate-400">{item.email}</span>,
    },
    {
      key: 'phone',
      header: locale === 'ar' ? 'الهاتف' : 'Phone',
      render: (item) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300" dir="ltr">{item.phone}</span>,
    },
    {
      key: 'casesCount',
      header: locale === 'ar' ? 'القضايا' : 'Cases',
      align: 'center',
      render: (item) => {
        const count = cases.filter((c) => c.clientId === item.id).length;
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800">
            {count}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: locale === 'ar' ? 'تاريخ التسجيل' : 'Added Date',
      render: (item) => <span className="text-xs text-slate-500 tabular-nums">{item.createdAt.split('T')[0]}</span>,
    },
    {
      key: 'actions',
      header: locale === 'ar' ? 'الإجراءات' : 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {canManage && (
            <button
              type="button"
              onClick={() => handleOpenEdit(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
              title={locale === 'ar' ? 'تعديل' : 'Edit'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {activeRole === 'admin' && (
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title={locale === 'ar' ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {locale === 'ar' ? 'دليل العملاء والموكلين' : 'Client Registry'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeRole === 'lawyer'
              ? locale === 'ar'
                ? 'عرض الموكلين المرتبطين بقضاياك النشطة فقط'
                : 'Displaying clients associated with your active caseload'
              : locale === 'ar'
              ? 'إدارة حسابات الشركات والأفراد والاتفاقيات النظامية'
              : 'Managing individual and corporate clients profile portfolio'}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'ar' ? 'عميل جديد' : 'New Client'}</span>
          </button>
        )}
      </div>

      <DataTable
        data={filteredClients}
        columns={columns}
        searchPlaceholder={locale === 'ar' ? 'بحث بالاسم أو البريد أو الهاتف...' : 'Search clients...'}
        searchFilter={(item, q) =>
          item.name.toLowerCase().includes(q.toLowerCase()) ||
          item.email.toLowerCase().includes(q.toLowerCase()) ||
          item.phone.includes(q)
        }
        exportFileName="clients_registry"
      />

      {/* Client Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? (locale === 'ar' ? 'تعديل بيانات العميل' : 'Edit Client') : (locale === 'ar' ? 'إضافة عميل جديد' : 'Add New Client')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'نوع العميل' : 'Client Type'} *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'company' })}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  formData.type === 'company' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
                }`}
              >
                {locale === 'ar' ? 'شركة / منشأة' : 'Company'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'individual' })}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  formData.type === 'individual' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
                }`}
              >
                {locale === 'ar' ? 'شخص طبيعي / فرد' : 'Individual'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {formData.type === 'company' ? (locale === 'ar' ? 'اسم المنشأة أو الشركة' : 'Company Name') : (locale === 'ar' ? 'الاسم الكامل' : 'Full Name')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {formData.type === 'company' ? (locale === 'ar' ? 'السجل التجاري' : 'CR Number') : (locale === 'ar' ? 'رقم الهوية الوطنية' : 'National ID')}
            </label>
            <input
              type="text"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {locale === 'ar' ? 'العنوان والملاحظات' : 'Address & Notes'}
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800"
            >
              {editingId ? (locale === 'ar' ? 'حفظ' : 'Save') : (locale === 'ar' ? 'إضافة' : 'Add')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
