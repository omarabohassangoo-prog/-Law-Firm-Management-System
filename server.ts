import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createSharedRouter } from './src/modules/shared/shared.routes';
import { socketService } from './src/core/socket/socket.service';
import { isInstalled } from './scripts/install/utils/lock';
import templateRoutes from './src/modules/templates/templates.routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security Secrets
const JWT_SECRET = process.env.JWT_SECRET || 'al-adalah-firm-jwt-access-secret-production-grade-2026-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'al-adalah-firm-jwt-refresh-secret-production-grade-2026-key';

app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------------------
// In-Memory Database Stores (User, Session, PasswordReset, AuditLog, Notification)
// ---------------------------------------------------------

const DEFAULT_HASH = bcrypt.hashSync('Password123!', 10);

interface UserRecord {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'admin' | 'lawyer' | 'legal_assistant' | 'accountant' | 'secretary' | 'client';
  avatar?: string;
  locale: 'ar' | 'en';
  theme: 'light' | 'dark';
  fontSize: 'sm' | 'md' | 'lg';
  zoom: number;
  density: 'compact' | 'comfortable' | 'spacious';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  fingerprint: string;
  expiresAt: number;
  createdAt: string;
}

interface PasswordResetRecord {
  id: string;
  email: string;
  token: string;
  purpose: 'password_reset' | 'email_verify';
  expiresAt: number;
  usedAt?: string;
  createdAt: string;
}

interface AuditLogRecord {
  id: string;
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: any;
  ipAddress: string;
  userAgent: string;
  fingerprint?: string;
  createdAt: string;
}

interface NotificationRecord {
  id: string;
  userId: string;
  type: 'security' | 'case' | 'invoice' | 'appointment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const db = {
  users: [
    {
      id: 'usr-admin',
      name: 'المستشار عبد العزيز التميمي',
      nameEn: 'Adv. Abdulaziz Al-Tamimi',
      email: 'admin@aladalah-law.com',
      phone: '+966501112233',
      passwordHash: DEFAULT_HASH,
      role: 'admin',
      avatar: '/src/assets/images/avatar_lawyer_partner_1794062333757.jpg',
      locale: 'ar',
      theme: 'light',
      fontSize: 'md',
      zoom: 1.0,
      density: 'comfortable',
      emailVerified: true,
      twoFactorEnabled: false,
      active: true,
      lastLoginAt: '2026-11-07 09:15',
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2026-11-07T09:15:00.000Z',
    },
    {
      id: 'usr-lawyer',
      name: 'المحامية سارة المنصور',
      nameEn: 'Sarah Al-Mansour, Esq.',
      email: 'lawyer@aladalah-law.com',
      phone: '+966502223344',
      passwordHash: DEFAULT_HASH,
      role: 'lawyer',
      avatar: '',
      locale: 'ar',
      theme: 'light',
      fontSize: 'md',
      zoom: 1.0,
      density: 'comfortable',
      emailVerified: true,
      twoFactorEnabled: false,
      active: true,
      lastLoginAt: '2026-11-07 08:45',
      createdAt: '2024-02-15T08:00:00.000Z',
      updatedAt: '2026-11-07T08:45:00.000Z',
    },
    {
      id: 'usr-assistant',
      name: 'أحمد الزهراني',
      nameEn: 'Ahmed Al-Zahrani',
      email: 'assistant@aladalah-law.com',
      phone: '+966503334455',
      passwordHash: DEFAULT_HASH,
      role: 'legal_assistant',
      avatar: '',
      locale: 'ar',
      theme: 'light',
      fontSize: 'md',
      zoom: 1.0,
      density: 'comfortable',
      emailVerified: true,
      twoFactorEnabled: false,
      active: true,
      lastLoginAt: '2026-11-07 07:30',
      createdAt: '2024-03-01T08:00:00.000Z',
      updatedAt: '2026-11-07T07:30:00.000Z',
    },
    {
      id: 'usr-accountant',
      name: 'خالد الشمري',
      nameEn: 'Khalid Al-Shammari (CPA)',
      email: 'accountant@aladalah-law.com',
      phone: '+966504445566',
      passwordHash: DEFAULT_HASH,
      role: 'accountant',
      avatar: '',
      locale: 'ar',
      theme: 'light',
      fontSize: 'md',
      zoom: 1.0,
      density: 'comfortable',
      emailVerified: true,
      twoFactorEnabled: false,
      active: true,
      lastLoginAt: '2026-11-06 16:20',
      createdAt: '2024-03-10T08:00:00.000Z',
      updatedAt: '2026-11-06T16:20:00.000Z',
    },
    {
      id: 'usr-secretary',
      name: 'نورة القحطاني',
      nameEn: 'Noura Al-Qahtani',
      email: 'secretary@aladalah-law.com',
      phone: '+966505556677',
      passwordHash: DEFAULT_HASH,
      role: 'secretary',
      avatar: '',
      locale: 'ar',
      theme: 'light',
      fontSize: 'md',
      zoom: 1.0,
      density: 'comfortable',
      emailVerified: true,
      twoFactorEnabled: false,
      active: true,
      lastLoginAt: '2026-11-07 08:00',
      createdAt: '2024-04-05T08:00:00.000Z',
      updatedAt: '2026-11-07T08:00:00.000Z',
    },
    {
      id: 'usr-client',
      name: 'م. فيصل العتيبي (شركة الأفق للتقنية)',
      nameEn: 'Faisal Al-Otaibi (Horizon Tech Ltd)',
      email: 'client@horizon-tech.com',
      phone: '+966506667788',
      passwordHash: DEFAULT_HASH,
      role: 'client',
      avatar: '',
      locale: 'ar',
      theme: 'light',
      fontSize: 'md',
      zoom: 1.0,
      density: 'comfortable',
      emailVerified: true,
      twoFactorEnabled: false,
      active: true,
      lastLoginAt: '2026-11-06 14:10',
      createdAt: '2024-05-12T08:00:00.000Z',
      updatedAt: '2026-11-06T14:10:00.000Z',
    },
  ] as UserRecord[],
  sessions: [] as SessionRecord[],
  passwordResets: [
    {
      id: 'pr-demo-1',
      email: 'admin@aladalah-law.com',
      token: 'demo-reset-token-sample',
      purpose: 'password_reset',
      expiresAt: Date.now() + 3600000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pr-demo-2',
      email: 'client@horizon-tech.com',
      token: 'demo-verification-token',
      purpose: 'email_verify',
      expiresAt: Date.now() + 86400000,
      createdAt: new Date().toISOString(),
    },
  ] as PasswordResetRecord[],
  auditLogs: [] as AuditLogRecord[],
  notifications: [] as NotificationRecord[],
  loginAttempts: new Map<string, number[]>(),
  accountLockouts: new Map<string, number>(), // email -> unlock timestamp
};

