import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { ContactMessage } from '../../types';
import { Mail, CheckCircle2, Trash2, Eye, Phone, MessageSquare } from 'lucide-react';

export const ContactMessagesPage: React.FC = () => {
  const { locale, contactMessages, markContactMessageRead, showToast } = useAppStore();
  const t = useTranslation(locale);

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const handleReplySimulate = () => {
    if (selectedMessage) {
      showToast(locale === 'ar' ? `تم توجيه الرد بالبريد إلى: ${selectedMessage.email}` : `Reply dispatched to: ${selectedMessage.email}`);
      setSelectedMessage(null);
    }
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: 'name',
      header: locale === 'ar' ? 'المرسل' : 'Sender',
      sortable: true,
      render: (item) => (
        <div>
          <span className={`font-bold block ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100 font-extrabold'}`}>
            {item.name}
          </span>
          <span className="text-[11px] text-slate-400">{item.email}</span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: locale === 'ar' ? 'الموضوع / الاستشارة' : 'Subject',
      render: (item) => (
        <span className={`text-xs block line-clamp-1 ${item.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100 font-bold'}`}>
          {item.subject || 'استشارة قانونية عامة'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: locale === 'ar' ? 'رقم الاتصال' : 'Phone',
      render: (item) => (
        <span dir="ltr" className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {item.phone || '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: locale === 'ar' ? 'تاريخ الورود' : 'Received At',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-slate-400 tabular-nums">
          {item.createdAt}
        </span>
      ),
    },
    {
      key: 'read',
      header: locale === 'ar' ? 'الحالة' : 'Status',
      align: 'center',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
          item.read ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
        }`}>
          {item.read ? (locale === 'ar' ? 'مقروء' : 'Read') : (locale === 'ar' ? 'جديد' : 'New')}
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
            onClick={() => {
              markContactMessageRead(item.id);
              setSelectedMessage(item);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title={t.view}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.navContactMessages}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'صندوق وارد رسائل واستشارات نموذج التواصل من الموقع العام'
              : 'Incoming consultation leads and inquiry messages from public website forms'}
          </p>
        </div>
      </div>

      <DataTable
        data={contactMessages}
        columns={columns}
        searchPlaceholder={locale === 'ar' ? 'بحث بالاسم، البريد، الموضوع...' : 'Search name, email, subject...'}
        searchFilter={(item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.email.toLowerCase().includes(query.toLowerCase()) ||
          item.subject.toLowerCase().includes(query.toLowerCase())
        }
        exportFileName="firm_contact_inquiries"
      />

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject || (locale === 'ar' ? 'استشارة قانونية' : 'Legal Inquiry')}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedMessage.name}</span>
                <span className="text-slate-400 tabular-nums">{selectedMessage.createdAt}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-500">
                <span>{selectedMessage.email}</span>
                {selectedMessage.phone && <span>· {selectedMessage.phone}</span>}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">
                {locale === 'ar' ? 'نص الاستشارة / الرسالة' : 'Inquiry Content'}:
              </span>
              <p className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {t.close}
              </button>
              <button
                type="button"
                onClick={handleReplySimulate}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'الرد والتواصل عبر البريد' : 'Reply via Email'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
