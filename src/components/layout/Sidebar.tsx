import React from 'react';
import { useAppStore, ROLES_CONFIG } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  CreditCard,
  Calendar,
  CheckSquare,
  UserCheck,
  BarChart3,
  MessageSquare,
  Settings,
  Mail,
  Database,
  Lock,
  Sliders,
  Bell,
  Scale,
  X,
  ExternalLink,
  Globe,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    locale,
    sidebarOpen,
    setSidebarOpen,
    currentUser,
    notifications,
  } = useAppStore();

  const t = useTranslation(locale);

  const roleConfig = ROLES_CONFIG.find((r) => r.key === currentUser.role);
  const allowedNav = roleConfig?.allowedNav || [];

  const unreadMessagesCount = useAppStore((s) => s.contactMessages.filter((m) => !m.read).length);

  const navItems = [
    { key: 'dashboard', label: t.navOverview, icon: LayoutDashboard },
    { key: 'cases', label: t.navCases, icon: Briefcase },
    { key: 'clients', label: t.navClients, icon: Users },
    { key: 'documents', label: t.navDocuments, icon: FileText },
    { key: 'file_manager', label: locale === 'ar' ? 'إدارة التخزين والملفات' : 'File & Storage', icon: HardDrive },
    { key: 'invoices', label: t.navInvoices, icon: CreditCard },
    { key: 'appointments', label: t.navAppointments, icon: Calendar },
    { key: 'tasks', label: t.navTasks, icon: CheckSquare },
    { key: 'users', label: t.navUsers, icon: UserCheck },
    { key: 'reports', label: t.navReports, icon: BarChart3 },
    { key: 'chat', label: t.navChat, icon: MessageSquare },
    { key: 'contact_messages', label: t.navContactMessages, icon: Mail, badge: unreadMessagesCount },
    { key: 'settings', label: t.navSettings, icon: Settings },
    { key: 'system_settings', label: locale === 'ar' ? 'إعدادات النظام والتكامل' : 'System & Integrations', icon: Lock },
    { key: 'service_usage_settings', label: locale === 'ar' ? 'التحكم بالخدمات والإشعارات' : 'Service Usage Control', icon: Sliders },
    { key: 'templates_manager', label: locale === 'ar' ? 'إدارة القوالب الإشعارية' : 'Templates Repository', icon: FileText },
    { key: 'public_pages_settings', label: locale === 'ar' ? 'إعدادات الصفحات والـ SEO' : 'Public Pages & SEO', icon: Globe },
    { key: 'pre_deployment_audit', label: locale === 'ar' ? 'فحص ما قبل النشر (Audit)' : 'Pre-Deployment Audit', icon: ShieldCheck },
    { key: 'notification_preferences', label: locale === 'ar' ? 'تفضيلات الإشعارات الشخصية' : 'Notification Preferences', icon: Bell },
    { key: 'db_architecture', label: t.navDbArchitecture, icon: Database },
  ];

  const visibleItems = navItems.filter((item) => allowedNav.includes(item.key));

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 start-0 z-40 w-64 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-start">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {locale === 'ar' ? t.firmNameShort : 'Al-Adalah Law'}
              </span>
              <span className="text-[10px] text-slate-400">
                v2.0 · {locale === 'ar' ? roleConfig?.labelAr : roleConfig?.labelEn}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {locale === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setCurrentView(item.key);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge != null && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Public site quick return */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setCurrentView('home')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>{locale === 'ar' ? 'الرجوع للموقع العام' : 'Public Website'}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