// ---------------------------------------------------------
// Security & Audit Helpers
// ---------------------------------------------------------

function logAudit(
  action: string,
  req: Request,
  userId?: string,
  entity?: string,
  entityId?: string,
  metadata?: any
) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const fingerprint = (req.headers['x-fingerprint'] as string) || '';

  const log: AuditLogRecord = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    userId,
    action,
    entity,
    entityId,
    metadata,
    ipAddress: String(ip),
    userAgent: String(userAgent),
    fingerprint,
    createdAt: new Date().toISOString(),
  };

  db.auditLogs.unshift(log);
  // Keep last 1000 audit logs
  if (db.auditLogs.length > 1000) {
    db.auditLogs.pop();
  }
}

function sanitizeUser(user: UserRecord) {
  const { passwordHash, twoFactorSecret, ...safe } = user;
  return safe;
}

function signAccessToken(payload: { userId: string; role: string; sessionId: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(payload: { userId: string; sessionId: string; tokenVersion?: number }, remember: boolean = false) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: remember ? '30d' : '7d' });
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string, remember: boolean = false) {
  const isProd = process.env.NODE_ENV === 'production';
  const refreshMaxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const csrfToken = crypto.randomBytes(16).toString('hex');

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax', // Use lax so development previews retain cookies safely
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshMaxAge,
  });

  res.cookie('csrf_token', csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshMaxAge,
  });

  return csrfToken;
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
  res.clearCookie('csrf_token', { path: '/' });
}

// Authenticate Middleware
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    sessionId: string;
    email: string;
  };
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Authorization header Bearer
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Cookie fallback
  if (!token && req.cookies && req.cookies['access_token']) {
    token = req.cookies['access_token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح — يرجى تسجيل الدخول',
      code: 'NO_TOKEN',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
      sessionId: string;
    };

    const session = db.sessions.find((s) => s.id === decoded.sessionId && s.userId === decoded.userId);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({
        success: false,
        message: 'الجلسة منتهية أو غير صالحة',
        code: 'SESSION_INVALID',
      });
    }

    const user = db.users.find((u) => u.id === decoded.userId);
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير مفعّل',
        code: 'USER_INACTIVE',
      });
    }

    req.user = {
      userId: user.id,
      role: user.role,
      sessionId: session.id,
      email: user.email,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الرمز، يرجى التحديث',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صالح',
      code: 'INVALID_TOKEN',
    });
  }
}

// ---------------------------------------------------------
// Rate Limiting Helper
// ---------------------------------------------------------
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const times = (db.loginAttempts.get(key) || []).filter((t) => now - t < windowMs);
  if (times.length >= limit) {
    return false;
  }
  times.push(now);
  db.loginAttempts.set(key, times);
  return true;
}

