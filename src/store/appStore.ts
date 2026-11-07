import { create } from 'zustand';
import {
  User,
  UserRole,
  Client,
  Case,
  DocumentItem,
  Invoice,
  Appointment,
  TaskItem,
  NotificationItem,
  ChatMessage,
  ContactMessage,
  FirmSettings,
  ServiceItem,
  Locale,
  Theme,
  FontSize,
  Density,
  ZoomLevel,
  RoleConfig,
} from '../types';
import {
  initialFirmSettings,
  initialUsers,
  initialClients,
  initialCases,
  initialDocuments,
  initialInvoices,
  initialAppointments,
  initialTasks,
  initialNotifications,
  initialChatMessages,
  initialContactMessages,
  initialServices,
} from './initialData';

export const ROLES_CONFIG: RoleConfig[] = [
  {
    key: 'admin',
    labelAr: 'مدير المكتب',
    labelEn: 'Firm Manager',
    descriptionAr: 'صلاحيات إدارية ومالية شاملة لكافة الأقسام والمستخدمين والتقارير',
    descriptionEn: 'Full executive and administrative control across all operations',
    allowedNav: ['dashboard', 'cases', 'clients', 'users', 'documents', 'file_manager', 'invoices', 'appointments', 'tasks', 'reports', 'chat', 'settings', 'system_settings', 'service_usage_settings', 'templates_manager', 'public_pages_settings', 'pre_deployment_audit', 'notification_preferences', 'contact_messages', 'db_architecture'],
  },
  {
    key: 'lawyer',
    labelAr: 'محامي',
    labelEn: 'Lawyer / Attorney',
    descriptionAr: 'إدارة القضايا الموكلة والجلسات وإعداد المذكرات والمحادثة مع الموكلين',
    descriptionEn: 'Manage assigned caseload, hearings, draft briefs, and client interaction',
    allowedNav: ['dashboard', 'cases', 'documents', 'file_manager', 'tasks', 'appointments', 'invoices', 'reports', 'chat', 'notification_preferences', 'db_architecture'],
  },
  {
    key: 'legal_assistant',
    labelAr: 'مساعد قانوني',
    labelEn: 'Legal Assistant',
    descriptionAr: 'تنفيذ التكليفات القضائية وإعداد المستندات وأرشفة الأدلة',
    descriptionEn: 'Draft pleadings, legal filing, docketing, and case support',
    allowedNav: ['dashboard', 'cases', 'documents', 'file_manager', 'tasks', 'chat', 'notification_preferences', 'db_architecture'],
  },
  {
    key: 'accountant',
    labelAr: 'محاسب',
    labelEn: 'Accountant',
    descriptionAr: 'إصدار الفواتير الضريبية ومتابعة التحصيل وحساب الأتعاب والتقارير المالية',
    descriptionEn: 'Billing lifecycle, VAT compliance, receivables, and cashflow reports',
    allowedNav: ['dashboard', 'invoices', 'appointments', 'reports', 'tasks', 'notification_preferences', 'db_architecture'],
  },
  {
    key: 'secretary',
    labelAr: 'سكرتير',
    labelEn: 'Secretary',
    descriptionAr: 'جدولة المواعيد واستقبال العملاء وتوثيق الاتصالات والطلبات',
    descriptionEn: 'Reception logs, appointments schedule, client intake, and inquiries',
    allowedNav: ['dashboard', 'appointments', 'clients', 'cases', 'documents', 'tasks', 'contact_messages', 'chat', 'notification_preferences', 'db_architecture'],
  },
  {
    key: 'client',
    labelAr: 'عميل / موكل',
    labelEn: 'Client Portal',
    descriptionAr: 'متابعة سير قضاياه وجلساته وفواتيره والتواصل الآمن مع المحامي',
    descriptionEn: 'Access personal cases, hearing dates, invoices, and direct lawyer chat',
    allowedNav: ['dashboard', 'cases', 'invoices', 'appointments', 'documents', 'chat', 'notification_preferences'],
  },
];

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppStore {
  // Navigation & User
  currentUser: User;
  currentView: string;
  locale: Locale;
  theme: Theme;
  fontSize: FontSize;
  density: Density;
  zoomLevel: ZoomLevel;
  sidebarOpen: boolean;
  globalSearch: string;
  toasts: ToastState[];

  // Entities
  firmSettings: FirmSettings;
  users: User[];
  clients: Client[];
  cases: Case[];
  documents: DocumentItem[];
  invoices: Invoice[];
  appointments: Appointment[];
  tasks: TaskItem[];
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];
  contactMessages: ContactMessage[];
  services: ServiceItem[];

  // Setters & Actions
  setCurrentView: (view: string) => void;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
  setDensity: (density: Density) => void;
  setZoomLevel: (zoomLevel: ZoomLevel) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setGlobalSearch: (q: string) => void;
  showToast: (message: string, type?: ToastState['type']) => void;
  removeToast: (id: string) => void;

  // CRUD & Operations
  addCase: (item: Omit<Case, 'id' | 'createdAt'>) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  deleteCase: (id: string) => void;

  addClient: (item: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addDocument: (item: Omit<DocumentItem, 'id' | 'uploadedAt'>) => void;
  deleteDocument: (id: string) => void;

  addInvoice: (item: Omit<Invoice, 'id'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status'], paidMethod?: Invoice['paymentMethod']) => void;
  deleteInvoice: (id: string) => void;

  addAppointment: (item: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  deleteAppointment: (id: string) => void;

  addTask: (item: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (id: string, status: TaskItem['status']) => void;
  deleteTask: (id: string) => void;

  addUser: (item: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  sendChatMessage: (roomId: string, text: string) => void;

  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'read' | 'replied' | 'createdAt'>) => void;
  markContactMessageRead: (id: string) => void;

  updateFirmSettings: (settings: Partial<FirmSettings>) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentUser: initialUsers[0], // Starts as Admin for maximum visibility
  currentView: 'home',
  locale: 'ar',
  theme: 'light',
  fontSize: 'md',
  density: 'comfortable',
  zoomLevel: 1.0,
  sidebarOpen: true,
  globalSearch: '',
  toasts: [],

  firmSettings: initialFirmSettings,
  users: initialUsers,
  clients: initialClients,
  cases: initialCases,
  documents: initialDocuments,
  invoices: initialInvoices,
  appointments: initialAppointments,
  tasks: initialTasks,
  notifications: initialNotifications,
  chatMessages: initialChatMessages,
  contactMessages: initialContactMessages,
  services: initialServices,

  setCurrentView: (view) => set({ currentView: view }),
  setCurrentUser: (user) => set({ currentUser: user }),

  switchRole: (role) => {
    const existing = get().users.find((u) => u.role === role);
    if (existing) {
      set({ currentUser: existing });
      get().showToast(
        get().locale === 'ar'
          ? `تم التبديل إلى دور: ${ROLES_CONFIG.find((r) => r.key === role)?.labelAr}`
          : `Switched to role: ${ROLES_CONFIG.find((r) => r.key === role)?.labelEn}`,
        'info'
      );
    }
  },

  setLocale: (locale) => {
    set({ locale });
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  },

  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setFontSize: (fontSize) => set({ fontSize }),
  setDensity: (density) => set({ density }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setGlobalSearch: (globalSearch) => set({ globalSearch }),

  showToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // CRUD Cases
  addCase: (item) => {
    const newCase: Case = {
      ...item,
      id: `case-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ cases: [newCase, ...state.cases] }));
    get().showToast(get().locale === 'ar' ? 'تم إنشاء القضية بنجاح' : 'Case created successfully');
  },

  updateCase: (id, updates) => {
    set((state) => ({
      cases: state.cases.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().showToast(get().locale === 'ar' ? 'تم تحديث بيانات القضية' : 'Case updated');
  },

  deleteCase: (id) => {
    set((state) => ({ cases: state.cases.filter((c) => c.id !== id) }));
    get().showToast(get().locale === 'ar' ? 'تم حذف القضية' : 'Case removed', 'info');
  },

  // CRUD Clients
  addClient: (item) => {
    const newClient: Client = {
      ...item,
      id: `cl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ clients: [newClient, ...state.clients] }));
    get().showToast(get().locale === 'ar' ? 'تمت إضافة الموكل بنجاح' : 'Client registered');
  },

  updateClient: (id, updates) => {
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    get().showToast(get().locale === 'ar' ? 'تم تحديث بيانات الموكل' : 'Client updated');
  },

  deleteClient: (id) => {
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
    get().showToast(get().locale === 'ar' ? 'تم حذف العميل' : 'Client deleted', 'info');
  },

  // CRUD Documents
  addDocument: (item) => {
    const doc: DocumentItem = {
      ...item,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ documents: [doc, ...state.documents] }));
    get().showToast(get().locale === 'ar' ? 'تم رفع المستند وأرشفته بنجاح' : 'Document uploaded and archived');
  },

  deleteDocument: (id) => {
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
    get().showToast(get().locale === 'ar' ? 'تم حذف المستند' : 'Document deleted', 'info');
  },

  // CRUD Invoices
  addInvoice: (item) => {
    const inv: Invoice = {
      ...item,
      id: `inv-${Date.now()}`,
    };
    set((state) => ({ invoices: [inv, ...state.invoices] }));
    get().showToast(get().locale === 'ar' ? 'تم إصدار الفاتورة الضريبية' : 'Invoice generated');
  },

  updateInvoiceStatus: (id, status, paymentMethod) => {
    const paidAt = status === 'paid' ? new Date().toISOString().split('T')[0] : undefined;
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, status, paidAt, paymentMethod: paymentMethod || inv.paymentMethod } : inv
      ),
    }));
    get().showToast(get().locale === 'ar' ? 'تم تحديث حالة الفاتورة' : 'Invoice status updated');
  },

  deleteInvoice: (id) => {
    set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) }));
    get().showToast(get().locale === 'ar' ? 'تم حذف الفاتورة' : 'Invoice deleted', 'info');
  },

  // Appointments
  addAppointment: (item) => {
    const apt: Appointment = {
      ...item,
      id: `apt-${Date.now()}`,
    };
    set((state) => ({ appointments: [apt, ...state.appointments] }));
    get().showToast(get().locale === 'ar' ? 'تم جدولة الموعد / الجلسة بنجاح' : 'Appointment scheduled');
  },

  updateAppointmentStatus: (id, status) => {
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
    get().showToast(get().locale === 'ar' ? 'تم تحديث حالة الموعد' : 'Appointment status changed');
  },

  deleteAppointment: (id) => {
    set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }));
    get().showToast(get().locale === 'ar' ? 'تم إلغاء الموعد' : 'Appointment cancelled', 'info');
  },

  // Tasks
  addTask: (item) => {
    const task: TaskItem = {
      ...item,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ tasks: [task, ...state.tasks] }));
    get().showToast(get().locale === 'ar' ? 'تم إسناد المهمة بنجاح' : 'Task assigned');
  },

  updateTaskStatus: (id, status) => {
    const completedAt = status === 'done' ? new Date().toISOString().split('T')[0] : undefined;
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status, completedAt } : t)),
    }));
    get().showToast(get().locale === 'ar' ? 'تم تحديث حالة المهمة' : 'Task status updated');
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    get().showToast(get().locale === 'ar' ? 'تم حذف المهمة' : 'Task deleted', 'info');
  },

  // Users
  addUser: (item) => {
    const user: User = {
      ...item,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ users: [...state.users, user] }));
    get().showToast(get().locale === 'ar' ? 'تم إنشاء حساب المستخدم بنجاح' : 'User account created');
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      currentUser: get().currentUser.id === id ? { ...get().currentUser, ...updates } : get().currentUser,
    }));
    get().showToast(get().locale === 'ar' ? 'تم تحديث حساب المستخدم' : 'User updated');
  },

  deleteUser: (id) => {
    set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
    get().showToast(get().locale === 'ar' ? 'تم تعطيل الحساب' : 'User removed', 'info');
  },

  // Notifications
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    get().showToast(get().locale === 'ar' ? 'تم تحديد جميع الإشعارات كمقروءة' : 'All notifications marked as read');
  },

  // Chat
  sendChatMessage: (roomId, text) => {
    const user = get().currentUser;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    set((state) => ({ chatMessages: [...state.chatMessages, msg] }));

    // Simulate lawyer or client automatic reply after 1.5s
    if (user.role === 'client') {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          roomId,
          senderId: 'usr-lawyer',
          senderName: 'المحامية سارة المنصور',
          senderRole: 'lawyer',
          text: 'تم استلام استفساركم، وسنقوم بموافقتكم بالمستجدات فور ورود إشعار الدائرة القضائية.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        set((state) => ({ chatMessages: [...state.chatMessages, reply] }));
      }, 1500);
    }
  },

  // Contact Messages
  addContactMessage: (msg) => {
    const item: ContactMessage = {
      ...msg,
      id: `cnt-${Date.now()}`,
      read: false,
      replied: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    set((state) => ({ contactMessages: [item, ...state.contactMessages] }));
  },

  markContactMessageRead: (id) => {
    set((state) => ({
      contactMessages: state.contactMessages.map((c) => (c.id === id ? { ...c, read: true } : c)),
    }));
  },

  // Firm Settings
  updateFirmSettings: (settings) => {
    set((state) => ({ firmSettings: { ...state.firmSettings, ...settings } }));
    get().showToast(get().locale === 'ar' ? 'تم حفظ إعدادات المكتب بنجاح' : 'Firm settings updated');
  },
}));
