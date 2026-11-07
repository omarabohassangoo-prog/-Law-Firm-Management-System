/**
 * PublicRoute Guard
 * Redirects authenticated users to their designated role dashboard
 */

import React from 'react';
import { useAuthStore, ROLE_ROUTE_MAP } from '../store/auth.store';
import { useAppStore } from '../store/appStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { setCurrentView } = useAppStore();

  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, user?.role, setCurrentView]);

  if (isAuthenticated && user?.role) {
    return null;
  }

  return <>{children}</>;
};