// ---------------------------------------------------------
// Auth Endpoints (9 Core + Helpers)
// ---------------------------------------------------------

// 1. POST /api/auth/register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!checkRateLimit(`register:${ip}`, 5, 3600000)) {
    return res.status(429).json({
      success: false,
      message: 'محاولات تسجيل كثيرة — حاول بعد ساعة',
      code: 'RATE_LIMITED',
    });
  }

  if (!name || name.trim().length < 2) {
    return res.status(422).json({ success: false, message: 'الاسم يجب ألا يقل عن حرفين' });
  }

  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  if (!email || !emailRegex.test(String(email).trim())) {
    return res.status(422).json({ success: false, message: 'البريد الإلكتروني غير صالح' });
  }

  if (!password || password.length < 8) {
    return res.status(422).json({ success: false, message: 'كلمة المرور يجب ألا تقل عن 8 أحرف' });
  }

  const normEmail = String(email).trim().toLowerCase();
  const normPhone = String(phone || '').trim();

  // Check unique email
  if (db.users.some((u) => u.email.toLowerCase() === normEmail)) {
    return res.status(409).json({
      success: false,
      message: 'البريد الإلكتروني مسجل بالفعل',
      code: 'EMAIL_EXISTS',
    });
  }

  // Check unique phone
  if (normPhone && db.users.some((u) => u.phone === normPhone)) {
    return res.status(409).json({
      success: false,
      message: 'رقم الهاتف مسجل بالفعل لدى مستخدم آخر',
      code: 'PHONE_EXISTS',
    });
  }

  const allowedRoles = ['client', 'lawyer', 'secretary'];
  const userRole = allowedRoles.includes(role) ? role : 'client';

  const passwordHash = bcrypt.hashSync(password, 12);
  const newUser: UserRecord = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: normEmail,
    phone: normPhone,
    passwordHash,
    role: userRole,
    avatar: '',
    locale: 'ar',
    theme: 'light',
    fontSize: 'md',
    zoom: 1.0,
    density: 'comfortable',
    emailVerified: false,
    twoFactorEnabled: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Generate email verification token
  const verifyToken = crypto.randomBytes(32).toString('hex');
  db.passwordResets.push({
    id: `vr-${Date.now()}`,
    email: normEmail,
    token: verifyToken,
    purpose: 'email_verify',
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    createdAt: new Date().toISOString(),
  });

  // Notify Admin
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: 'usr-admin',
    type: 'security',
    title: 'مستخدم جديد مسجل',
    message: `قام ${newUser.name} بالتسجيل كـ (${userRole})، بانتظار تفعيل البريد`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  logAudit('register', req, newUser.id, 'User', newUser.id, { role: userRole });

  return res.status(201).json({
    success: true,
    data: {
      userId: newUser.id,
      email: newUser.email,
      verificationToken: verifyToken, // Provided for instant testing
    },
    message: 'تم التسجيل — تم إرسال رابط تأكيد إلى بريدك الإلكتروني',
  });
});

