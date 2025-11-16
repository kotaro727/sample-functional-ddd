import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@presentation/ui/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // 未認証の場合はログインページにリダイレクト
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
