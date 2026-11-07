/**
 * Main Application Component
 * Law Firm Management System (نظام إدارة مكتب محاماة)
 * Orchestrates Public Pages, 6 Authentication Pages, Role-Based Dashboards,
 * Shared Modules, and Idle Session Timeout.
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/auth.store';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { PublicLayout } from './layouts/PublicLayout';
import { ToastContainer } from './components/ui/Toast';
import { SessionTimeoutModal } from './components/ui/SessionTimeoutModal';
import { ProtectedRoute } from './routes/guards/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { Scale, Loader2 } from 'lucide-react';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ContactPage } from './pages/public/ContactPage';

// 6 Authentication Pages
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  OtpPage,
} from './pages/auth/AuthPages';

// Role Dashboards
import {
  AdminDashboard,
  LawyerDashboard,
  AssistantDashboard,
  AccountantDashboard,
  SecretaryDashboard,
  ClientDashboard,
} from './pages/dashboard/RoleDashboards';

// Shared Management Modules
import { CasesPage } from './pages/shared/CasesPage';
import { ClientsPage } from './pages/shared/ClientsPage';
import { DocumentsPage } from './pages/shared/DocumentsPage';
import { InvoicesPage } from './pages/shared/InvoicesPage';
import { AppointmentsPage } from './pages/shared/AppointmentsPage';
import { TasksPage } from './pages/shared/TasksPage';
import { UsersPage } from './pages/shared/UsersPage';
import { ReportsPage } from './pages/shared/ReportsPage';
import { ChatPage } from './pages/shared/ChatPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { SystemSettingsPage } from './pages/dashboard/admin/SystemSettingsPage';
import { ServiceUsageSettings } from './pages/dashboard/admin/ServiceUsageSettings';
import { TemplatesManagerPage } from './pages/dashboard/admin/TemplatesManagerPage';
import { PublicPagesSettingsPage } from './pages/dashboard/admin/PublicPagesSettingsPage';
import { PreDeploymentAuditPage } from './pages/dashboard/admin/PreDeploymentAuditPage';
import { FileManagerPage } from './pages/dashboard/shared/FileManagerPage';
import { NotificationPreferences } from './pages/dashboard/shared/NotificationPreferences';
import { ContactMessagesPage } from './pages/shared/ContactMessagesPage';
import { DatabaseArchPage } from './pages/shared/DatabaseArchPage';

import { testFirebaseConnection } from './lib/firebase';
import { seedFirestoreInitialCollections } from './lib/firebaseSeed';
import { useSocketStore } from './store/socketStore';

export default function App() {
  const { currentView, currentUser, fontSize, zoomLevel, locale, theme, setCurrentView } = useAppStore();
  const { fetchMe, isAuthenticated, user, token } = useAuthStore();
  const { connect: connectSocket, disconnect: disconnectSocket } = useSocketStore();
  const [initializing, setInitializing] = useState(true);

  // Initialize Auth & Detect URL routes on start + Firebase Seed
  useEffect(() => {
    async function init() {
      // Test and seed Firestore collections
      try {
        await testFirebaseConnection();
        await seedFirestoreInitialCollections();
      } catch (err) {
        console.warn('Firebase initial seed check:', err);
      }

      // Check query params or pathname for direct links
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const search = window.location.search;
        const params = new URLSearchParams(search);

        if (path === '/reset-password' || params.get('view') === 'reset_password' || params.has('token') && search.includes('reset')) {
          setCurrentView('reset_password');
        } else if (path === '/verify-email' || params.get('view') === 'verify_email' || search.includes('verify')) {
          setCurrentView('verify_email');
        } else if (path === '/login') {
          setCurrentView('login');
        } else if (path === '/register') {
          setCurrentView('register');
        } else if (path === '/forgot-password') {
          setCurrentView('forgot_password');
        }
      }

      // Rehydrate active session via /api/auth/me
      if (isAuthenticated) {
        await fetchMe();
        connectSocket(token || undefined);
      }

      setInitializing(false);
    }

    init();
  }, [fetchMe, isAuthenticated, setCurrentView, connectSocket, token]);

  // Apply Locale & Dark Mode Theme to HTML root
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [locale, theme]);

  const isPublicView = ['home', 'about', 'services', 'contact'].includes(currentView);
  const isAuthView = [
    'login',
    'register',
    'forgot_password',
    'reset_password',
    'verify_email',
    'otp',
  ].includes(currentView);

  // Dynamic font size classes
  const fontSizeClass = {
    sm: 'text-[13px]',
    md: 'text-[14px]',
    lg: 'text-[16px]',
  }[fontSize];

  // Dynamic zoom level style
  const zoomStyle: React.CSSProperties = {
    zoom: zoomLevel,
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg animate-pulse">
          <Scale className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">مكتب العدالة للمحاماة</h2>
          <p className="text-xs text-slate-400">جارٍ التحقق من الجلسة الآمنة...</p>
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
      </div>
    );
  }

  const renderDashboardView = () => {
    const activeRole = user?.role || currentUser.role;

    switch (currentView) {
      case 'dashboard':
        switch (activeRole) {
          case 'admin':
            return <AdminDashboard />;
          case 'lawyer':
            return <LawyerDashboard />;
          case 'legal_assistant':
            return <AssistantDashboard />;
          case 'accountant':
            return <AccountantDashboard />;
          case 'secretary':
            return <SecretaryDashboard />;
          case 'client':
            return <ClientDashboard />;
          default:
            return <AdminDashboard />;
        }
      case 'cases':
        return <CasesPage />;
      case 'clients':
        return (
          <ProtectedRoute allowedRoles={['admin', 'secretary']}>
            <ClientsPage />
          </ProtectedRoute>
        );
      case 'documents':
        return <DocumentsPage />;
      case 'invoices':
        return (
          <ProtectedRoute allowedRoles={['admin', 'accountant', 'lawyer', 'client']}>
            <InvoicesPage />
          </ProtectedRoute>
        );
      case 'appointments':
        return <AppointmentsPage />;
      case 'tasks':
        return (
          <ProtectedRoute allowedRoles={['admin', 'lawyer', 'legal_assistant', 'accountant', 'secretary']}>
            <TasksPage />
          </ProtectedRoute>
        );
      case 'users':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        );
      case 'reports':
        return (
          <ProtectedRoute allowedRoles={['admin', 'lawyer', 'accountant']}>
            <ReportsPage />
          </ProtectedRoute>
        );
      case 'chat':
        return <ChatPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'system_settings':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemSettingsPage />
          </ProtectedRoute>
        );
      case 'service_usage_settings':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <ServiceUsageSettings />
          </ProtectedRoute>
        );
      case 'templates_manager':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <TemplatesManagerPage />
          </ProtectedRoute>
        );
      case 'public_pages_settings':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <PublicPagesSettingsPage />
          </ProtectedRoute>
        );
      case 'pre_deployment_audit':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <PreDeploymentAuditPage />
          </ProtectedRoute>
        );
      case 'file_manager':
        return <FileManagerPage />;
      case 'notification_preferences':
        return <NotificationPreferences />;
      case 'contact_messages':
        return (
          <ProtectedRoute allowedRoles={['admin', 'secretary']}>
            <ContactMessagesPage />
          </ProtectedRoute>
        );
      case 'db_architecture':
        return <DatabaseArchPage />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div
      style={zoomStyle}
      className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200 ${fontSizeClass}`}
    >
      <ToastContainer />
      <SessionTimeoutModal />

      {isPublicView ? (
        <PublicLayout>
          {currentView === 'home' && <HomePage />}
          {currentView === 'about' && <AboutPage />}
          {currentView === 'services' && <ServicesPage />}
          {currentView === 'contact' && <ContactPage />}
        </PublicLayout>
      ) : isAuthView ? (
        <PublicLayout>
          <div className="flex items-center justify-center py-10 px-4">
            {currentView === 'login' && (
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            )}
            {currentView === 'register' && (
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            )}
            {currentView === 'forgot_password' && (
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            )}
            {currentView === 'reset_password' && <ResetPasswordPage />}
            {currentView === 'verify_email' && <VerifyEmailPage />}
            {currentView === 'otp' && <OtpPage />}
          </div>
        </PublicLayout>
      ) : (
        /* Workspace / Authenticated Dashboard Layout */
        <ProtectedRoute>
          <div className="flex min-h-screen w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header isPublic={false} />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">{renderDashboardView()}</div>
              </main>
            </div>
          </div>
        </ProtectedRoute>
      )}
    </div>
  );
}