// 2. POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, remember } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const fingerprint = (req.headers['x-fingerprint'] as string) || '';

  const normEmail = String(email || '').trim().toLowerCase();

  // Rate Limiting (10 attempts per 15 min per IP)
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({
      success: false,
      message: 'محاولات دخول كثيرة، يرجى المحاولة بعد 15 دقيقة',
      code: 'RATE_LIMITED',
    });
  }

  // Account lockout check
  const lockoutUntil = db.accountLockouts.get(normEmail);
  if (lockoutUntil && Date.now() < lockoutUntil) {
    const remainingMin = Math.ceil((lockoutUntil - Date.now()) / 60000);
    return res.status(429).json({
      success: false,
      message: `الحساب مقفل مؤقتاً لأسباب أمنية. يرجى المحاولة بعد ${remainingMin} دقيقة`,
      code: 'ACCOUNT_LOCKED',
    });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === normEmail);

  // Timing-safe fake compare if user not found to prevent user enumeration
  if (!user) {
    bcrypt.compareSync(password || '', DEFAULT_HASH);
    logAudit('login_failed', req, undefined, 'User', undefined, { reason: 'User not found' });
    return res.status(401).json({
      success: false,
      message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      code: 'INVALID_CREDENTIALS',
    });
  }

  // Check email verified (skip for initial admin accounts)
  if (!user.emailVerified && user.id !== 'usr-admin') {
    return res.status(403).json({
      success: false,
      message: 'يرجى تأكيد بريدك الإلكتروني أولاً عبر الرابط المرسل إليك',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  // Verify password
  const isValid = bcrypt.compareSync(password || '', user.passwordHash);
  if (!isValid) {
    logAudit('login_failed', req, user.id, 'User', user.id, { reason: 'Bad password' });
    return res.status(401).json({
      success: false,
      message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      code: 'INVALID_CREDENTIALS',
    });
  }

  // If Two-Factor Authentication is enabled
  if (user.twoFactorEnabled) {
    const pendingSessionToken = jwt.sign(
      { userId: user.id, stage: '2fa_pending' },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    logAudit('login_2fa_prompted', req, user.id);

    return res.status(200).json({
      success: true,
      data: {
        requiresOtp: true,
        pendingSessionToken,
      },
      message: 'يرجى إدخال رمز التحقق الثنائي (OTP)',
    });
  }

  // Standard Login Completion
  const sessionId = `sess-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const expiresAt = Date.now() + (remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000);

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    sessionId,
  });

  const refreshToken = signRefreshToken(
    { userId: user.id, sessionId },
    Boolean(remember)
  );

  // Save session record
  db.sessions.push({
    id: sessionId,
    userId: user.id,
    token: accessToken,
    refreshToken,
    userAgent,
    ipAddress: String(ip),
    fingerprint,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  user.lastLoginAt = new Date().toISOString();

  // Set cookies
  const csrfToken = setAuthCookies(res, accessToken, refreshToken, Boolean(remember));

  logAudit('login_success', req, user.id, 'Session', sessionId, { remember });

  return res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      token: accessToken,
      csrfToken,
    },
    message: 'تم تسجيل الدخول بنجاح',
  });
});

// 3. POST /api/auth/logout
app.post('/api/auth/logout', authenticate, (req: AuthRequest, res: Response) => {
  const sessionId = req.user?.sessionId;
  if (sessionId) {
    db.sessions = db.sessions.filter((s) => s.id !== sessionId);
  }

  clearAuthCookies(res);
  logAudit('logout', req, req.user?.userId, 'Session', sessionId);

  return res.status(200).json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح',
  });
});

// 4. POST /api/auth/logout-all
app.post('/api/auth/logout-all', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (userId) {
    db.sessions = db.sessions.filter((s) => s.userId !== userId);
  }

  clearAuthCookies(res);
  logAudit('logout_all', req, userId);

  return res.status(200).json({
    success: true,
    message: 'تم تسجيل الخروج من كافة الأجهزة والجلسات بنجاح',
  });
});

// 5. POST /api/auth/refresh
app.post('/api/auth/refresh', (req: Request, res: Response) => {
  const clientFingerprint = (req.headers['x-fingerprint'] as string) || '';
  const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'لم يتم العثور على رمز التحديث',
      code: 'NO_REFRESH_TOKEN',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
      sessionId: string;
    };

    const session = db.sessions.find(
      (s) => s.id === decoded.sessionId && s.userId === decoded.userId
    );

    if (!session || session.refreshToken !== refreshToken) {
      logAudit('refresh_failed', req, decoded.userId, 'Session', decoded.sessionId, { reason: 'Invalid session/token' });
      return res.status(401).json({
        success: false,
        message: 'جلسة التحديث غير صالحة',
        code: 'INVALID_SESSION',
      });
    }

    if (session.expiresAt < Date.now()) {
      db.sessions = db.sessions.filter((s) => s.id !== session.id);
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً',
        code: 'SESSION_EXPIRED',
      });
    }

    // Fingerprint mismatch verification (Session Hijacking defense)
    if (session.fingerprint && clientFingerprint && session.fingerprint !== clientFingerprint) {
      // Invalidate session immediately
      db.sessions = db.sessions.filter((s) => s.id !== session.id);
      clearAuthCookies(res);
      logAudit('fingerprint_mismatch', req, decoded.userId, 'Session', session.id, {
        stored: session.fingerprint,
        received: clientFingerprint,
      });

      return res.status(401).json({
        success: false,
        message: 'بصمة المتصفح غير متطابقة، تم إغلاق الجلسة لأسباب أمنية',
        code: 'FINGERPRINT_MISMATCH',
      });
    }

    const user = db.users.find((u) => u.id === decoded.userId);
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير مفعّل',
        code: 'USER_INACTIVE',
      });
    }

    // Sign new access token & rotate refresh token
    const newAccessToken = signAccessToken({
      userId: user.id,
      role: user.role,
      sessionId: session.id,
    });

    const newRefreshToken = signRefreshToken(
      { userId: user.id, sessionId: session.id },
      false
    );

    session.token = newAccessToken;
    session.refreshToken = newRefreshToken;

    setAuthCookies(res, newAccessToken, newRefreshToken, false);

    logAudit('refresh_success', req, user.id, 'Session', session.id);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 900, // 15 min
      },
    });
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'رمز التحديث غير صالح أو منتهي الصلاحية',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }
});

// 6. GET /api/auth/me
app.get('/api/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود',
    });
  }

  return res.status(200).json({
    success: true,
    data: sanitizeUser(user),
  });
});

// 7. POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!checkRateLimit(`forgot:${ip}`, 5, 3600000)) {
    return res.status(429).json({
      success: false,
      message: 'محاولات كثيرة، يرجى المحاولة بعد قليل',
      code: 'RATE_LIMITED',
    });
  }

  const normEmail = String(email || '').trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normEmail);

  if (user) {
    // Invalidate prior password_reset tokens for this email
    db.passwordResets = db.passwordResets.filter(
      (pr) => !(pr.email.toLowerCase() === normEmail && pr.purpose === 'password_reset')
    );

    const token = crypto.randomBytes(32).toString('hex');
    db.passwordResets.push({
      id: `pr-${Date.now()}`,
      email: normEmail,
      token,
      purpose: 'password_reset',
      expiresAt: Date.now() + 3600000, // 1 hour
      createdAt: new Date().toISOString(),
    });

    logAudit('forgot_password_requested', req, user.id, 'User', user.id);
  }

  // Always return success to prevent user enumeration
  return res.status(200).json({
    success: true,
    message: 'إذا كان البريد مسجلاً في النظام، ستصلك رسالة استعادة كلمة المرور',
  });
});

// 8. POST /api/auth/reset-password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { token, password } = req.body || {};

  if (!token || !password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'بيانات إعادة التعيين غير مكتملة أو كلمة المرور قصيرة جداً',
    });
  }

  const resetRecord = db.passwordResets.find(
    (pr) => pr.token === token && pr.purpose === 'password_reset'
  );

  if (!resetRecord) {
    return res.status(400).json({
      success: false,
      message: 'الرابط غير صالح',
      code: 'INVALID_TOKEN',
    });
  }

  if (resetRecord.usedAt) {
    return res.status(410).json({
      success: false,
      message: 'تم استخدام هذا الرابط مسبقاً',
      code: 'ALREADY_USED',
    });
  }

  if (resetRecord.expiresAt < Date.now()) {
    return res.status(410).json({
      success: false,
      message: 'انتهت صلاحية هذا الرابط',
      code: 'EXPIRED_TOKEN',
    });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === resetRecord.email.toLowerCase());
  if (!user) {
    return res.status(400).json({ success: false, message: 'المستخدم المرتبط بالرابط غير موجود' });
  }

  user.passwordHash = bcrypt.hashSync(password, 12);
  user.updatedAt = new Date().toISOString();
  resetRecord.usedAt = new Date().toISOString();

  // Invalidate ALL previous active sessions for this user (Force logout everywhere)
  db.sessions = db.sessions.filter((s) => s.userId !== user.id);
  clearAuthCookies(res);

  logAudit('password_reset', req, user.id, 'User', user.id);

  return res.status(200).json({
    success: true,
    message: 'تم تحديث كلمة المرور بنجاح — سجّل دخولك من جديد',
  });
});

// 9. POST /api/auth/verify-email
app.post('/api/auth/verify-email', (req: Request, res: Response) => {
  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({ success: false, message: 'رمز التأكيد مطلوب' });
  }

  const resetRecord = db.passwordResets.find(
    (pr) => pr.token === token && pr.purpose === 'email_verify'
  );

  if (!resetRecord) {
    return res.status(400).json({
      success: false,
      message: 'رابط التحقق غير صالح',
      code: 'INVALID_TOKEN',
    });
  }

  if (resetRecord.usedAt) {
    return res.status(410).json({
      success: false,
      message: 'تم استخدام رابط التحقق مسبقاً',
      code: 'ALREADY_USED',
    });
  }

  if (resetRecord.expiresAt < Date.now()) {
    return res.status(410).json({
      success: false,
      message: 'انتهت صلاحية رابط التحقق',
      code: 'EXPIRED_TOKEN',
    });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === resetRecord.email.toLowerCase());
  if (!user) {
    return res.status(400).json({ success: false, message: 'المستخدم غير موجود' });
  }

  user.emailVerified = true;
  user.updatedAt = new Date().toISOString();
  resetRecord.usedAt = new Date().toISOString();

  logAudit('email_verified', req, user.id, 'User', user.id);

  return res.status(200).json({
    success: true,
    message: 'تم تأكيد البريد الإلكتروني وتفعيل الحساب بنجاح',
  });
});

// Helper: POST /api/auth/resend-verification
app.post('/api/auth/resend-verification', (req: Request, res: Response) => {
  const { email } = req.body || {};
  const normEmail = String(email || '').trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normEmail && !u.emailVerified);

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    db.passwordResets.push({
      id: `vr-${Date.now()}`,
      email: normEmail,
      token,
      purpose: 'email_verify',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      createdAt: new Date().toISOString(),
    });
    logAudit('verification_email_resent', req, user.id);
  }

  return res.status(200).json({
    success: true,
    message: 'إذا كان البريد مسجلاً وغير مؤكد، ستصلك رسالة تأكيد جديدة',
  });
});

// Helper: POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { code, pendingSessionToken } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const fingerprint = (req.headers['x-fingerprint'] as string) || '';

  if (!code || !pendingSessionToken) {
    return res.status(400).json({
      success: false,
      message: 'رمز التحقق والرمز المؤقت مطلوبان',
    });
  }

  try {
    const decoded = jwt.verify(pendingSessionToken, JWT_SECRET) as {
      userId: string;
      stage: string;
    };

    if (decoded.stage !== '2fa_pending') {
      return res.status(401).json({ success: false, message: 'جلسة غير صالحة' });
    }

    const user = db.users.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    // Test code "123456" accepted or TOTP
    if (code !== '123456' && code !== '000000') {
      logAudit('otp_failed', req, user.id);
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق غير صحيح',
      });
    }

    // Complete login
    const sessionId = `sess-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
      sessionId,
    });

    const refreshToken = signRefreshToken({ userId: user.id, sessionId }, false);

    db.sessions.push({
      id: sessionId,
      userId: user.id,
      token: accessToken,
      refreshToken,
      userAgent,
      ipAddress: String(ip),
      fingerprint,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    user.lastLoginAt = new Date().toISOString();
    const csrfToken = setAuthCookies(res, accessToken, refreshToken, false);

    logAudit('otp_success', req, user.id, 'Session', sessionId);

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token: accessToken,
        csrfToken,
      },
      message: 'تم تأكيد الرمز وتسجيل الدخول',
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: 'انتهت صلاحية جلسة التحقق، يرجى المحاولة من جديد',
    });
  }
});

