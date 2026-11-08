export type UserRole = 'admin' | 'lawyer' | 'legal_assistant' | 'accountant' | 'secretary' | 'client';

export type CaseStatus = 'open' | 'pending' | 'closed' | 'archived';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'invoice' | 'case_update' | 'task' | 'message';

export type Locale = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type FontSize = 'sm' | 'md' | 'lg';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type ZoomLevel = 0.8 | 1.0 | 1.2 | 1.5;

export interface User {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  status: 'active' | 'inactive';
  lastLoginAt?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone: string;
  nationalId: string;
  type: 'individual' | 'corporate';
  companyName?: string;
  address: string;
  userId?: string;
  notes?: string;
  createdAt: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  titleEn?: string;
  category: 'commercial' | 'civil' | 'criminal' | 'labor' | 'administrative' | 'family';
  status: CaseStatus;
  court: string;
  courtRoom?: string;
  judge?: string;
  clientId: string;
  clientName?: string;
  lawyerId: string;
  lawyerName?: string;
  fee: number;
  paidAmount: number;
  openedAt: string;
  nextHearingDate?: string;
  description: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  caseId?: string;
  caseNumber?: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  category: 'pleading' | 'evidence' | 'judgment' | 'contract' | 'power_of_attorney' | 'other';
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  url?: string;
  isSigned?: boolean;
  signedBy?: string;
  signedAt?: string;
  signatureHash?: string;
  tsaTimestamp?: string;
  signatureDataUrl?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  caseNumber?: string;
  subtotal: number;
  taxRate: number; // e.g. 15%
  taxAmount: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: 'bank_transfer' | 'card' | 'cash' | 'paypal';
  notes?: string;
}

export interface Appointment {
  id: string;
  title: string;
  type: 'court_hearing' | 'client_consultation' | 'internal_meeting' | 'investigation';
  lawyerId: string;
  lawyerName: string;
  clientId?: string;
  clientName?: string;
  caseId?: string;
  caseNumber?: string;
  location: string;
  dateTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  caseId?: string;
  caseNumber?: string;
  assigneeId: string;
  assigneeName: string;
  createdById: string;
  createdByName: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  attachmentName?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  caseId?: string;
  caseNumber?: string;
  memberIds: string[];
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
}

export interface FirmSettings {
  firmNameAr: string;
  firmNameEn: string;
  licenseNumber: string;
  taxNumber: string;
  phone: string;
  email: string;
  addressAr: string;
  addressEn: string;
  workingHoursAr: string;
  workingHoursEn: string;
  aboutContentAr: string;
  aboutContentEn: string;
  currency: string;
  defaultTaxRate: number;
  consultationFee: number;
}

export interface ServiceItem {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  active: boolean;
  typicalDurationAr: string;
  typicalDurationEn: string;
}

export interface RoleConfig {
  key: UserRole;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  allowedNav: string[];
}
