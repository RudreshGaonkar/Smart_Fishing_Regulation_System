import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-ocean-50"><div className="animate-pulse text-ocean-500 font-bold">Verifying Session...</div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="clay-card p-10 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-red-600 mb-2">403 Forbidden</h2>
          <p className="text-slate-600 font-medium">You do not have permission to access this resource.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