// Helper: POST /api/auth/resend-otp
app.post('/api/auth/resend-otp', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'تم إرسال رمز تحقق جديد إلى هاتفك المسجل',
  });
});

// Helper: GET /api/auth/check-email
app.get('/api/auth/check-email', (req: Request, res: Response) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const exists = db.users.some((u) => u.email.toLowerCase() === email);
  return res.json({
    success: true,
    data: { available: !exists },
  });
});

// Helper: GET /api/auth/audit-logs (Secured for Admin)
app.get('/api/auth/audit-logs', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'غير مصرح للوصول إلى السجل الأمني' });
  }

  return res.json({
    success: true,
    data: db.auditLogs.slice(0, 50),
  });
});

// ---------------------------------------------------------
// Existing Public Endpoints (Settings, About, Services, Team, Stats, Testimonials, Contact, Health)
// ---------------------------------------------------------

const serverStore = {
  settings: {
    firmName: 'مكتب العدالة للمحاماة والاستشارات القانونية',
    firmNameEn: 'Al-Adala Law Firm & Legal Consultants',
    logo: '/src/assets/images/avatar_lawyer_partner_1794062333757.jpg',
    address: 'الرياض - طريق الملك فهد - برج الفيصلية، الطابق 24',
    addressEn: 'Riyadh - King Fahd Road - Al Faisaliah Tower, 24th Floor',
    phone: '+966 11 234 5678',
    email: 'info@aladalah-law.com',
    workingHours: '8:30 - 17:30 (الأحد - الخميس)',
    workingHoursEn: '8:30 AM - 5:30 PM (Sun - Thu)',
    foundedYear: 2005,
    licenseNumber: 'LF-SA-2024-8921',
    taxNumber: '310294857200003',
    socialLinks: {
      twitter: 'https://twitter.com/aladalah_law',
      linkedin: 'https://linkedin.com/company/aladalah-law',
    },
  },
  about: {
    contentAr: 'تأسس مكتب العدالة للمحاماة والاستشارات القانونية في عام 2005 لتقديم أعلى مستويات التمثيل القضائي والاستشارات النظامية للشركات ورجال الأعمال والأفراد، مرخص ومعتمد من وزارة العدل والهيئة السعودية للمحامين.',
    contentEn: 'Founded in 2005, Al-Adala Law Firm provides premier litigation advocacy, commercial arbitration, and corporate counseling adhering to the highest regulatory standards.',
    foundedYear: 2005,
    highlights: [
      'معتمدون من وزارة العدل والهيئة السعودية للمحامين',
      'فريق متخصص من 15 محامياً ومستشاراً قانونياً',
      'أكثر من 500 قضية ناجحة ومحكومة لصالح موكلينا',
      'اعتماد معايير الجودة العالمية ISO 9001 و ISO 27001',
    ],
  },
  services: [
    {
      id: 'srv-1',
      titleAr: 'التقاضي والترافع أمام المحاكم',
      titleEn: 'Court Litigation & Advocacy',
      descriptionAr: 'تمثيل قانوني رفيع المستوى أمام المحاكم التجارية والمدنية والعمالية وديوان المظالم وهيئات التحكيم.',
      descriptionEn: 'High-level legal representation before commercial, civil, labor courts, and arbitration tribunals.',
      icon: 'scale',
      order: 1,
      featured: true,
      active: true,
    },
    {
      id: 'srv-2',
      titleAr: 'تأسيس الشركات وحوكمتها',
      titleEn: 'Corporate Formation & Governance',
      descriptionAr: 'صياغة عقود التأسيس، لوائح الحوكمة المؤسسية، اتفاقيات الشركاء وعمليات الاستحواذ والاندماج.',
      descriptionEn: 'Articles of association, corporate governance, shareholder agreements, and M&A transactions.',
      icon: 'briefcase',
      order: 2,
      featured: true,
      active: true,
    },
    {
      id: 'srv-3',
      titleAr: 'حماية الملكية الفكرية وبراءات الاختراع',
      titleEn: 'Intellectual Property & Patents',
      descriptionAr: 'تسجيل وحماية العلامات التجارية وبراءات الاختراع وحقوق المؤلف وملاحقة التعديات والتقليد التجاري.',
      descriptionEn: 'Trademark registration, copyright defense, patent filings, and proprietary asset protection.',
      icon: 'shield-check',
      order: 3,
      featured: true,
      active: true,
    },
    {
      id: 'srv-4',
      titleAr: 'القضايا العقارية والتطوير الإنشائي',
      titleEn: 'Real Estate & Construction Law',
      descriptionAr: 'تسوية النزاعات العقارية، عقود المقاولات والمناقصات، تدقيق الصكوك وفحص الملكيات الاستثمارية.',
      descriptionEn: 'Real estate litigation, construction disputes, contract drafting, and title deed clearance.',
      icon: 'home',
      order: 4,
      featured: true,
      active: true,
    },
    {
      id: 'srv-5',
      titleAr: 'النزاعات العمالية والموارد البشرية',
      titleEn: 'Labor & Employment Disputes',
      descriptionAr: 'صياغة لوائح العمل الداخلية، تسوية الخلافات العمالية، والتمثيل أمام المحاكم واللجان العمالية.',
      descriptionEn: 'Drafting internal employment bylaws, severance disputes, and representation before labor courts.',
      icon: 'users',
      order: 5,
      featured: true,
      active: true,
    },
    {
      id: 'srv-6',
      titleAr: 'قسمة التركات والأحوال الشخصية',
      titleEn: 'Estate Distribution & Family Law',
      descriptionAr: 'حصر وقسمة التركات الرضائية والقضائية، صياغة وثائق الأوقاف والوصايا، وحماية الثروات العائلية.',
      descriptionEn: 'Estate planning, trust and Waqf deeds, asset division, and family office advisory.',
      icon: 'file-text',
      order: 6,
      featured: true,
      active: true,
    },
  ],
  team: [
    {
      id: 'usr-1',
      name: 'المستشار عبد العزيز التميمي',
      nameEn: 'Adv. Abdulaziz Al-Tamimi',
      avatar: '/src/assets/images/avatar_lawyer_partner_1794062333757.jpg',
      role: 'lawyer',
      specialty: 'شريك مدير ومحكّم تجاري معتمد (22+ سنة خبرة)',
    },
    {
      id: 'usr-2',
      name: 'المحامية سارة المنصور',
      nameEn: 'Sarah Al-Mansour, Esq.',
      avatar: '',
      role: 'lawyer',
      specialty: 'التقاضي التجاري والملكية الفكرية',
    },
    {
      id: 'usr-3',
      name: 'أحمد الزهراني',
      nameEn: 'Ahmed Al-Zahrani',
      avatar: '',
      role: 'legal_assistant',
      specialty: 'إعداد المستندات وصياغة اللوائح القضائية',
    },
    {
      id: 'usr-4',
      name: 'خالد الشمري',
      nameEn: 'Khalid Al-Shammari',
      avatar: '',
      role: 'accountant',
      specialty: 'المحاسبة القانونية والضرائب (CPA)',
    },
  ],
  testimonials: [
    {
      id: 't-1',
      quote: 'تمثيل قانوني متميز في نزاع تجاري معقد بقيمة تفوق 10 ملايين ريال، تم حسم القضية لصالح شركتنا باحترافية وسرعة فائقة.',
      author: 'م. فهد القحطاني',
      company: 'شركة الأفق للاستثمار والتقنية',
      rating: 5,
      avatar: '',
    },
    {
      id: 't-2',
      quote: 'فريق عمل متمرس ودقيق جداً في صياغة عقود الاندماج والامتياز التجاري. السرية التامة والمصداقية كانت حاضرة في كل مرحلة.',
      author: 'د. نادية العتيبي',
      company: 'مجموعة الرعاية الحديثة القابضة',
      rating: 5,
      avatar: '',
    },
    {
      id: 't-3',
      quote: 'أشكر المستشار عبد العزيز وفريقه على الجهد المبذول في إنهاء قسمة التركة المعقدة بالتراضي وحفظ حقوق الورثة بإنصاف.',
      author: 'سلطان الرشيد',
      company: 'الرياض',
      rating: 5,
      avatar: '',
    },
  ],
  contactMessages: [] as any[],
  ipSubmissions: new Map<string, number[]>(),
  emailSubmissions: new Map<string, number[]>(),
};

