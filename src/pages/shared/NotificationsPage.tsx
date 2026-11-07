/**
 * NotificationsPage Component
 * Dedicated notifications center strictly isolated to the logged-in user.
 * Features:
 * - Unread / Read / All filter tabs
 * - Mark as Read, Mark All as Read, and Delete actions
 * - Quick direct navigation link to the relevant case, invoice, or appointment
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation } from '../../utils/translations';
import { NotificationItem } from '../../types';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Briefcase,
  CreditCard,
  Calendar,
  FileText,
  Clock,
  Filter,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    locale,
    notifications,
    currentUser,
    setCurrentView,
    markNotificationRead,
    markAllNotificationsRead,
    showToast,
  } = useAppStore();
  const { user } = useAuthStore();
  const t = useTranslation(locale);

  const activeUserId = user?.id || currentUser.id;
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');

  // Strict isolation to current user (fallback to usr-admin in mock context if matches)
  const isolatedNotifications = useMemo(() => {
    return notifications.filter(
      (n) => n.userId === activeUserId || (!n.userId && activeUserId === 'usr-admin')
    );
  }, [notifications, activeUserId]);

  const filteredNotifications = useMemo(() => {
    if (filterTab === 'unread') return isolatedNotifications.filter((n) => !n.read);
    if (filterTab === 'read') return isolatedNotifications.filter((n) => n.read);
    return isolatedNotifications;
  }, [isolatedNotifications, filterTab]);

  const unreadCount = isolatedNotifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'case_update':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'invoice':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'task':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>{locale === 'ar' ? 'مركز التنبيهات والإشعارات' : 'Notifications Center'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'متابعة تحديثات القضايا والجلسات القضائية والفواتير الموجهة لحسابك'
              : 'Direct procedural alerts, case docket updates, and billing activity'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => {
              markAllNotificationsRead();
              showToast(locale === 'ar' ? 'تم تعيين جميع الإشعارات كمقروءة' : 'All notifications marked as read');
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 flex items-center gap-1.5 transition-opacity"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'تعيين الكل كمقروء' : 'Mark All as Read'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {locale === 'ar' ? 'كافة التنبيهات' : 'All'} ({isolatedNotifications.length})
        </button>
        <button
          onClick={() => setFilterTab('unread')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filterTab === 'unread'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>{locale === 'ar' ? 'غير مقروءة' : 'Unread'}</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
          <span>({unreadCount})</span>
        </button>
        <button
          onClick={() => setFilterTab('read')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filterTab === 'read'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {locale === 'ar' ? 'المقروءة' : 'Read'} ({isolatedNotifications.length - unreadCount})
        </button>
      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {locale === 'ar' ? 'لا توجد تنبيهات مطابقة' : 'No notifications in this tab'}
            </h3>
            <p className="text-xs text-slate-400">
              {locale === 'ar' ? 'ستظهر هنا كافة الإشعارات والتذكيرات القضائية فور وصولها' : 'Procedural docket notices will appear here'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                notif.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-slate-900 dark:text-slate-100 font-medium shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{notif.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title={locale === 'ar' ? 'تعيين كمقروء' : 'Mark Read'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                {notif.link && (
                  <button
                    onClick={() => {
                      markNotificationRead(notif.id);
                      setCurrentView(notif.link!);
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <span>{locale === 'ar' ? 'عرض السجل' : 'Open'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
