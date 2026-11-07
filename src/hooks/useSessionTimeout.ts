/**
 * Session Timeout Hook
 * Tracks user activity and triggers warning at 28min idle and logout at 30min idle.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/auth.store';

interface SessionTimeoutOptions {
  idleTimeoutMs?: number; // Default 30 min (1,800,000 ms)
  warningBeforeMs?: number; // Default 2 min (120,000 ms)
}

export function useSessionTimeout(options: SessionTimeoutOptions = {}) {
  const {
    idleTimeoutMs = 30 * 60 * 1000,
    warningBeforeMs = 2 * 60 * 1000,
  } = options;

  const { isAuthenticated, logout, lastActivity, setLastActivity } = useAuthStore();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const warningTimeMs = idleTimeoutMs - warningBeforeMs;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    if (!isAuthenticated) return;
    setLastActivity(Date.now());
    if (showWarning) {
      setShowWarning(false);
    }
  }, [isAuthenticated, setLastActivity, showWarning]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const throttleDelay = 5000; // Throttle activity updates to once every 5 seconds
    let lastThrottledTime = Date.now();

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledTime > throttleDelay) {
        lastThrottledTime = now;
        resetActivity();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [isAuthenticated, resetActivity]);

  // Session check interval every 5 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;

      if (elapsed >= idleTimeoutMs) {
        // Log out immediately
        setShowWarning(false);
        logout();
      } else if (elapsed >= warningTimeMs) {
        // Show warning modal and update remaining countdown
        setShowWarning(true);
        const remaining = Math.max(0, Math.floor((idleTimeoutMs - elapsed) / 1000));
        setSecondsRemaining(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, lastActivity, idleTimeoutMs, warningTimeMs, logout]);

  const extendSession = () => {
    resetActivity();
    setShowWarning(false);
  };

  return {
    showWarning,
    secondsRemaining,
    extendSession,
    logoutNow: logout,
  };
}
