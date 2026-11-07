import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../utils/translations';
import {
  Database,
  Network,
  ShieldCheck,
  Server,
  Code,
  Layers,
  Zap,
  Lock,
  GitBranch,
  Terminal,
  FileCode,
} from 'lucide-react';

export const DatabaseArchPage: React.FC = () => {
  const { locale } = useAppStore();
  const t = useTranslation(locale);
  const [activeTab, setActiveTab] = useState<'erd' | 'models' | 'endpoints' | 'rls' | 'performance'>('erd');

  const modelsList = [
    { name: 'User', cols: 21, keys: 'id, email (UNIQUE), role, password, twoFactorSecret', relations: 'Sessions, Cases, Tasks, AuditLogs' },
    { name: 'Session', cols: 9, keys: 'id, userId, token, expiresAt, ipAddress, userAgent', relations: 'User (CASCADE)' },
    { name: 'Client', cols: 10, keys: 'id, nationalId, type, name, phone, email, userId', relations: 'Cases, Invoices' },
    { name: 'Case', cols: 12, keys: 'id, caseNumber (UNIQUE), status, clientId, lawyerId', relations: 'Documents, Invoices, Appointments, ChatRoom' },
    { name: 'Document', cols: 8, keys: 'id, title, fileName, category, caseId, uploadedById', relations: 'Case, User' },
    { name: 'Invoice', cols: 11, keys: 'id, number (UNIQUE), status, subtotal, taxAmount, total, clientId', relations: 'Client, Case' },
    { name: 'Appointment', cols: 9, keys: 'id, title, dateTime, status, lawyerId, clientId, caseId', relations: 'User, Client, Case' },
    { name: 'Task', cols: 10, keys: 'id, title, status, priority, assigneeId, createdById, caseId', relations: 'User, Case' },
    { name: 'AuditLog', cols: 9, keys: 'id, userId, action, entity, entityId, ipAddress, createdAt', relations: 'User (SET NULL)' },
    { name: 'PasswordReset', cols: 6, keys: 'id, email, token, expiresAt, usedAt', relations: 'None' },
    { name: 'Notification', cols: 9, keys: 'id, userId, type, title, message, read, createdAt', relations: 'User (CASCADE)' },
    { name: 'PushSubscription', cols: 7, keys: 'id, userId, endpoint, p256dh, auth', relations: 'User (CASCADE)' },
    { name: 'ChatRoom', cols: 5, keys: 'id, name, caseId, type', relations: 'Members, Messages' },
    { name: 'ChatMember', cols: 5, keys: 'id, roomId, userId, joinedAt', relations: 'ChatRoom, User' },
    { name: 'ChatMessage', cols: 7, keys: 'id, roomId, senderId, text, timestamp', relations: 'ChatRoom, User' },
    { name: 'ContactMessage', cols: 8, keys: 'id, name, email, subject, message, read, replied', relations: 'None' },
    { name: 'FirmSettings', cols: 12, keys: 'id (SINGLETON), firmName, licenseNumber, taxNumber', relations: 'None' },
    { name: 'Service', cols: 9, keys: 'id, order, titleAr, titleEn, icon, active', relations: 'None' },
  ];

  const endpointsList = [
    { method: 'GET', path: '/api/public/about', auth: 'Public', desc: 'Firm profile & certified partner roster' },
    { method: 'GET', path: '/api/public/services', auth: 'Public', desc: 'Active legal practice catalog' },
    { method: 'POST', path: '/api/public/contact', auth: 'Public (5/min rate limit)', desc: 'Submit website consultation inquiry' },
    { method: 'POST', path: '/api/auth/login', auth: 'Public (10/15m limit)', desc: 'User credential validation & JWT issuance' },
    { method: 'POST', path: '/api/auth/register', auth: 'Public', desc: 'Client account onboarding' },
    { method: 'GET', path: '/api/auth/me', auth: 'Authenticated', desc: 'Current user session profile & permissions' },
    { method: 'GET|POST|PUT|DELETE', path: '/api/cases', auth: 'User (Role Filtered)', desc: 'Caseload CRUD with strict RBAC' },
    { method: 'GET|POST|PUT|DELETE', path: '/api/clients', auth: 'Admin | Secretary', desc: 'Client directory management' },
    { method: 'GET|POST|DELETE', path: '/api/documents', auth: 'Authenticated', desc: 'Encrypted document repository' },
    { method: 'GET|POST|PATCH', path: '/api/invoices', auth: 'Admin | Accountant', desc: 'Tax invoicing & payment settlement' },
    { method: 'GET|POST|PATCH', path: '/api/appointments', auth: 'Authenticated', desc: 'Court hearings & consultations schedule' },
    { method: 'GET|POST|PATCH|DELETE', path: '/api/tasks', auth: 'Authenticated', desc: 'Workflow deliverables backlog' },
    { method: 'GET|POST', path: '/api/chat', auth: 'Authenticated', desc: 'Case channel real-time communications' },
    { method: 'GET', path: '/health/deep', auth: 'Monitoring', desc: 'PostgreSQL pool, Redis, and disk probe' },
  ];

  const rlsMatrix = [
    { entity: 'Case', admin: 'ALL', lawyer: 'WHERE lawyerId = self', assistant: 'WHERE assigned', accountant: 'SELECT only', secretary: 'SELECT only', client: 'WHERE clientId = self' },
    { entity: 'Client', admin: 'ALL', lawyer: 'SELECT (own matters)', assistant: 'SELECT (own matters)', accountant: 'SELECT (with bills)', secretary: 'ALL (read+create)', client: 'SELECT (own record)' },
    { entity: 'Invoice', admin: 'ALL', lawyer: 'SELECT (own matters)', assistant: 'NO ACCESS', accountant: 'ALL (CRUD)', secretary: 'NO ACCESS', client: 'WHERE clientId = self' },
    { entity: 'Document', admin: 'ALL', lawyer: 'WHERE case.lawyerId = self', assistant: 'WHERE uploaded or assigned', accountant: 'NO ACCESS', secretary: 'SELECT only', client: 'WHERE case.clientId = self' },
    { entity: 'Appointment', admin: 'ALL', lawyer: 'WHERE lawyerId = self', assistant: 'WHERE assigned', accountant: 'SELECT only', secretary: 'ALL (read+create)', client: 'WHERE clientId = self' },
    { entity: 'AuditLog', admin: 'SELECT ALL', lawyer: 'NO ACCESS', assistant: 'NO ACCESS', accountant: 'NO ACCESS', secretary: 'NO ACCESS', client: 'NO ACCESS' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase">PostgreSQL 16 · Prisma ORM</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ISO 27001 Verified</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'ar' ? 'هندسة النظام ومخطط قاعدة البيانات الكامل' : 'System Architecture & Database Blueprint'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {locale === 'ar'
              ? 'التوثيق المكتمل: 17 نموذج Prisma، 7 تعدادات Enum، 45 فهرساً، 67 نقطة API، ومصفوفة RLS'
              : 'Enterprise spec: 17 Prisma models, 7 enums, 45 indexes, 67 endpoints, and Row-Level Security'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-xl text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('erd')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'erd' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {locale === 'ar' ? 'مخطط العلاقات ERD' : 'ERD Diagram'}
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'models' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {locale === 'ar' ? 'جداول Prisma (17)' : 'Prisma Models (17)'}
        </button>
        <button
          onClick={() => setActiveTab('rls')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'rls' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {locale === 'ar' ? 'مصفوفة الأمان RLS' : 'RLS Security Matrix'}
        </button>
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'endpoints' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {locale === 'ar' ? 'دليل الـ API (67)' : 'Endpoints (67)'}
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'performance' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {locale === 'ar' ? 'مخطط الأداء والفهارس' : 'Performance SLAs'}
        </button>
      </div>

      {/* Tab: ERD Visualizer */}
      {activeTab === 'erd' && (
        <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-6 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <span className="text-amber-400 font-bold">PostgreSQL 16 Entity-Relationship Diagram (ERD)</span>
            <span className="text-slate-500">17 Models · 20 Foreign Key Constraints · 45 Composite Indexes</span>
          </div>
          <pre className="text-slate-300 font-mono text-[11px] whitespace-pre" dir="ltr">
{`+----------------+        1:N (CASCADE)        +----------------+
|      User      |---------------------------->|    Session     |
| (PK: id, email)|                             | (PK: id, token)|
+----------------+                             +----------------+
      |      |
      | 1:N  | 1:N (lawyer)
      |      v
      |   +-------------------+        1:N (RESTRICT)        +-------------------+
      |   |       Case        |<-----------------------------|      Client       |
      |   | (PK: id, caseNum) |                              | (PK: id, natId)   |
      |   +-------------------+                              +-------------------+
      |      |        |        \\                                    | 1:N
      |      |        |         \\ 1:N                               v
      |      | 1:N    | 1:N      +-------------------------------->+-------------------+
      |      v        v                                            |      Invoice      |
      |   +----------+  +-------------+                            | (PK: id, number)  |
      |   | Document |  | Appointment |                            +-------------------+
      |   +----------+  +-------------+
      |
      | 1:N (assignee)
      v
+----------------+        1:N (CASCADE)        +-------------------+
|      Task      |<----------------------------|    AuditLog       |
| (PK: id, title)|                             | (Append-Only Log) |
+----------------+                             +-------------------+
      |
      v
+----------------+        1:N                  +-------------------+
|    ChatRoom    |---------------------------->|    ChatMessage    |
+----------------+                             +-------------------+`}
          </pre>
        </div>
      )}

      {/* Tab: 17 Prisma Models */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelsList.map((m) => (
            <div key={m.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 font-mono">model {m.name}</span>
                <span className="text-[10px] text-slate-400 tabular-nums">{m.cols} columns</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Keys & Indexes:</span>
                  <span className="text-slate-700 dark:text-slate-300">{m.keys}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Relations:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{m.relations}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: RLS Matrix */}
      {activeTab === 'rls' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 overflow-x-auto">
          <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'مصفوفة الأمان على مستوى الصف (Row-Level Security RLS)' : 'Row-Level Security Enforcement Matrix'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {locale === 'ar' ? 'تُطبق السياسات عبر Prisma Client Extensions وميدلوير المصادقة تلقائياً' : 'Automated enforcement at Prisma middleware layer'}
            </p>
          </div>

          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 px-3 text-start">Entity</th>
                <th className="py-2.5 px-3 text-start">Admin</th>
                <th className="py-2.5 px-3 text-start">Lawyer</th>
                <th className="py-2.5 px-3 text-start">Legal Assistant</th>
                <th className="py-2.5 px-3 text-start">Accountant</th>
                <th className="py-2.5 px-3 text-start">Secretary</th>
                <th className="py-2.5 px-3 text-start">Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {rlsMatrix.map((row) => (
                <tr key={row.entity} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-sans">{row.entity}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">{row.admin}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{row.lawyer}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.assistant}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.accountant}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.secretary}</td>
                  <td className="py-2.5 px-3 text-amber-600 font-semibold">{row.client}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 overflow-x-auto">
          <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {locale === 'ar' ? 'فهرس نقاط النهاية للـ API (عينة من 67 Endpoint)' : 'API Endpoints Directory (Sample of 67 Endpoints)'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Node.js + Express + Zod</span>
          </div>

          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 text-start font-mono">Method</th>
                <th className="py-2.5 px-3 text-start font-mono">Endpoint Path</th>
                <th className="py-2.5 px-3 text-start">Auth Scope</th>
                <th className="py-2.5 px-3 text-start">Operation Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {endpointsList.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{ep.method}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-600 dark:text-amber-400">{ep.path}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-medium">{ep.auth}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Performance SLAs */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{locale === 'ar' ? 'أهداف استجابة الاستعلامات (SLA)' : 'Query Performance SLAs'}</span>
            </h3>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span>Simple SELECT (PK):</span>
                <span className="text-emerald-600 font-bold">&lt; 10ms</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span>Paginated Data Tables:</span>
                <span className="text-emerald-600 font-bold">&lt; 50ms</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span>3-Table Join (Case+Client+User):</span>
                <span className="text-emerald-600 font-bold">&lt; 80ms</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span>Dashboard Stats (Redis Cached):</span>
                <span className="text-emerald-600 font-bold">&lt; 150ms</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span>Unread Notifications Count:</span>
                <span className="text-emerald-600 font-bold">&lt; 5ms</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>{locale === 'ar' ? 'استراتيجيات التحسين والاعتمادية' : 'Optimization & High Availability'}</span>
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>45 فهارس مركبة (Composite Indexes):</strong> تغطي حقول الاستعلامات السريعة (userId, status, dateTime, dueDate).</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Connection Pooling:</strong> حمام اتصالات 10-20 اتصال مع استرجاع تلقائي خلال 60 دقيقة (RTO).</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>نسخ احتياطي مجدول:</strong> يومي (30 يوماً)، أسبوعي (6 أشهر)، وشهري (سنتين) مشفر بـ AES-256.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
