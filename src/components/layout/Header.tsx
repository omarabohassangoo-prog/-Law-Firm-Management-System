import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import { DisplayControls } from '../ui/DisplayControls';
import {
  Menu,
  Bell,
  Scale,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';

interface HeaderProps {
  isPublic?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isPublic = false }) => {
  const {
    currentView,
    setCurrentView,
    locale,
    toggleSidebar,
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();

  const t = useTranslation(locale);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // If in public site mode
  if (isPublic) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-start"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight">
              {locale === 'ar' ? t.firmNameShort : 'Al-Adalah Law'}
            </span>
          </button>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setCurrentView('home')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'home' ? 'text-slate-900 dark:text-slate-100 font-bold border-b-2 border-slate-900 dark:border-slate-100 pb-0.5' : ''
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'about' ? 'text-slate-900 dark:text-slate-100 font-bold border-b-2 border-slate-900 dark:border-slate-100 pb-0.5' : ''
              }`}
            >
              {t.about}
            </button>
            <button
              onClick={() => setCurrentView('services')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'services' ? 'text-slate-900 dark:text-slate-100 font-bold border-b-2 border-slate-900 dark:border-slate-100 pb-0.5' : ''
              }`}
            >
              {t.services}
            </button>
            <button
              onClick={() => setCurrentView('contact')}
              className={`hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'contact' ? 'text-slate-900 dark:text-slate-100 font-bold border-b-2 border-slate-900 dark:border-slate-100 pb-0.5' : ''
              }`}
            >
              {t.contact}
            </button>
          </nav>

          {/* Zone 3: 1 primary action + Display controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <DisplayControls />
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              {t.dashboard}
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Dashboard Header
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setCurrentView('home')}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium hidden sm:inline"
          >
            {locale === 'ar' ? t.firmNameShort : 'Al-Adalah Law'}
          </button>
          <span className="hidden sm:inline">
            {locale === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
            {currentView === 'dashboard'
              ? t.dashboard
              : currentView === 'cases'
              ? t.navCases
              : currentView === 'clients'
              ? t.navClients
              : currentView === 'documents'
              ? t.navDocuments
              : currentView === 'invoices'
              ? t.navInvoices
              : currentView === 'appointments'
              ? t.navAppointments
              : currentView === 'tasks'
              ? t.navTasks
              : currentView === 'users'
              ? t.navUsers
              : currentView === 'reports'
              ? t.navReports
              : currentView === 'chat'
              ? t.navChat
              : currentView === 'settings'
              ? t.navSettings
              : currentView === 'contact_messages'
              ? t.navContactMessages
              : currentView === 'db_architecture'
              ? t.navDbArchitecture
              : currentView}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute end-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {t.notifications} ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>{t.markAllRead}</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto flex flex-col gap-1.5">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {t.noData}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) setCurrentView(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{n.title}</span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {n.createdAt.split(' ')[1] || n.createdAt}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setCurrentView('notifications');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  {locale === 'ar' ? 'عرض كافة التنبيهات في المركز' : 'Open All Notifications'}
                </button>
              </div>
            </div>
          )}
        </div>

        <DisplayControls />

        {/* User Badge / Avatar */}
        <div className="flex items-center gap-2 ps-2 border-s border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              currentUser.name.charAt(0)
            )}
          </div>
          <div className="hidden lg:flex flex-col text-start">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {locale === 'ar'
                ? t[currentUser.role as keyof typeof t] || currentUser.role
                : t[currentUser.role as keyof typeof t] || currentUser.role}
            </span>
          </div>

          <button
            onClick={async () => {
              const { useAuthStore } = await import('../../store/auth.store');
              await useAuthStore.getState().logout();
              setCurrentView('login');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title={t.logout}
            aria-label="Log out of system"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