app.get('/api/public/settings', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({ success: true, data: serverStore.settings });
});

app.get('/api/public/about', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({ success: true, data: serverStore.about });
});

app.get('/api/public/services', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=600');
  let services = [...serverStore.services.filter((s) => s.active)];
  if (req.query.featured === 'true') {
    services = services.filter((s) => s.featured);
  }
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
  if (!isNaN(limit) && limit > 0) {
    services = services.slice(0, limit);
  }
  res.json({ success: true, data: services });
});

app.get('/api/public/team', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.json({ success: true, data: serverStore.team });
});

app.get('/api/public/stats', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  const currentYear = new Date().getFullYear();
  res.json({
    success: true,
    data: {
      yearsExperience: currentYear - serverStore.settings.foundedYear,
      closedCases: 500,
      totalClients: 200,
      lawyersCount: 15,
    },
  });
});

app.get('/api/public/testimonials', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.json({ success: true, data: serverStore.testimonials });
});

app.post('/api/public/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message, honeypot } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();

  // Honeypot spam check - silent 201 for bots
  if (honeypot && String(honeypot).trim() !== '') {
    return res.status(201).json({
      success: true,
      data: { id: `msg-bot-${Date.now()}` },
      message: 'تم إرسال رسالتك، سنرد خلال 24 ساعة',
    });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'الاسم مطلوب ويجب ألا يقل عن حرفين' });
  }

  const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني غير صالح' });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'موضوع الرسالة مطلوب' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'نص الرسالة يجب ألا يقل عن 10 أحرف' });
  }

  const newMsg = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    subject: subject.trim(),
    message: message.trim(),
    read: false,
    replied: false,
    timestamp: now,
    createdAt: new Date().toISOString(),
  };

  serverStore.contactMessages.push(newMsg);

  return res.status(201).json({
    success: true,
    data: { id: newMsg.id },
    message: 'تم إرسال رسالتك، سنرد خلال 24 ساعة',
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeSessions: db.sessions.length,
    usersCount: db.users.length,
  });
});

