/**
 * Resilient API Client with In-Memory Token, Automatic 401 Refresh,
 * Fingerprint Injection, and Retry Queue.
 */

import { generateFingerprint } from './fingerprint';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  requiresOtp?: boolean;
  pendingSessionToken?: string;
}

class ApiClient {
  private baseUrl: string;
  private inMemoryToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: any) => void;
  }> = [];

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.inMemoryToken = token;
  }

  getToken(): string | null {
    return this.inMemoryToken;
  }

  private async getHeaders(customHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const fingerprint = await generateFingerprint();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Fingerprint': fingerprint,
      ...customHeaders,
    };

    if (this.inMemoryToken) {
      headers['Authorization'] = `Bearer ${this.inMemoryToken}`;
    }

    return headers;
  }

  /**
   * Automatic Token Refresh handling queue for concurrent 401 requests
   */
  private async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const fingerprint = await generateFingerprint();
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Fingerprint': fingerprint,
        },
      });

      if (!res.ok) {
        throw new Error('Refresh token expired or invalid');
      }

      const json = await res.json();
      const newToken = json.data?.accessToken;
      if (!newToken) {
        throw new Error('No access token returned in refresh');
      }

      this.setToken(newToken);

      // Resolve all queued requests with new token
      this.refreshQueue.forEach((q) => q.resolve(newToken));
      this.refreshQueue = [];

      return newToken;
    } catch (error) {
      this.setToken(null);
      this.refreshQueue.forEach((q) => q.reject(error));
      this.refreshQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async get<T>(endpoint: string, ttlMs: number = 0): Promise<T> {
    const cacheKey = `GET:${endpoint}`;

    if (ttlMs > 0 && memoryCache.has(cacheKey)) {
      const entry = memoryCache.get(cacheKey)!;
      if (Date.now() - entry.timestamp < ttlMs) {
        return entry.data as T;
      }
    }

    let headers = await this.getHeaders();
    let res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    // Handle 401 with auto-refresh (except for auth endpoints)
    if (res.status === 401 && !endpoint.includes('/api/auth/')) {
      try {
        const newToken = await this.refreshToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers,
          credentials: 'include',
        });
      } catch {
        // Refresh failed, let error bubble or return cached
        if (memoryCache.has(cacheKey)) {
          return memoryCache.get(cacheKey)!.data as T;
        }
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP error ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const payload = json.data !== undefined ? json.data : json;

    if (ttlMs > 0) {
      memoryCache.set(cacheKey, { data: payload, timestamp: Date.now() });
    }

    return payload as T;
  }

  async post<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    let headers = await this.getHeaders({ 'Content-Type': 'application/json' });

    try {
      let res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      // Auto-refresh for 401 on non-auth routes
      if (res.status === 401 && !endpoint.includes('/api/auth/')) {
        try {
          const newToken = await this.refreshToken();
          headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(body),
          });
        } catch {
          return {
            success: false,
            error: 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً',
            code: 'SESSION_EXPIRED',
          };
        }
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: json.message || `Error ${res.status}`,
          code: json.code,
          data: json.data,
          requiresOtp: json.data?.requiresOtp,
          pendingSessionToken: json.data?.pendingSessionToken,
        };
      }

      return {
        success: true,
        data: json.data,
        message: json.message,
        code: json.code,
        requiresOtp: json.data?.requiresOtp,
        pendingSessionToken: json.data?.pendingSessionToken,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network request failed',
      };
    }
  }

  clearCache(keyPrefix?: string) {
    if (keyPrefix) {
      for (const key of memoryCache.keys()) {
        if (key.includes(keyPrefix)) {
          memoryCache.delete(key);
        }
      }
    } else {
      memoryCache.clear();
    }
  }
}

export const api = new ApiClient('');
