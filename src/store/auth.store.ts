/**
 * Authentication Store for Law Firm Management System
 * Hybrid JWT + Session in DB: Access token is stored ONLY in memory for XSS safety.
 */

import { create } from 'zustand';
import { User, UserRole } from '../types';
import { api } from '../core/api/client';

export const ROLE_ROUTE_MAP: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  lawyer: '/dashboard/lawyer',
  legal_assistant: '/dashboard/legal_assistant',
  accountant: '/dashboard/accountant',
  secretary: '/dashboard/secretary',
  client: '/dashboard/client',
};

interface AuthState {
  user: User | null;
  token: string | null; // In-memory only
  isAuthenticated: boolean;
  loading: boolean;
  lastActivity: number;
  pendingOtpToken: string | null;
  requiresOtp: boolean;

  login: (email: string, password: string, remember?: boolean) => Promise<{
    success: boolean;
    requiresOtp?: boolean;
    message?: string;
    error?: string;
  }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: (allDevices?: boolean) => Promise<void>;
  fetchMe: () => Promise<boolean>;
  updateUser: (partial: Partial<User>) => void;
  setLastActivity: (timestamp?: number) => void;
  setPendingOtp: (token: string | null) => void;
}

// Read persisted user profile for seamless offline/rehydrate
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('aladalah_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredIsAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('aladalah_auth_state') === 'true';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: null, // Always starts null in memory on reload
  isAuthenticated: getStoredIsAuthenticated(),
  loading: false,
  lastActivity: Date.now(),
  pendingOtpToken: null,
  requiresOtp: false,

  setPendingOtp: (token: string | null) => {
    set({ pendingOtpToken: token, requiresOtp: Boolean(token) });
  },

  login: async (email, password, remember = false) => {
    set({ loading: true });
    try {
      const res = await api.post('/api/auth/login', { email, password, remember });

      if (!res.success) {
        set({ loading: false });
        return {
          success: false,
          error: res.error || 'فشل تسجيل الدخول، تأكد من صحة البيانات',
        };
      }

      // Check if 2FA OTP is required
      if (res.requiresOtp || res.data?.requiresOtp) {
        const pendingToken = res.pendingSessionToken || res.data?.pendingSessionToken;
        set({
          loading: false,
          requiresOtp: true,
          pendingOtpToken: pendingToken,
        });
        return {
          success: true,
          requiresOtp: true,
          message: 'يرجى إدخال رمز التحقق (OTP) للمتابعة',
        };
      }

      const user = res.data?.user as User;
      const token = res.data?.token as string;

      if (!user) {
        set({ loading: false });
        return { success: false, error: 'بيانات المستخدم غير مكتملة' };
      }

      // Set token in client memory only
      api.setToken(token);

      // Persist user & auth flag (never token!)
      localStorage.setItem('aladalah_auth_user', JSON.stringify(user));
      localStorage.setItem('aladalah_auth_state', 'true');

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        lastActivity: Date.now(),
        requiresOtp: false,
        pendingOtpToken: null,
      });

      return { success: true, message: 'تم تسجيل الدخول بنجاح' };
    } catch (err: any) {
      set({ loading: false });
      return { success: false, error: err?.message || 'تعذر الاتصال بخادم المصادقة' };
    }
  },

  verifyOtp: async (code: string) => {
    const { pendingOtpToken } = get();
    if (!pendingOtpToken) {
      return { success: false, error: 'لا توجد جلسة تحقق نشطة' };
    }

    set({ loading: true });
    try {
      const res = await api.post('/api/auth/verify-otp', {
        code,
        pendingSessionToken: pendingOtpToken,
      });

      if (!res.success) {
        set({ loading: false });
        return { success: false, error: res.error || 'رمز التحقق غير صحيح أو منتهي الصلاحية' };
      }

      const user = res.data?.user as User;
      const token = res.data?.token as string;

      api.setToken(token);
      localStorage.setItem('aladalah_auth_user', JSON.stringify(user));
      localStorage.setItem('aladalah_auth_state', 'true');

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        lastActivity: Date.now(),
        requiresOtp: false,
        pendingOtpToken: null,
      });

      return { success: true };
    } catch (err: any) {
      set({ loading: false });
      return { success: false, error: err?.message || 'فشل التحقق من الرمز' };
    }
  },

  logout: async (allDevices = false) => {
    try {
      const endpoint = allDevices ? '/api/auth/logout-all' : '/api/auth/logout';
      await api.post(endpoint, {});
    } catch {
      // Clear client state even if network fails
    }

    api.setToken(null);
    localStorage.removeItem('aladalah_auth_user');
    localStorage.removeItem('aladalah_auth_state');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      lastActivity: Date.now(),
      pendingOtpToken: null,
      requiresOtp: false,
    });
  },

  fetchMe: async () => {
    try {
      const data = await api.get<User>('/api/auth/me');
      if (data && data.id) {
        localStorage.setItem('aladalah_auth_user', JSON.stringify(data));
        localStorage.setItem('aladalah_auth_state', 'true');
        set({ user: data, isAuthenticated: true, lastActivity: Date.now() });
        return true;
      }
      return false;
    } catch {
      // If fetching me fails and we had authenticated flag, clear
      api.setToken(null);
      localStorage.removeItem('aladalah_auth_user');
      localStorage.removeItem('aladalah_auth_state');
      set({ user: null, token: null, isAuthenticated: false });
      return false;
    }
  },

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem('aladalah_auth_user', JSON.stringify(updated));
    set({ user: updated });
  },

  setLastActivity: (timestamp = Date.now()) => {
    set({ lastActivity: timestamp });
  },
}));