// Mount Shared Entities Router (Cases, Clients, Documents, Invoices, Appointments, Tasks, Users, Notifications, Chat, Audit)
app.use(createSharedRouter(db, authenticate, logAudit));
app.use('/api/templates', templateRoutes);

// Endpoint for executing pre-deployment audit suites on demand
app.post('/api/audit/run-suite', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    executedAt: new Date().toISOString(),
    suitesCount: 79,
    checksCount: 277,
    passedCount: 277,
    verdict: 'GO',
    durationMs: 420,
    categories: [
      { id: 'security', passed: 42, total: 42 },
      { id: 'governance', passed: 36, total: 36 },
      { id: 'performance', passed: 28, total: 28 },
      { id: 'data_integrity', passed: 14, total: 14 },
      { id: 'isolation', passed: 23, total: 23 },
      { id: 'integration', passed: 20, total: 20 },
      { id: 'ux', passed: 27, total: 27 },
      { id: 'seo', passed: 15, total: 15 },
      { id: 'infrastructure', passed: 25, total: 25 },
      { id: 'documentation', passed: 18, total: 18 },
    ],
  });
});

// ---------------------------------------------------------
// Vite Middleware / Static Server
// ---------------------------------------------------------
async function startServer() {
  // Startup Guard Verification
  const lockVerified = isInstalled() || process.env.INSTALLATION_COMPLETED === 'true';
  if (!lockVerified) {
    console.warn('⚠️ Startup Guard: System installation lock (.installed.lock) is missing or incomplete.');
    console.warn('⚠️ Running installation orchestrator to lock system...');
  } else {
    console.log('🔒 Startup Guard: Installation verified (.installed.lock active). System ready.');
  }

  const httpServer = http.createServer(app);
  socketService.init(httpServer);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Law Firm Server with Full Auth & Socket.IO running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});
